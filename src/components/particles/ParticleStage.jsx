import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createSim } from "./particleSim";
import { getEntries, setStatus } from "./particleRegistry";

/**
 * ParticleStage
 * One fixed, full-screen WebGL layer behind every public page. It owns a single pool of
 * particles (see particleSim.js): they drift as dust, and gather out of it to form any
 * <ParticleHeading> that is on screen. This file only does the DOM/GPU side:
 * measuring headings, turning their text into points, and drawing.
 */
const FONT =
  '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, "Segoe UI", sans-serif';
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const VERT = `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uTilt;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float p = 900.0 / (900.0 - position.z);
    float x = position.x + uTilt * position.z * 0.06;
    gl_Position = vec4(x / uRes.x * 2.0 - 1.0, 1.0 - position.y / uRes.y * 2.0, 0.0, 1.0);
    gl_PointSize = max(aSize * p * uDpr * 2.0, 1.0);
    vColor = aColor;
    vAlpha = aAlpha;
  }
`;
const FRAG = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.1, d) * vAlpha);
  }
`;

/* ---------- text -> evenly spaced points, relative to the heading box centre ---------- */
const sampleHeading = (entry, boxW, boxH) => {
  const mobile = window.innerWidth < 768;
  const words = entry.text.split(/\s+/).filter(Boolean);
  const lines =
    entry.splitOnMobile && mobile
      ? words.length > 2
        ? [words[0], words[1], words.slice(2).join(" ")]
        : words
      : [words.join(" ")];

  const fs = 180;
  const lh = fs * 1.15;
  const c = document.createElement("canvas");
  const g = c.getContext("2d", { willReadFrequently: true });
  g.font = `800 ${fs}px ${FONT}`;
  const tw = Math.max(...lines.map((l) => g.measureText(l).width));
  c.width = Math.ceil(tw + 40);
  c.height = Math.ceil(lh * lines.length + 40);
  g.font = `800 ${fs}px ${FONT}`;
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((l, i) => g.fillText(l, c.width / 2, 20 + lh * (i + 0.5)));

  const data = g.getImageData(0, 0, c.width, c.height).data;
  let area = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) area++;
  if (!area) return null;

  const pxScale = Math.min((boxW * 0.96) / c.width, (boxH * 0.96) / c.height);
  const cssArea = area * pxScale * pxScale;
  const gap = mobile ? 2.3 : 2.0;
  const cap = mobile ? entry.capMobile ?? 1400 : entry.cap ?? 2400;
  const N = clamp(Math.round(cssArea / (gap * gap)), 250, cap);

  const step = Math.max(1, Math.sqrt(area / N));
  const cand = [];
  for (let y = 0; y < c.height; y += step)
    for (let x = 0; x < c.width; x += step) {
      const px = Math.floor(x);
      const py = Math.floor(y);
      if (data[(py * c.width + px) * 4 + 3] > 128) cand.push(px, py);
    }
  const nCand = cand.length / 2;
  if (!nCand) return null;
  const order = Array.from({ length: nCand }, (_, k) => k);
  for (let k = nCand - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [order[k], order[r]] = [order[r], order[k]];
  }

  const tW = c.width * pxScale;
  const ox = entry.align === "left" ? -boxW / 2 + tW / 2 - 20 * pxScale : 0;
  const lx = new Float32Array(N);
  const ly = new Float32Array(N);
  const lz = new Float32Array(N);
  for (let k = 0; k < N; k++) {
    const j = (k < nCand ? order[k] : Math.floor(Math.random() * nCand)) * 2;
    lx[k] = ox + (cand[j] + (Math.random() - 0.5) * step * 0.5 - c.width / 2) * pxScale;
    ly[k] = (cand[j + 1] + (Math.random() - 0.5) * step * 0.5 - c.height / 2) * pxScale;
    lz[k] = (Math.random() - 0.5) * 28;
  }
  return { N, lx, ly, lz, dotR: clamp(Math.sqrt(cssArea / N) * 0.6, 0.7, 2.2) };
};

const ParticleStage = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
    } catch {
      setStatus("failed");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 768;
    const P = mobile ? 5200 : 10000;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    let W = document.documentElement.clientWidth || window.innerWidth;
    let H = window.innerHeight;
    renderer.setSize(W, H);

    const sim = createSim({ P, W, H, reduced });

    const palette = [new THREE.Color("#faf8f5"), new THREE.Color("#ef4444"), new THREE.Color("#fca5a5")];
    const colors = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      const c = palette[sim.col[i]];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(sim.pos, 3).setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(sim.size, 1).setUsage(THREE.DynamicDrawUsage);
    const alphaAttr = new THREE.BufferAttribute(sim.alpha, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setAttribute("aSize", sizeAttr);
    geo.setAttribute("aAlpha", alphaAttr);
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uRes: { value: new THREE.Vector2(W, H) },
        uDpr: { value: dpr },
        uTilt: { value: 0 },
      },
    });
    const points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(points);
    const camera = new THREE.Camera(); // unused: the shader maps pixels straight to the screen

    /* ---- headings: measure + cache their point samples ---- */
    const cache = new Map();
    const getSample = (entry, w, h) => {
      const key = `${entry.text}|${Math.round(w)}|${Math.round(h)}|${window.innerWidth < 768 ? 1 : 0}|${entry.align}`;
      const hit = cache.get(entry);
      if (hit && hit.key === key) return hit;
      const s = sampleHeading(entry, w, h);
      if (!s) return null;
      const out = { key, ...s };
      cache.set(entry, out);
      return out;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => cache.clear());

    /* ---- pointer + shatter ---- */
    const pointer = { x: -1e5, y: -1e5, tilt: 0 };
    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.tilt = (e.clientX / window.innerWidth - 0.5) * 2;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e5;
    };
    const onClick = (e) => {
      if (reduced) return;
      if (e.target.closest && e.target.closest("a, button, input, textarea, select, [role='button']")) return;
      for (const entry of getEntries()) {
        const section = entry.el.closest("section") || entry.el.parentElement;
        if (section && section.contains(e.target) && sim.isOn(entry.id)) sim.shatter(entry.id, e.clientX, e.clientY);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onLeave);
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("mouseleave", onLeave);

    /* ---- resize (ignore phone address-bar jitter) ---- */
    let timer;
    const apply = () => {
      W = document.documentElement.clientWidth || window.innerWidth;
      H = window.innerHeight;
      renderer.setSize(W, H);
      material.uniforms.uRes.value.set(W, H);
      sim.resize(W, H);
    };
    const onResize = () => {
      const w = document.documentElement.clientWidth || window.innerWidth;
      if (w === W && Math.abs(window.innerHeight - H) < 140) return;
      clearTimeout(timer);
      timer = setTimeout(apply, 150);
    };
    window.addEventListener("resize", onResize);

    /* ---- loop ---- */
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;

      const list = [];
      for (const entry of getEntries()) {
        const el = entry.el;
        if (!el.isConnected) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < -1.5 * H || r.top > 2.5 * H) continue; // far away: not worth sampling
        const s = getSample(entry, el.offsetWidth, el.offsetHeight);
        if (!s) continue;
        list.push({
          id: entry.id,
          key: s.key,
          N: s.N,
          lx: s.lx,
          ly: s.ly,
          lz: s.lz,
          dotR: s.dotR,
          intro: !!entry.intro,
          rect: { left: r.left, top: r.top, width: r.width, height: r.height, bottom: r.bottom },
        });
      }

      sim.step(dt, window.scrollY, list, pointer);
      posAttr.needsUpdate = true;
      sizeAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      material.uniforms.uTilt.value = pointer.tilt;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);
    setStatus("ready");

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      geo.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,#0c0a09_100%)] opacity-60" />
    </div>
  );
};

export default ParticleStage;
