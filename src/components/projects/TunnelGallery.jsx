import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { sanitizeImageUrl } from "../../utils/security";

const TUNNEL_WIDTH = 2.2;
const TUNNEL_HEIGHT = 1.9;
const SEGMENT_DEPTH = 1.1;
const NUM_SEGMENTS = 14;
const LINE_RADIUS = 0.0035;
const SCROLL_TO_Z = 0.055;
const FADE_IN = 0.8;
const FOG_FAR = NUM_SEGMENTS * SEGMENT_DEPTH * 0.95;

const BASE_FOV = 48;
const WARP_FOV = 86;
const SLOWMO_FOV = 44;
const SLOWMO_FACTOR = 0.03; // hover/brake holds the slab almost still (was 0.16)
const INNER_STAR_COUNT = 85;
const OUTER_STAR_COUNT = 280;
const STAR_COUNT = INNER_STAR_COUNT + OUTER_STAR_COUNT;
const OUTER_DEPTH = 28;
const SLAB_REST_COLOR = new THREE.Color("#b5b0aa");
const SLAB_LIT_COLOR = new THREE.Color("#ffffff");

const FALLBACK_PALETTE = ["#dc2626", "#991b1b", "#ef4444", "#7f1d1d", "#450a0a"];

const COLOR_CRUISE = new THREE.Color("#dc2626");
const COLOR_ACCEL = new THREE.Color("#ef4444");
const COLOR_LIGHTSPEED = new THREE.Color("#fca5a5");

// Base classes for the status label; every state keeps these so it stays hidden on phones
const STATUS_BASE = "hidden sm:inline text-[11px] tracking-wider";

// Space/arrow keys must never be hijacked from buttons, links or form fields
const INTERACTIVE_SELECTOR =
    'button, a, input, textarea, select, [role="button"], [contenteditable="true"]';

/** Builds a radial-gradient CanvasTexture for crisp star dots and the vanishing-point nebula. */
function createRadialTexture(size, stops) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    for (const [offset, color] of stops) grad.addColorStop(offset, color);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

/** Builds a thick, crisp 4-bar wireframe border group so targeted slabs stand out clearly on all GPUs. */
function createHighlightFrame(w, h, thickness, material) {
    const group = new THREE.Group();
    const hBarGeo = new THREE.PlaneGeometry(w, thickness);
    const vBarGeo = new THREE.PlaneGeometry(thickness, h);

    const top = new THREE.Mesh(hBarGeo, material);
    top.position.set(0, h / 2 - thickness / 2, 0);
    const bottom = new THREE.Mesh(hBarGeo, material);
    bottom.position.set(0, -h / 2 + thickness / 2, 0);
    const left = new THREE.Mesh(vBarGeo, material);
    left.position.set(-w / 2 + thickness / 2, 0, 0);
    const right = new THREE.Mesh(vBarGeo, material);
    right.position.set(w / 2 - thickness / 2, 0, 0);

    group.add(top, bottom, left, right);
    group.userData.geos = [hBarGeo, vBarGeo];
    return group;
}

