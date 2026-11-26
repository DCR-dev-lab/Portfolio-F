import { useCallback, useEffect, useMemo, useRef } from "react";
import { useMotionValue } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { sanitizeImageUrl } from "../../utils/security";
import ProjectPreviewCard, {
    positionPreviewCard,
    updatePreviewCardText,
} from "./ProjectPreviewCard";

// Hash function for pseudo-random spatial seeding
function hash3(cx, cy, cz, salt) {
    let h = (cx | 0) * 0x8da6b343;
    h ^= Math.imul(cy | 0, 0xd8163841);
    h ^= Math.imul(cz | 0, 0xcb1ab31f);
    h ^= salt | 0;
    h ^= h >>> 16;
    h = Math.imul(h, 0x7feb352d);
    h ^= h >>> 15;
    h = Math.imul(h, 0x846ca68b);
    h ^= h >>> 16;
    return h >>> 0;
}

function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

const PX_PER_UNIT = 6;
const CELL_SIZE = 110;
const MAX_RANGE = 18;
const SCALE_MIN = 0.55;
const SCALE_MAX = 1.45;

const InfiniteCanvas = ({
    projects = [],
    onSelectProject,
    className = "",
    density = 4,
    imageWidth = 190,
    imageHeight = 135,
    dragSpeed = 22,
    driftAmount = 14,
    friction = 10,
    paused = false,
}) => {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const zoomGaugeRef = useRef(null);
    const cardRef = useRef(null);
    const typeRef = useRef(null);
    const labelRef = useRef(null);
    const descRef = useRef(null);
    const hintRef = useRef(null);

    // Always call the latest callback without tearing the scene down
    const selectRef = useRef(onSelectProject);
    selectRef.current = onSelectProject;

    // Rendering pauses while offscreen or covered by the detail view
    const pausedRef = useRef(paused);
    pausedRef.current = paused;
    const wakeRef = useRef(null);
    useEffect(() => {
        wakeRef.current?.();
    }, [paused]);

    const safeProjects = useMemo(() => {
        const list = (projects ?? []).filter((p) => p && (p.imageUrl || p.title));
        if (list.length > 0) return list;
        return [];
    }, [projects]);

    const safeDensity = Math.max(1, Math.min(10, Math.floor(density || 4)));
    const safeDragSpeed = Math.max(0.1, Math.min(5, dragSpeed / 20));
    const safeDriftAmount = Math.max(0, Math.min(20, driftAmount));
    const safeFriction = 1 - (Math.max(1, Math.min(20, friction)) / 20) * 0.3;

    // Camera and motion tracking
    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);
    const camX = useMotionValue(0);
    const camY = useMotionValue(0);
    const velX = useMotionValue(0);
    const velY = useMotionValue(0);

    const targetLogZoom = useMotionValue(0);
    const logZoom = useMotionValue(0);
    const velLogZoom = useMotionValue(0);

    const driftTX = useMotionValue(0);
    const driftTY = useMotionValue(0);
    const driftX = useMotionValue(0);
    const driftY = useMotionValue(0);

    const subN = Math.max(1, Math.ceil(Math.sqrt(safeDensity)));
    const subSize = CELL_SIZE / subN;
    const SUBCELL_INNER_PAD = 0.1;
    const effectivePerCell = Math.min(safeDensity, subN * subN);
    const projectsCount = safeProjects.length;

    const generateCell = useMemo(() => {
        return (gx, gy, octave) => {
            if (projectsCount === 0) return [];
            const seed = hash3(gx, gy, octave | 0, 0x9e3779b1);
            const rand = mulberry32(seed);

            const totalSubs = subN * subN;
            const subs = new Array(totalSubs);
            for (let i = 0; i < totalSubs; i++) subs[i] = i;
            for (let i = totalSubs - 1; i > 0; i--) {
                const j = Math.floor(rand() * (i + 1));
                const tmp = subs[i];
                subs[i] = subs[j];
                subs[j] = tmp;
            }

            const tiles = [];
            const count = Math.min(effectivePerCell, totalSubs);

            const pad = subSize * SUBCELL_INNER_PAD;
            const innerRange = Math.max(0, subSize - pad * 2);

            const cellX0 = gx * CELL_SIZE;
            const cellY0 = gy * CELL_SIZE;

            const wWorld = imageWidth / PX_PER_UNIT;
            const hWorld = imageHeight / PX_PER_UNIT;

            for (let slot = 0; slot < count; slot++) {
                const subIdx = subs[slot];
                const sx = subIdx % subN;
                const sy = Math.floor(subIdx / subN);

                const wx = cellX0 + sx * subSize + pad + rand() * innerRange;
                const wy = cellY0 + sy * subSize + pad + rand() * innerRange;

                const bakedScale = SCALE_MIN + rand() * (SCALE_MAX - SCALE_MIN);
                // Deterministic spread so every project shows up evenly, instead of random repeats
                const projIdx = (((gx * 7 + gy * 13 + slot + octave) % projectsCount) + projectsCount) % projectsCount;

                tiles.push({
                    wx,
                    wy,
                    cx: gx,
                    cy: gy,
                    slot,
                    octave,
                    projIdx,
                    w: wWorld,
                    h: hWorld,
                    rot: 0,
                    bakedScale,
                });
            }

            return tiles;
        };
    }, [safeDensity, imageWidth, imageHeight, subN, subSize, effectivePerCell, projectsCount]);

    useEffect(() => {
        const scene = sceneRef.current;
        const container = containerRef.current;
        if (!scene || !container) return;

        let dirty = true;
        let visible = true;
        let cW = container.clientWidth || 900;
        let cH = container.clientHeight || 600;
        const ro = new ResizeObserver(() => {
            if (container) {
                cW = container.clientWidth || cW;
                cH = container.clientHeight || cH;
            }
            dirty = true;
        });
        ro.observe(container);

        const layerPools = new Map();

        const getPool = (octave) => {
            let pool = layerPools.get(octave);
            if (!pool) {
                pool = { tileEls: new Map() };
                layerPools.set(octave, pool);
            }
            return pool;
        };

        const disposeLayer = (octave) => {
            const pool = layerPools.get(octave);
            if (!pool) return;
            pool.tileEls.forEach((el) => {
                if (el.parentNode === scene) scene.removeChild(el);
            });
            pool.tileEls.clear();
            layerPools.delete(octave);
        };

        const disposeAllLayers = () => {
            Array.from(layerPools.keys()).forEach(disposeLayer);
        };

        const removeTile = (octave, key) => {
            const pool = layerPools.get(octave);
            if (!pool) return;
            const el = pool.tileEls.get(key);
            if (el && el.parentNode === scene) scene.removeChild(el);
            pool.tileEls.delete(key);
        };

        const ensureTile = (t) => {
            const pool = getPool(t.octave);
            const key = `${t.cx},${t.cy},${t.slot}`;
            let el = pool.tileEls.get(key);
            if (!el) {
                const project = safeProjects[t.projIdx];
                el = document.createElement("div");
                el.className =
                    "group/tile absolute border border-stone-800 hover:border-red-500/80 rounded-2xl overflow-hidden bg-stone-900/95 transition-colors duration-200 cursor-pointer pointer-events-auto";
                el.style.left = "50%";
                el.style.top = "50%";
                el.style.transformOrigin = "0 0";
                el.style.willChange = "transform, opacity";
                el.dataset.tileKey = key;
                el.dataset.projIndex = String(t.projIdx);

                const img = document.createElement("img");
                img.src = sanitizeImageUrl(project?.imageUrl || project?.src || "");
                img.alt = project?.title || "Portfolio Project";
                img.draggable = false;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";
                img.style.display = "block";
                img.style.pointerEvents = "none";
                img.style.userSelect = "none";
                el.appendChild(img);

                // Title label pill overlay
                if (project?.title) {
                    const badge = document.createElement("div");
                    badge.className =
                        "absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-[#0c0a09] to-transparent text-[10px] font-mono font-medium text-stone-200 truncate group-hover/tile:text-red-400 pointer-events-none";
                    badge.textContent = project.title;
                    el.appendChild(badge);
                }

                scene.appendChild(el);
                pool.tileEls.set(key, el);
            }
            return el;
        };

        const projectLayer = (octave, layerScale, layerAlpha, layerZBase, cx, cy) => {
            const pool = getPool(octave);

            const camCellX = Math.floor(cx / CELL_SIZE);
            const camCellY = Math.floor(cy / CELL_SIZE);

            const worldHalfX = cW / 2 / (PX_PER_UNIT * layerScale);
            const worldHalfY = cH / 2 / (PX_PER_UNIT * layerScale);
            const rangeX = Math.min(MAX_RANGE, Math.ceil(worldHalfX / CELL_SIZE) + 1);
            const rangeY = Math.min(MAX_RANGE, Math.ceil(worldHalfY / CELL_SIZE) + 1);

            const visibleKeys = new Set();
            const tilesThisFrame = [];

            for (let dy = -rangeY; dy <= rangeY; dy++) {
                for (let dx = -rangeX; dx <= rangeX; dx++) {
                    const tiles = generateCell(camCellX + dx, camCellY + dy, octave);
                    for (let i = 0; i < tiles.length; i++) {
                        tilesThisFrame.push(tiles[i]);
                    }
                }
            }

            for (let i = 0; i < tilesThisFrame.length; i++) {
                const t = tilesThisFrame[i];
                const key = `${t.cx},${t.cy},${t.slot}`;
                visibleKeys.add(key);

                const dxPx = (t.wx - cx) * layerScale * PX_PER_UNIT;
                const dyPx = (t.wy - cy) * layerScale * PX_PER_UNIT;
                const s = t.bakedScale * layerScale;

                const el = ensureTile(t);
                const wPx = t.w * PX_PER_UNIT;
                const hPx = t.h * PX_PER_UNIT;

                el.style.transform = `translate3d(${dxPx}px, ${dyPx}px, 0) scale(${s}) translate(${-wPx / 2}px, ${-hPx / 2}px)`;
                el.style.width = `${wPx}px`;
                el.style.height = `${hPx}px`;
                el.style.opacity = String(layerAlpha);
                el.style.zIndex = String(layerZBase + i);
            }

            for (const key of Array.from(pool.tileEls.keys())) {
                if (!visibleKeys.has(key)) removeTile(octave, key);
            }
        };

        let lastOctaves = new Set();

        const project = () => {
            const cx = camX.get();
            const cy = camY.get();
            const lz = logZoom.get();

            const octave = Math.floor(lz);
            const frac = lz - octave;

            const scaleCurrent = Math.pow(2, frac);
            const scaleNext = Math.pow(2, frac - 1);

            const alphaCurrent = 1 - frac;
            const alphaNext = frac;

            projectLayer(octave, scaleCurrent, alphaCurrent, 0, cx, cy);
            projectLayer(octave + 1, scaleNext, alphaNext, 10000, cx, cy);

            const nowOctaves = new Set([octave, octave + 1]);
            for (const o of Array.from(lastOctaves)) {
                if (!nowOctaves.has(o)) disposeLayer(o);
            }
            lastOctaves = nowOctaves;
        };

        let raf = 0;
        const loop = () => {
            if (!visible || pausedRef.current) {
                raf = 0;
                return;
            }
            const tx = targetX.get() + velX.get();
            const ty = targetY.get() + velY.get();
            targetX.set(tx);
            targetY.set(ty);
            velX.set(velX.get() * safeFriction);
            velY.set(velY.get() * safeFriction);

            const vlz = velLogZoom.get();
            if (vlz !== 0) {
                targetLogZoom.set(targetLogZoom.get() + vlz);
                velLogZoom.set(vlz * safeFriction);
            }

            driftX.set(lerp(driftX.get(), driftTX.get() * safeDriftAmount, 0.08));
            driftY.set(lerp(driftY.get(), driftTY.get() * safeDriftAmount, 0.08));

            camX.set(lerp(camX.get(), targetX.get() + driftX.get(), 0.18));
            camY.set(lerp(camY.get(), targetY.get() + driftY.get(), 0.18));
            logZoom.set(lerp(logZoom.get(), targetLogZoom.get(), 0.18));

            // Skip the expensive projection once everything has come to rest
            const settled =
                Math.abs(velX.get()) < 0.0005 &&
                Math.abs(velY.get()) < 0.0005 &&
                Math.abs(velLogZoom.get()) < 0.00005 &&
                Math.abs(camX.get() - targetX.get() - driftX.get()) < 0.001 &&
                Math.abs(camY.get() - targetY.get() - driftY.get()) < 0.001 &&
                Math.abs(logZoom.get() - targetLogZoom.get()) < 0.0001 &&
                Math.abs(driftX.get() - driftTX.get() * safeDriftAmount) < 0.001 &&
                Math.abs(driftY.get() - driftTY.get() * safeDriftAmount) < 0.001;
            if (!settled || dirty) {
                project();
                dirty = false;
                if (zoomGaugeRef.current) {
                    const label = `${Math.pow(2, logZoom.get()).toFixed(1)}×`;
                    if (zoomGaugeRef.current.textContent !== label) {
                        zoomGaugeRef.current.textContent = label;
                    }
                }
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        const wake = () => {
            if (!raf && visible && !pausedRef.current) raf = requestAnimationFrame(loop);
        };
        wakeRef.current = wake;
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) wake();
        });
        io.observe(container);

        return () => {
            wakeRef.current = null;
            cancelAnimationFrame(raf);
            io.disconnect();
            ro.disconnect();
            disposeAllLayers();
        };
    }, [
        generateCell,
        safeFriction,
        safeDriftAmount,
        safeProjects,
        camX,
        camY,
        logZoom,
        targetX,
        targetY,
        targetLogZoom,
        velX,
        velY,
        velLogZoom,
        driftX,
        driftY,
        driftTX,
        driftTY,
    ]);

    // Drag, Zoom, and Drift Listeners
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let dragging = false;
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let lastPX = 0;
        let lastPY = 0;
        let lastT = 0;
        let pid = null;
        let captured = false;
        const activePointers = new Map();
        let prevPinchDist = null;
        let hadPinch = false;
        let hoverProject = null;
        let lastHoverCheck = 0;

        const hidePreview = () => {
            hoverProject = null;
            if (cardRef.current) cardRef.current.style.opacity = "0";
        };

        const getPinchDistance = () => {
            const pts = Array.from(activePointers.values());
            if (pts.length < 2) return 0;
            return Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        };

        const onDown = (e) => {
            if (e.button !== 0 && e.pointerType === "mouse") return;
            hidePreview();
            activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

            if (activePointers.size === 2) {
                // Switch seamlessly into 2-finger pinch-to-zoom
                dragging = false;
                captured = false;
                pid = null;
                hadPinch = true;
                prevPinchDist = getPinchDistance();
                return;
            }

            if (activePointers.size === 1) hadPinch = false;
            dragging = true;
            captured = false;
            pid = e.pointerId;
            startX = e.clientX;
            startY = e.clientY;
            startTime = e.timeStamp;
            lastPX = e.clientX;
            lastPY = e.clientY;
            lastT = e.timeStamp;
            el.style.cursor = "grabbing";
        };

        const onMove = (e) => {
            if (activePointers.has(e.pointerId)) {
                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }

            if (activePointers.size === 2) {
                const dist = getPinchDistance();
                if (prevPinchDist !== null && dist > 0) {
                    const delta = dist - prevPinchDist;
                    velLogZoom.set(velLogZoom.get() + delta * 0.004 * safeDragSpeed);
                }
                prevPinchDist = dist;
                return;
            }

            const rect = el.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
            driftTX.set(Math.max(-1, Math.min(1, nx)));
            driftTY.set(Math.max(-1, Math.min(1, ny)));

            // Desktop hover preview using the shared ProjectPreviewCard
            if (!dragging && e.pointerType !== "touch") {
                const now = performance.now();
                if (now - lastHoverCheck > 30) {
                    lastHoverCheck = now;
                    const hitEl = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-tile-key]");
                    const idx = hitEl?.dataset?.projIndex;
                    const proj = idx !== undefined ? safeProjects[Number(idx)] || null : null;
                    if (proj !== hoverProject) {
                        hoverProject = proj;
                        if (proj) {
                            updatePreviewCardText({ typeRef, labelRef, descRef, hintRef }, proj, "Click to open ↗");
                        }
                        if (cardRef.current) cardRef.current.style.opacity = proj ? "1" : "0";
                    }
                }
                if (hoverProject && cardRef.current) {
                    positionPreviewCard(cardRef.current, el, e.clientX, e.clientY, 1);
                }
            }

            if (!dragging || e.pointerId !== pid) return;

            const totalMove = Math.hypot(e.clientX - startX, e.clientY - startY);
            if (!captured && totalMove > 6) {
                captured = true;
                try {
                    el.setPointerCapture(e.pointerId);
                } catch {}
            }

            const dpx = e.clientX - lastPX;
            const dpy = e.clientY - lastPY;

            const lz = logZoom.get();
            const frac = lz - Math.floor(lz);
            const effScale =
                (1 - frac) * Math.pow(2, frac) + frac * Math.pow(2, frac - 1);
            const dWorldX = (-dpx / (PX_PER_UNIT * effScale)) * safeDragSpeed;
            const dWorldY = (-dpy / (PX_PER_UNIT * effScale)) * safeDragSpeed;
            targetX.set(targetX.get() + dWorldX);
            targetY.set(targetY.get() + dWorldY);

            const dt = Math.max(1, e.timeStamp - lastT);
            const k = 16 / dt;
            velX.set(dWorldX * k);
            velY.set(dWorldY * k);

            lastPX = e.clientX;
            lastPY = e.clientY;
            lastT = e.timeStamp;
        };

        const onUp = (e) => {
            activePointers.delete(e.pointerId);
            if (activePointers.size < 2) prevPinchDist = null;
            if (e.pointerType === "touch" && activePointers.size === 0) {
                driftTX.set(0);
                driftTY.set(0);
            }

            if (!dragging || e.pointerId !== pid) return;

            const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
            const duration = e.timeStamp - startTime;

            // Reliable click/tap detection (skip if finishing a 2-finger pinch)
            if (!hadPinch && dist < 8 && duration < 600) {
                const target = document.elementFromPoint(e.clientX, e.clientY);
                const tile = target?.closest("[data-tile-key]");
                if (tile && tile.dataset.projIndex !== undefined) {
                    const idx = Number(tile.dataset.projIndex);
                    const p = safeProjects[idx];
                    if (p) selectRef.current?.(p);
                }
            }

            dragging = false;
            captured = false;
            pid = null;
            try {
                if (el.hasPointerCapture(e.pointerId)) {
                    el.releasePointerCapture(e.pointerId);
                }
            } catch {}
            el.style.cursor = "grab";
        };

        const onCancel = (e) => onUp(e);

        const onWheel = (e) => {
            e.preventDefault();
            hidePreview();
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 16;
            else if (e.deltaMode === 2) delta *= 400;
            const step = -delta * 0.0015 * safeDragSpeed;
            velLogZoom.set(velLogZoom.get() + step);
        };

        const onLeave = () => {
            hidePreview();
            driftTX.set(0);
            driftTY.set(0);
        };

        el.addEventListener("pointerdown", onDown);
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerup", onUp);
        el.addEventListener("pointercancel", onCancel);
        el.addEventListener("wheel", onWheel, { passive: false });
        el.addEventListener("pointerleave", onLeave);

        el.style.cursor = "grab";

        return () => {
            el.removeEventListener("pointerdown", onDown);
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerup", onUp);
            el.removeEventListener("pointercancel", onCancel);
            el.removeEventListener("wheel", onWheel);
            el.removeEventListener("pointerleave", onLeave);
        };
    }, [safeDragSpeed, targetX, targetY, velX, velY, velLogZoom, logZoom, driftTX, driftTY, safeProjects]);

    const recenter = useCallback(() => {
        targetX.set(0);
        targetY.set(0);
        targetLogZoom.set(0);
        velX.set(0);
        velY.set(0);
        velLogZoom.set(0);
    }, [targetX, targetY, targetLogZoom, velX, velY, velLogZoom]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full overflow-hidden bg-obsidian select-none touch-none ${className}`}
        >
            {/* Ambient Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(220, 38, 38, 0.4) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                }}
            />

            {/* Isolate stacking context so internal tile z-indices stay constrained */}
            <div
                ref={sceneRef}
                className="absolute inset-0 pointer-events-auto z-0 [isolation:isolate]"
            />

            {safeProjects.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-sans text-stone-400 z-10">
                    No projects to display.
                </div>
            )}

            {/* Shared floating hover preview card */}
            <ProjectPreviewCard
                cardRef={cardRef}
                typeRef={typeRef}
                labelRef={labelRef}
                descRef={descRef}
                hintRef={hintRef}
            />

            {/* Bottom HUD Bar */}
            <div className="absolute inset-x-0 bottom-0 px-3 sm:px-6 pt-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:py-4 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent flex items-center justify-between gap-3 text-xs font-mono text-stone-400 pointer-events-none select-none z-10">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={recenter}
                        aria-label="Recenter infinite canvas"
                        title="Recenter view"
                        className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-stone-900/90 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-cream text-[11px] font-mono transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 shrink-0"
                    >
                        <RotateCcw className="w-3 h-3 text-red-400" aria-hidden="true" />
                        <span>Recenter</span>
                    </button>
                    <span
                        ref={zoomGaugeRef}
                        className="px-2.5 py-1 rounded-md bg-stone-900/80 border border-stone-800 text-stone-300 shadow-sm text-[10px] sm:text-[11px] tabular-nums"
                    >
                        1.0×
                    </span>
                </div>
                <span className="sm:hidden text-[10px] text-stone-500 truncate">
                    Drag · Pinch · Tap card
                </span>
                <span className="hidden sm:inline text-[11px] text-stone-500">
                    Drag to pan · Scroll to zoom · Click card to open
                </span>
            </div>
        </div>
    );
};

export default InfiniteCanvas;