const TunnelGallery = ({
    projects = [],
    onSelectProject,
    className = "",
    speed = 45,
    paused = false,
    onUnsupported,
}) => {
    const frameRef = useRef(null);
    const canvasRef = useRef(null);
    const cursorRef = useRef(null);
    const pressedRef = useRef(false);
    const labelRef = useRef(null);
    const typeRef = useRef(null);
    const descRef = useRef(null);
    const hintRef = useRef(null);
    const speedGaugeRef = useRef(null);
    const depthGaugeRef = useRef(null);
    const statusGaugeRef = useRef(null);
    const vignetteRef = useRef(null);
    const [failed, setFailed] = useState(false);

    // Extract image URLs and project mapping
    const validProjects = useMemo(() => {
        return (projects ?? []).filter((p) => p && (p.imageUrl || p.title));
    }, [projects]);

    // Pair each image with the index of the project it belongs to, so a
    // project without an image can't shift the index of every later one.
    const entries = useMemo(
        () =>
            validProjects
                .map((p, i) => ({ url: sanitizeImageUrl(p.imageUrl), projectIndex: i }))
                .filter((e) => e.url),
        [validProjects]
    );

    const baseSpeedRef = useRef(0.45);
    baseSpeedRef.current = Math.max(0.1, speed / 100);

    // Always call the latest callback without rebuilding the WebGL scene
    // whenever the parent passes a new function identity.
    const selectRef = useRef(onSelectProject);
    selectRef.current = onSelectProject;

    const unsupportedRef = useRef(onUnsupported);
    unsupportedRef.current = onUnsupported;

    // Rendering pauses while offscreen or covered by the detail view
    const pausedRef = useRef(paused);
    pausedRef.current = paused;
    const wakeRef = useRef(null);
    useEffect(() => {
        // Opening the detail view must never leave Hyperspace latched on
        if (paused) pressedRef.current = false;
        wakeRef.current?.();
    }, [paused]);

    useEffect(() => {
        const frame = frameRef.current;
        const canvas = canvasRef.current;
        if (!frame || !canvas) return;

        const scene = new THREE.Scene();
        const bgColor = new THREE.Color("#0c0a09");
        scene.background = bgColor;

        const fogNear = FOG_FAR * 0.25;
        scene.fog = new THREE.Fog(bgColor, fogNear, FOG_FAR);

        const camera = new THREE.PerspectiveCamera(BASE_FOV, 1, 0.2, 1000);
        camera.position.set(0, 0, 0);

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
            });
        } catch (err) {
            console.warn("WebGL unavailable:", err);
            setFailed(true);
            unsupportedRef.current?.();
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const onContextLost = (e) => {
            e.preventDefault();
            setFailed(true);
            unsupportedRef.current?.();
        };
        canvas.addEventListener("webglcontextlost", onContextLost);

        const lineMaterial = new THREE.MeshBasicMaterial({
            color: COLOR_CRUISE.clone(),
            transparent: true,
            opacity: 0.45,
        });

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        const fading = [];

        let imageIndex = 0;
        let colorIndex = 0;
        let populateIndex = 0;
        let raf = 0;
        let last = 0;
        let alive = true;
        let visible = true;

        // Progressive Hyperspace & Time Dilation physics state
        const baseSpeed = baseSpeedRef.current;
        const maxVisualSpeed = 2.65;
        let warpLevel = 0;       // 0 = cruise, ramping smoothly up to 1.0 (1.00 c Lightspeed)
        let visualSpeed = baseSpeed;
        let currentFov = BASE_FOV;
        let wheelImpulse = 0;
        let smoothScrollKms = 0;
        let distLy = 0;

        // Hover / Time Dilation lock with sticky grace period to eliminate flicker
        let slowMoGrace = 0;
        let manualBrake = false;
        let lastHudUpdate = 0;

        const mouseNorm = { x: 0, y: 0 };
        const targetMouseNorm = { x: 0, y: 0 };

        const hw = TUNNEL_WIDTH / 2;
        const hh = TUNNEL_HEIGHT / 2;

        const cols = 4;
        const rows = 3;
        const colW = TUNNEL_WIDTH / cols;
        const rowH = TUNNEL_HEIGHT / rows;

        const geoFloor = new THREE.PlaneGeometry(colW, SEGMENT_DEPTH);
        const geoWall = new THREE.PlaneGeometry(SEGMENT_DEPTH, rowH);

        // High-visibility perimeter borders for targeted slabs
        const highlightMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color("#faf8f5"),
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
        });
        const highlightFloor = createHighlightFrame(colW, SEGMENT_DEPTH, 0.024, highlightMat);
        const highlightWall = createHighlightFrame(SEGMENT_DEPTH, rowH, 0.024, highlightMat);
        highlightFloor.visible = false;
        highlightWall.visible = false;

        // 360-degree deep-space starfield (inner corridor + outer surrounding cosmos behind open grid windows)
        const starTex = createRadialTexture(32, [
            [0, "rgba(255, 255, 255, 1)"],
            [0.35, "rgba(250, 248, 245, 0.8)"],
            [0.75, "rgba(220, 38, 38, 0.15)"],
            [1, "rgba(0, 0, 0, 0)"],
        ]);

        const placeStar = (s, initial) => {
            if (s.isOuter) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 2.2 + Math.random() * 14.0;
                s.x = Math.cos(angle) * radius * 1.15;
                s.y = Math.sin(angle) * radius;
                s.zOffset = initial
                    ? -1.5 - Math.random() * OUTER_DEPTH
                    : -OUTER_DEPTH + Math.random() * 4;
                // Closer outer stars parallax faster than distant background stars
                s.speedMul = Math.max(0.12, 0.75 - (radius - 2.2) / 22);
                s.depthScale = 0.55 + 0.45 * (1 - (radius - 2.2) / 14.0);
            } else {
                s.x = (Math.random() - 0.5) * TUNNEL_WIDTH * 0.82;
                s.y = (Math.random() - 0.5) * TUNNEL_HEIGHT * 0.82;
                s.zOffset = initial
                    ? -FOG_FAR * (0.35 + Math.random() * 0.8)
                    : -FOG_FAR * (0.75 + Math.random() * 0.4);
                s.speedMul = 0.35 + Math.random() * 0.45;
                s.depthScale = 0.85;
            }
        };

        const starSeeds = Array.from({ length: STAR_COUNT }, (_, i) => {
            const s = {
                isOuter: i >= INNER_STAR_COUNT,
                x: 0,
                y: 0,
                zOffset: 0,
                speedMul: 0.4,
                depthScale: 1,
                phase: Math.random() * Math.PI * 2,
                tint: Math.random() > 0.3 ? 1 : 0, // 1 = cream star, 0 = red dwarf
            };
            placeStar(s, true);
            return s;
        });

        const starPositions = new Float32Array(STAR_COUNT * 3);
        const starColors = new Float32Array(STAR_COUNT * 3);
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
        const starMat = new THREE.PointsMaterial({
            map: starTex,
            size: 3.0,
            transparent: true,
            opacity: 0.75,
            vertexColors: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: false,
            fog: false,
        });
        const starPoints = new THREE.Points(starGeo, starMat);
        starPoints.renderOrder = 5;
        scene.add(starPoints);

        // Warp streaks (hidden at idle drift; stretch dynamically during Hyperspace)
        const streakPositions = new Float32Array(STAR_COUNT * 2 * 3);
        const streakGeo = new THREE.BufferGeometry();
        streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
        const streakMat = new THREE.LineBasicMaterial({
            color: new THREE.Color("#fca5a5"),
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
        });
        const streakMesh = new THREE.LineSegments(streakGeo, streakMat);
        streakMesh.visible = false;
        streakMesh.renderOrder = 5;
        scene.add(streakMesh);

        // Vanishing-point singularity / crimson nebula horizon ahead
        const nebulaTex = createRadialTexture(256, [
            [0, "rgba(252, 165, 165, 0.38)"],
            [0.2, "rgba(220, 38, 38, 0.3)"],
            [0.5, "rgba(127, 29, 29, 0.12)"],
            [1, "rgba(12, 10, 9, 0)"],
        ]);
        const singularityMat = new THREE.SpriteMaterial({
            map: nebulaTex,
            transparent: true,
            opacity: 0.42,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            fog: false,
        });
        const singularitySprite = new THREE.Sprite(singularityMat);
        singularitySprite.scale.set(1.9, 1.9, 1);
        singularitySprite.renderOrder = 5;
        scene.add(singularitySprite);

        const geoTubeZ = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, -SEGMENT_DEPTH)
            ),
            1,
            LINE_RADIUS,
            6
        );
        const geoTubeX = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(TUNNEL_WIDTH, 0, 0)
            ),
            1,
            LINE_RADIUS,
            6
        );
        const geoTubeY = new THREE.TubeGeometry(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, TUNNEL_HEIGHT, 0)
            ),
            1,
            LINE_RADIUS,
            6
        );

        // Delicate glowing diode dots at each wireframe grid intersection
        const nodeVertices = [];
        for (let i = 0; i <= cols; i++) {
            const x = -hw + i * colW;
            nodeVertices.push(x, -hh, 0, x, hh, 0);
        }
        for (let i = 1; i < rows; i++) {
            const y = -hh + i * rowH;
            nodeVertices.push(-hw, y, 0, hw, y, 0);
        }
        const geoNodes = new THREE.BufferGeometry();
        geoNodes.setAttribute("position", new THREE.Float32BufferAttribute(nodeVertices, 3));
        const nodeMat = new THREE.PointsMaterial({
            map: starTex,
            color: new THREE.Color("#fca5a5"),
            size: 0.052,
            transparent: true,
            opacity: 0.65,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        const colorMats = FALLBACK_PALETTE.map(
            (hex) =>
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(hex),
                    side: THREE.DoubleSide,
                })
        );

        const imageMats = entries.map(({ url, projectIndex }) => {
            const mat = new THREE.MeshBasicMaterial({
                color: SLAB_REST_COLOR.clone(),
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
            });
            loader.load(
                url,
                (tex) => {
                    if (!alive) {
                        tex.dispose();
                        return;
                    }
                    tex.minFilter = THREE.LinearFilter;
                    tex.generateMipmaps = false;
                    tex.colorSpace = THREE.SRGBColorSpace;
                    mat.map = tex;
                    mat.needsUpdate = true;
                    fading.push(mat);
                },
                undefined,
                () => {}
            );
            mat.userData = { projectIndex };
            return mat;
        });

        const tube = (geo, x, y, z = 0) => {
            const m = new THREE.Mesh(geo, lineMaterial);
            m.position.set(x, y, z);
            return m;
        };

        const SLOTS = [];
        {
            const z = -SEGMENT_DEPTH / 2;
            for (let i = 0; i < cols; i++) {
                const x = -hw + i * colW + colW / 2;
                SLOTS.push({
                    geo: geoFloor,
                    pos: new THREE.Vector3(x, -hh, z),
                    rot: new THREE.Euler(-Math.PI / 2, 0, 0),
                });
                SLOTS.push({
                    geo: geoFloor,
                    pos: new THREE.Vector3(x, hh, z),
                    rot: new THREE.Euler(Math.PI / 2, 0, 0),
                });
            }
            for (let i = 0; i < rows; i++) {
                const y = -hh + i * rowH + rowH / 2;
                SLOTS.push({
                    geo: geoWall,
                    pos: new THREE.Vector3(-hw, y, z),
                    rot: new THREE.Euler(0, Math.PI / 2, 0),
                });
                SLOTS.push({
                    geo: geoWall,
                    pos: new THREE.Vector3(hw, y, z),
                    rot: new THREE.Euler(0, -Math.PI / 2, 0),
                });
            }
        }

        let litMat = null;
        const clearHighlight = () => {
            highlightFloor.visible = false;
            highlightWall.visible = false;
            if (litMat) {
                litMat.color.copy(SLAB_REST_COLOR);
                litMat = null;
            }
        };

        const populate = (group) => {
            const takesSlabs = populateIndex % 2 === 0;
            populateIndex++;
            const slabs = group.userData.slabs;

            for (const slab of slabs) {
                if (highlightFloor.parent === slab) highlightFloor.visible = false;
                if (highlightWall.parent === slab) highlightWall.visible = false;

                if (!takesSlabs || Math.random() > 0.52) {
                    slab.visible = false;
                    continue;
                }
                slab.visible = true;
                if (Math.random() > 0.25 && imageMats.length > 0) {
                    const matIdx = imageIndex % imageMats.length;
                    slab.material = imageMats[matIdx];
                    slab.userData = {
                        projectIndex: entries[matIdx].projectIndex,
                    };
                    imageIndex++;
                } else {
                    slab.material = colorMats[colorIndex % colorMats.length];
                    slab.userData = { projectIndex: null };
                    colorIndex++;
                }
            }
        };

        const createSegment = (z) => {
            const group = new THREE.Group();
            group.position.z = z;

            for (let i = 0; i <= cols; i++) {
                const x = -hw + i * colW;
                group.add(tube(geoTubeZ, x, -hh));
                group.add(tube(geoTubeZ, x, hh));
            }
            for (let i = 1; i < rows; i++) {
                const y = -hh + i * rowH;
                group.add(tube(geoTubeZ, -hw, y));
                group.add(tube(geoTubeZ, hw, y));
            }
            group.add(tube(geoTubeX, -hw, -hh));
            group.add(tube(geoTubeX, -hw, hh));
            group.add(tube(geoTubeY, -hw, -hh));
            group.add(tube(geoTubeY, hw, -hh));
            group.add(new THREE.Points(geoNodes, nodeMat));

            const slabs = SLOTS.map((slot) => {
                const m = new THREE.Mesh(slot.geo, colorMats[0]);
                m.position.copy(slot.pos);
                m.rotation.copy(slot.rot);
                m.visible = false;
                group.add(m);
                return m;
            });
            group.userData.slabs = slabs;

            populate(group);
            return group;
        };

        const segments = [];
        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const g = createSegment(-i * SEGMENT_DEPTH);
            scene.add(g);
            segments.push(g);
        }

        const resize = () => {
            const w = Math.max(1, frame.clientWidth);
            const h = Math.max(1, frame.clientHeight);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        const ro = new ResizeObserver(resize);
        ro.observe(frame);
        resize();

        const animate = (now) => {
            if (!alive) return;
            if (!visible || pausedRef.current) {
                raf = 0;
                return;
            }
            raf = requestAnimationFrame(animate);
            const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
            last = now;

            const curBase = baseSpeedRef.current;
            const isBoosting = pressedRef.current;

            if (slowMoGrace > 0) {
                slowMoGrace = Math.max(0, slowMoGrace - dt);
            }
            const isSlowMo = !isBoosting && (slowMoGrace > 0 || manualBrake);

            // Progressive Hyperspace throttle ramp (0 -> 1 over ~3.4s hold, smooth inertial coast over ~3.2s)
            if (isBoosting) {
                warpLevel = Math.min(1, warpLevel + dt / 3.4);
            } else {
                const bleedRate = isSlowMo ? dt * 3.0 : dt / 3.2;
                warpLevel = Math.max(0, warpLevel - bleedRate);
            }

            // Target speed with direct damping (no queued chase lag blocking slow-mo!)
            const warpEase = warpLevel * warpLevel * (3 - 2 * warpLevel); // smoothstep
            const targetSpeed = isSlowMo
                ? curBase * SLOWMO_FACTOR
                : curBase + warpEase * (maxVisualSpeed - curBase);

            const accelResponse = isSlowMo ? 12 : isBoosting ? 5.5 : 2.4;
            visualSpeed += (targetSpeed - visualSpeed) * Math.min(1, dt * accelResponse);

            // Effective Z velocity: forward cruise + scroll wheel impulse (negative Z is forward)
            const netZRate = (SCROLL_TO_Z * visualSpeed) + wheelImpulse;
            camera.position.z -= netZRate * dt * 60;
            wheelImpulse *= Math.pow(0.02, dt);
            if (Math.abs(wheelImpulse) < 0.0001) wheelImpulse = 0;

            // Scroll velocity telemetry in KM/S (1 cruise visualSpeed unit = 100 KM/S = SCROLL_TO_Z units of travel)
            const instantScrollKms = (wheelImpulse / SCROLL_TO_Z) * 100;
            smoothScrollKms += (instantScrollKms - smoothScrollKms) * Math.min(1, dt * 12);
            if (Math.abs(smoothScrollKms) < 0.5) smoothScrollKms = 0;

            // Normalized warp factor derived from actual smoothed velocity (0 = cruise, 1 = lightspeed)
            const t = Math.max(0, Math.min(1, (visualSpeed - curBase) / (maxVisualSpeed - curBase)));
            const cFraction = Math.pow(t, 3.0);

            // Accumulate cosmic distance in Light-Years (forward increases, backward rewinds smoothly)
            const travelFactor = isBoosting && cFraction > 0.01
                ? cFraction * 0.16
                : (netZRate / SCROLL_TO_Z) * 0.0025;
            distLy = Math.max(0, distLy + travelFactor * dt);

            // Speed-coupled FOV warp tunnel stretch
            const targetFov = isSlowMo && t < 0.05
                ? SLOWMO_FOV
                : BASE_FOV + Math.pow(t, 0.85) * (WARP_FOV - BASE_FOV);
            currentFov += (targetFov - currentFov) * Math.min(1, dt * 6);
            if (Math.abs(camera.fov - currentFov) > 0.05) {
                camera.fov = currentFov;
                camera.updateProjectionMatrix();
            }

            // Thermal wireframe rail shift: Crimson -> Neon Red -> Lightspeed Core
            if (t < 0.5) {
                lineMaterial.color.copy(COLOR_CRUISE).lerp(COLOR_ACCEL, t * 2);
            } else {
                lineMaterial.color.copy(COLOR_ACCEL).lerp(COLOR_LIGHTSPEED, (t - 0.5) * 2);
            }
            const targetLineOpacity = isSlowMo ? 0.34 : 0.45 + t * 0.5;
            lineMaterial.opacity += (targetLineOpacity - lineMaterial.opacity) * Math.min(1, dt * 8);
            nodeMat.opacity = lineMaterial.opacity + 0.18;

            // Update 360-degree deep-space starfield & relativistic warp streaks
            starPoints.position.z = camera.position.z;
            streakMesh.position.z = camera.position.z;

            const showStreaks = t > 0.03;
            streakMesh.visible = showStreaks;
            streakMat.opacity = showStreaks ? Math.min(0.85, (t - 0.03) * 1.1) : 0;
            starMat.opacity = Math.max(0.25, 0.78 - t * 0.45);
            starMat.size = Math.max(1.8, 3.0 - t * 1.0);

            const streakLen = Math.pow(Math.max(0, t - 0.03), 1.3) * 2.5;
            const netForward = visualSpeed + (wheelImpulse / SCROLL_TO_Z);
            const starAdvance = (netForward * 1.2 + t * 14) * dt;

            for (let i = 0; i < STAR_COUNT; i++) {
                const s = starSeeds[i];
                s.zOffset += starAdvance * s.speedMul;
                if (s.zOffset > 0.4) {
                    placeStar(s, false);
                } else if (s.zOffset < -OUTER_DEPTH) {
                    s.zOffset = 0.35;
                }

                const pIdx = i * 3;
                starPositions[pIdx] = s.x;
                starPositions[pIdx + 1] = s.y;
                starPositions[pIdx + 2] = s.zOffset;

                // Twinkle, depth scale, & soft fade near camera so foreground stars never pop harshly
                const nearFade = Math.min(1, Math.max(0, (-s.zOffset - 0.6) / 3.0));
                const twinkle = (0.55 + 0.45 * Math.sin(now * 0.003 + s.phase)) * nearFade * s.depthScale;
                if (s.tint) {
                    starColors[pIdx] = 0.98 * twinkle;
                    starColors[pIdx + 1] = 0.97 * twinkle;
                    starColors[pIdx + 2] = 0.96 * twinkle;
                } else {
                    starColors[pIdx] = 0.95 * twinkle;
                    starColors[pIdx + 1] = 0.42 * twinkle;
                    starColors[pIdx + 2] = 0.42 * twinkle;
                }

                if (showStreaks) {
                    const lIdx = i * 6;
                    streakPositions[lIdx] = s.x;
                    streakPositions[lIdx + 1] = s.y;
                    streakPositions[lIdx + 2] = s.zOffset;
                    streakPositions[lIdx + 3] = s.x;
                    streakPositions[lIdx + 4] = s.y;
                    streakPositions[lIdx + 5] = s.zOffset - streakLen * (s.isOuter ? 0.85 : 1.0);
                }
            }
            starGeo.attributes.position.needsUpdate = true;
            starGeo.attributes.color.needsUpdate = true;
            if (showStreaks) streakGeo.attributes.position.needsUpdate = true;

            // Vanishing-point singularity / crimson nebula glow
            singularitySprite.position.set(
                mouseNorm.x * 0.06,
                -mouseNorm.y * 0.045,
                camera.position.z - FOG_FAR * 1.04
            );
            const nebPulse = 1 + Math.sin(now * 0.0022) * 0.06 + t * 0.55;
            singularitySprite.scale.set(1.9 * nebPulse, 1.9 * nebPulse, 1);
            singularityMat.opacity = 0.42 + t * 0.45;

            // Dynamic peripheral speed vignette
            if (vignetteRef.current) {
                vignetteRef.current.style.opacity = String((0.35 + t * 0.55).toFixed(2));
            }

            // Flight Drone Banking & Parallax + subtle sub-light engine vibration
            mouseNorm.x += (targetMouseNorm.x - mouseNorm.x) * Math.min(1, dt * 6);
            mouseNorm.y += (targetMouseNorm.y - mouseNorm.y) * Math.min(1, dt * 6);

            const rumbleIntensity = t > 0.1 && t < 0.98 ? Math.sin(t * Math.PI) * 0.008 : 0;
            const rumbleX = rumbleIntensity ? Math.sin(now * 0.045) * rumbleIntensity : 0;
            const rumbleY = rumbleIntensity ? Math.cos(now * 0.057) * rumbleIntensity : 0;

            camera.position.x = mouseNorm.x * 0.24 + rumbleX;
            camera.position.y = -mouseNorm.y * 0.18 + rumbleY;
            camera.rotation.z = -mouseNorm.x * 0.09;
            camera.rotation.y = -mouseNorm.x * 0.07;
            camera.rotation.x = -mouseNorm.y * 0.06;

            // Recycle tunnel segments with deterministic modulo wrap
            // Guarantees all segments stay in a continuous, unbroken ring covering [camZ - span + SEGMENT_DEPTH, camZ + SEGMENT_DEPTH]
            const span = NUM_SEGMENTS * SEGMENT_DEPTH;
            const camZ = camera.position.z;
            for (const seg of segments) {
                while (seg.position.z > camZ + SEGMENT_DEPTH) {
                    seg.position.z -= span;
                    populate(seg);
                }
                while (seg.position.z < camZ - span + SEGMENT_DEPTH) {
                    seg.position.z += span;
                    populate(seg);
                }
            }

            for (let i = fading.length - 1; i >= 0; i--) {
                const m = fading[i];
                m.opacity = Math.min(1, m.opacity + dt / FADE_IN);
                if (m.opacity >= 1) {
                    m.transparent = false;
                    m.needsUpdate = true;
                    fading.splice(i, 1);
                }
            }

            renderer.render(scene, camera);

            // Telemetry HUD update (~15 Hz throttle for lively number climb)
            const perfNow = performance.now();
            if (perfNow - lastHudUpdate > 65) {
                lastHudUpdate = perfNow;

                if (depthGaugeRef.current) {
                    depthGaugeRef.current.textContent = `DIST ${distLy.toFixed(2)} LY`;
                }

                if (speedGaugeRef.current && statusGaugeRef.current) {
                    if (t <= 0.004) {
                        const netKms = Math.round(visualSpeed * 100 + smoothScrollKms);
                        if (isSlowMo) {
                            speedGaugeRef.current.textContent = `${Math.max(1, netKms)} KM/S`;
                            statusGaugeRef.current.textContent = "TIME DILATION";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-amber-400 font-bold`;
                        } else if (netKms < -10) {
                            // Moving backwards from backward scroll
                            speedGaugeRef.current.textContent = `${Math.abs(netKms)} KM/S`;
                            statusGaugeRef.current.textContent = "RETRO-THRUST";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-amber-400 font-semibold`;
                        } else if (smoothScrollKms > 15) {
                            // Forward manual scroll impulse
                            speedGaugeRef.current.textContent = `${netKms} KM/S`;
                            statusGaugeRef.current.textContent = "MANUAL IMPULSE";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-red-300 font-semibold`;
                        } else if (smoothScrollKms < -10) {
                            // Reverse braking while net motion is still forward
                            speedGaugeRef.current.textContent = `${Math.max(0, netKms)} KM/S`;
                            statusGaugeRef.current.textContent = "REVERSE BRAKING";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-amber-300 font-semibold`;
                        } else {
                            speedGaugeRef.current.textContent = `${Math.max(1, netKms)} KM/S`;
                            statusGaugeRef.current.textContent = "ORBITAL DRIFT";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-stone-400`;
                        }
                    } else if (cFraction < 0.05) {
                        const kms = Math.round(45 + cFraction * 299747 + Math.max(0, smoothScrollKms));
                        speedGaugeRef.current.textContent = `${kms.toLocaleString()} KM/S`;
                        if (!isBoosting) {
                            statusGaugeRef.current.textContent = "INERTIAL COAST";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-stone-300 font-semibold`;
                        } else {
                            statusGaugeRef.current.textContent = kms < 600 ? "THRUSTERS ENGAGED" : "SUB-LIGHT ACCEL";
                            statusGaugeRef.current.className = `${STATUS_BASE} text-red-300 font-semibold`;
                        }
                    } else if (cFraction < 0.99) {
                        speedGaugeRef.current.textContent = `${cFraction.toFixed(2)} c`;
                        statusGaugeRef.current.textContent = "RELATIVISTIC";
                        statusGaugeRef.current.className = `${STATUS_BASE} text-red-400 font-bold`;
                    } else {
                        speedGaugeRef.current.textContent = "1.00 c";
                        statusGaugeRef.current.textContent = "HYPERSPACE";
                        statusGaugeRef.current.className = `${STATUS_BASE} text-cream font-bold animate-pulse motion-reduce:animate-none`;
                    }
                }
            }

            if (touchLock && perfNow > touchLockExpiry) releaseTouchLock();
            if (hoverPoint && perfNow - lastHoverCheck > 35) updateHover();
        };
        raf = requestAnimationFrame(animate);

        const wake = () => {
            if (alive && !raf && visible && !pausedRef.current) {
                last = 0;
                raf = requestAnimationFrame(animate);
            }
        };
        wakeRef.current = wake;
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) wake();
        });
        io.observe(frame);

        let pressStart = 0;

        // Raycasting for clicking & targeting project slabs
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        // Which project & slab mesh (if any) is under this screen point?
        const pickHit = (clientX, clientY) => {
            const rect = frame.getBoundingClientRect();
            pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            camera.updateMatrixWorld();
            raycaster.setFromCamera(pointer, camera);
            const visibleSlabs = [];
            for (const seg of segments) {
                for (const slab of seg.userData.slabs) {
                    if (slab.visible) visibleSlabs.push(slab);
                }
            }

            const hit = raycaster.intersectObjects(visibleSlabs)[0]?.object;
            const pIdx = hit?.userData?.projectIndex;
            const project = pIdx !== undefined && pIdx !== null ? validProjects[pIdx] || null : null;
            return project ? { project, slab: hit } : null;
        };

        let lastPointerType = "mouse";
        let touchLock = null;
        let touchLockExpiry = 0;

        const releaseTouchLock = () => {
            touchLock = null;
            hoverPoint = null;
            updateHover();
        };

        const handleClick = (e) => {
            // A long press means "hyperspace", not "select"
            if (performance.now() - pressStart > 250) return;
            const hit = pickHit(e.clientX, e.clientY);

            if (lastPointerType === "touch") {
                // Touch has no hover: the first tap locks a slab (near-stop + preview), the second opens it
                if (!hit?.project) {
                    releaseTouchLock();
                } else if (touchLock === hit.project) {
                    releaseTouchLock();
                    selectRef.current?.(hit.project);
                } else {
                    touchLock = hit.project;
                    touchLockExpiry = performance.now() + 5000;
                    hoverPoint = { x: e.clientX, y: e.clientY };
                    updateHover();
                    positionCard(e.clientX, e.clientY);
                }
                return;
            }

            if (hit?.project) selectRef.current?.(hit.project);
        };

        const applyCursorTransform = (el) => {
            const flipX = el.dataset.flipX === "1";
            const flipY = el.dataset.flipY === "1";
            const scale = pressedRef.current ? 0.92 : 1;
            el.style.transform = `translate(${flipX ? "calc(-100% - 14px)" : "14px"}, ${flipY ? "20px" : "calc(-100% - 12px)"}) scale(${scale})`;
        };

        // Place the preview card next to a screen point, flipping so it never leaves the frame
        const positionCard = (clientX, clientY) => {
            const el = cursorRef.current;
            if (!el) return;
            const rect = frame.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            const sx = frame.clientWidth / rect.width;
            const sy = frame.clientHeight / rect.height;
            el.style.left = `${(clientX - rect.left) * sx}px`;
            el.style.top = `${(clientY - rect.top) * sy}px`;
            el.dataset.flipX = rect.width - (clientX - rect.left) < 300 ? "1" : "0";
            el.dataset.flipY = clientY - rect.top < 160 ? "1" : "0";
            applyCursorTransform(el);
        };

        const setText = (ref, text) => {
            const node = ref.current;
            if (!node) return;
            node.textContent = text;
            node.style.display = text ? "" : "none";
        };

        // Hover: the slab under the pointer is held almost still (180ms sticky grace to avoid flicker)
        // and a preview card appears.
        let hoverPoint = null;
        let lastHoverCheck = 0;
        let hoverProject = null;
        const updateHover = () => {
            lastHoverCheck = performance.now();
            const hit = hoverPoint && !pressedRef.current ? pickHit(hoverPoint.x, hoverPoint.y) : null;
            const project = hit?.project || null;
            const slab = hit?.slab || null;

            if (project) {
                slowMoGrace = 0.18;
            }

            clearHighlight();
            if (slab) {
                if (slab.material) {
                    slab.material.color.copy(SLAB_LIT_COLOR);
                    litMat = slab.material;
                }
                const frameGroup = slab.geometry === geoFloor ? highlightFloor : highlightWall;
                if (frameGroup.parent !== slab) {
                    slab.add(frameGroup);
                    frameGroup.position.set(0, 0, 0.008);
                    frameGroup.rotation.set(0, 0, 0);
                }
                frameGroup.visible = true;
            }

            if (project === hoverProject) return;
            hoverProject = project;

            if (project) {
                setText(labelRef, project.title || "Untitled project");
                setText(typeRef, project.type || "");
                setText(descRef, project.shortDescription || project.description || "");
                setText(hintRef, lastPointerType === "touch" ? "Tap again to open ↗" : "Click to open ↗");
            }
            if (cursorRef.current) {
                cursorRef.current.style.opacity = project ? "1" : "0";
            }
            frame.style.cursor = project ? "pointer" : "";
        };

        const onMove = (e) => {
            if (e.pointerType !== "touch") {
                hoverPoint = { x: e.clientX, y: e.clientY };
                if (performance.now() - lastHoverCheck > 30) updateHover();
            }

            const rect = frame.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                targetMouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                // Was "+ 1": that tilted the camera whenever the cursor was vertically centred
                targetMouseNorm.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            }

            if (e.pointerType !== "touch") positionCard(e.clientX, e.clientY);
        };

        const onEnter = () => {};

        const onLeave = (e) => {
            if (e?.pointerType === "touch") {
                pressedRef.current = false;
                return;
            }
            hoverPoint = null;
            slowMoGrace = 0;
            manualBrake = false;
            targetMouseNorm.x = 0;
            targetMouseNorm.y = 0;
            clearHighlight();
            updateHover();
            pressedRef.current = false;
            const el = cursorRef.current;
            if (el) {
                el.style.opacity = "0";
                applyCursorTransform(el);
            }
        };

        const onDown = (e) => {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            pressStart = performance.now();
            lastPointerType = e.pointerType;
            pressedRef.current = true;
            updateHover();
            const el = cursorRef.current;
            if (el) applyCursorTransform(el);
        };

        const onUp = () => {
            pressedRef.current = false;
            const el = cursorRef.current;
            if (el) applyCursorTransform(el);
        };

        const onWheel = (e) => {
            e.preventDefault();
            const impulse = e.deltaY * 0.0028;
            wheelImpulse = Math.max(-0.6, Math.min(0.8, wheelImpulse + impulse));
        };

        // Flight simulator key bindings (Space / ArrowUp / W for Hyperspace, ArrowDown / S for Time Dilation)
        const onKeyDown = (e) => {
            // Inactive while the detail view is open, and never steal keys from buttons, links or fields
            if (pausedRef.current || e.target?.closest?.(INTERACTIVE_SELECTOR)) return;
            if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
                if (e.code === "Space") e.preventDefault();
                pressedRef.current = true;
            } else if (e.code === "ArrowDown" || e.code === "KeyS") {
                manualBrake = true;
            }
        };

        // Not gated: a release must always be seen, or a key could latch on
        const onKeyUp = (e) => {
            if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
                pressedRef.current = false;
            } else if (e.code === "ArrowDown" || e.code === "KeyS") {
                manualBrake = false;
            }
        };

        // If the window loses focus mid-press, keyup never arrives; release everything
        const releaseAll = () => {
            pressedRef.current = false;
            manualBrake = false;
        };

        frame.addEventListener("pointermove", onMove);
        frame.addEventListener("pointerenter", onEnter);
        frame.addEventListener("pointerleave", onLeave);
        frame.addEventListener("pointerdown", onDown);
        frame.addEventListener("click", handleClick);
        frame.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("pointerup", onUp);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("blur", releaseAll);

        return () => {
            alive = false;
            wakeRef.current = null;
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            canvas.removeEventListener("webglcontextlost", onContextLost);
            frame.removeEventListener("pointermove", onMove);
            frame.removeEventListener("pointerenter", onEnter);
            frame.removeEventListener("pointerleave", onLeave);
            frame.removeEventListener("pointerdown", onDown);
            frame.removeEventListener("click", handleClick);
            frame.removeEventListener("wheel", onWheel);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", releaseAll);

            geoFloor.dispose();
            geoWall.dispose();
            for (const g of highlightFloor.userData.geos) g.dispose();
            for (const g of highlightWall.userData.geos) g.dispose();
            highlightMat.dispose();
            starGeo.dispose();
            starMat.dispose();
            starTex.dispose();
            streakGeo.dispose();
            streakMat.dispose();
            nebulaTex.dispose();
            singularityMat.dispose();
            geoTubeZ.dispose();
            geoTubeX.dispose();
            geoTubeY.dispose();
            geoNodes.dispose();
            nodeMat.dispose();
            for (const m of colorMats) m.dispose();
            for (const m of imageMats) {
                m.map?.dispose();
                m.dispose();
            }
            lineMaterial.dispose();
            renderer.dispose();
        };
    }, [entries, validProjects]);

    if (failed) {
        return (
            <div
                className={`relative w-full h-full flex items-center justify-center bg-obsidian px-6 text-center text-sm font-sans text-stone-400 ${className}`}
            >
                The 3D view isn’t available on this device. Try the grid view instead.
            </div>
        );
    }

    return (
        <div
            ref={frameRef}
            className={`relative w-full h-full overflow-hidden bg-obsidian select-none cursor-crosshair ${className}`}
        >
            <canvas ref={canvasRef} className="block w-full h-full" aria-hidden="true" />

            {/* Dynamic peripheral speed vignette (tightens during Hyperspace) */}
            <div
                ref={vignetteRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: 0.35,
                    background: "radial-gradient(circle at center, transparent 45%, rgba(12, 10, 9, 0.88) 100%)",
                }}
            />

            {/* Project preview card: shown when a slab is locked (hover on desktop, first tap on touch) */}
            <div
                ref={cursorRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 w-[min(75vw,17rem)] flex flex-col gap-1 px-4 py-3 rounded-2xl bg-stone-900/95 text-cream border border-red-500/60 shadow-lg shadow-black/80 backdrop-blur-md opacity-0 transition-opacity duration-150"
            >
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none shrink-0" />
                    <span ref={typeRef} className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400 truncate" />
                </div>
                <span ref={labelRef} className="text-sm font-sans font-semibold leading-snug text-cream" />
                <p ref={descRef} className="text-[11px] font-sans leading-relaxed text-stone-400 line-clamp-2" />
                <span ref={hintRef} className="mt-0.5 text-[11px] font-mono text-red-300" />
            </div>

            {/* Flight Cockpit Telemetry HUD */}
            <div className="absolute inset-x-0 bottom-0 px-6 py-4 bg-gradient-to-t from-obsidian via-obsidian/85 to-transparent flex items-end sm:items-center justify-between text-xs font-mono text-stone-400 pointer-events-none select-none z-10 gap-4">
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-stone-900/80 border border-stone-800 shadow-sm min-w-[7.5rem]">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none shrink-0" />
                        <span ref={speedGaugeRef} className="text-cream font-bold tabular-nums">45 KM/S</span>
                    </span>
                    <span ref={statusGaugeRef} className={`${STATUS_BASE} text-stone-400`}>
                        ORBITAL DRIFT
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span ref={depthGaugeRef} className="px-2.5 py-1 rounded-md bg-stone-900/80 border border-stone-800 text-stone-300 shadow-sm text-[11px] tabular-nums">
                        DIST 0.00 LY
                    </span>
                    <span className="hidden md:inline text-stone-500 text-[11px]">
                        Hold click or [Space] for Hyperspace · Hover slab for Time Dilation
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TunnelGallery;