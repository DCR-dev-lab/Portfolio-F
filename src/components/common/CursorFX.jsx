import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CURTAIN_DEPTH } from "../../constants/layout";

/**
 * CursorFX
 * A lively cursor for the public pages, adapted from Originkit's "Confetti Cursor" and "Click Effects":
 *  - a small dot + a ring that trails it and swells over links/buttons
 *  - a trail of glowing embers (red / rose / cream) that float up as you move
 *  - a click effect at the pointer (ring + sparks, rings, burst or crosshair)
 *  - volumetric immersion and magnetic field halo when inside the Projects section
 *
 * One transparent canvas, no extra libraries. Sleeps when idle to preserve battery.
 */
const PALETTE = [
  "#ef4444",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#dc2626",
  "#faf8f5",
];
const INTERACTIVE =
  "a, button, summary, [role='button'], [data-cursor='hover']";
const MAGNETIC = "[data-magnetic-area], [data-cursor='magnetic']";
const TEXTUAL = "input, textarea, select, [contenteditable='true'], [data-cursor='text']";
const TAU = Math.PI * 2;
const MAX_EMBERS = 420;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const CursorFX = ({
  mode = "bloom", // "bloom" | "rings" | "burst" | "crosshair"
  hideNative = true, // hide the system arrow (never over text fields)
  trail = true, // embers behind the pointer
}) => {
  const canvasRef = useRef(null);

  // Dynamically react if pointer or motion settings change in OS
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return false;
    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(hover: hover)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return fine && !reduced;
  });

  useEffect(() => {
    const fineMql = window.matchMedia("(pointer: fine)");
    const hoverMql = window.matchMedia("(hover: hover)");
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");

    const check = () => {
      setActive(fineMql.matches && hoverMql.matches && !motionMql.matches);
    };

    fineMql.addEventListener?.("change", check);
    hoverMql.addEventListener?.("change", check);
    motionMql.addEventListener?.("change", check);
    return () => {
      fineMql.removeEventListener?.("change", check);
      hoverMql.removeEventListener?.("change", check);
      motionMql.removeEventListener?.("change", check);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas && canvas.getContext("2d");
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    const mouse = { x: -100, y: -100, seen: false };
    const ring = { x: -100, y: -100, s: 1 };
    let hovering = false;
    let magCur = 0;
    let magImmersion = 0;
    let wasInside = false;
    let overText = false;
    let down = false;
    let visible = false;
    let embers = [];
    let bursts = [];
    let thresholdRipples = [];
    let raf = 0;
    let last = 0;
    let clock = 0;
    let lastSpawn = 0;
    let lastMove = { x: 0, y: 0 };
    let lastActiveTime = performance.now();
    const curtainDepth = CURTAIN_DEPTH || 96;
    let sectionRect = null;
    let lastRectTime = 0;
    let lastQueryTime = 0;
    let cachedMagEl = null;
    let lastHoverTarget = null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      sectionRect = null;
      W = document.documentElement.clientWidth || window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
    };
    resize();

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        resize();
        wake();
      });
    };

    let dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const onDprChange = () => {
      onResize();
      dprMql.removeEventListener?.("change", onDprChange);
      dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprMql.addEventListener?.("change", onDprChange);
    };
    dprMql.addEventListener?.("change", onDprChange);

    // Inject cursor-hiding style rule once, then toggle via class to prevent stylesheet thrashing
    const styleTag = document.createElement("style");
    styleTag.textContent = `html.cursor-fx-active, html.cursor-fx-active *:not(input):not(textarea):not(select):not([contenteditable='true']) { cursor: none !important; }`;
    document.head.appendChild(styleTag);
    let nativeHidden = false;
    const setNativeHidden = (hide) => {
      if (hide === nativeHidden) return;
      nativeHidden = hide;
      document.documentElement.classList.toggle("cursor-fx-active", hide);
    };

    const spawnEmbers = (x, y, speed) => {
      const n = Math.min(3, 1 + Math.floor(speed / 60));
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        const v = 8 + Math.random() * 26;
        embers.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 10,
          size: 1.6 + Math.random() * 2.6,
          age: 0,
          life: 0.8 + Math.random() * 0.8,
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
        });
      }
      if (embers.length > MAX_EMBERS) embers = embers.slice(-MAX_EMBERS);
    };

    const spawnClick = (x, y) => {
      const n = mode === "burst" ? 6 : mode === "crosshair" ? 4 : 10;
      const sparks = Array.from({ length: n }, (_, i) => ({
        a:
          mode === "crosshair"
            ? (i * Math.PI) / 2
            : (i / n) * TAU + Math.random() * 0.5,
        d: 26 + Math.random() * 30,
        len: 4 + Math.random() * 7,
      }));
      bursts.push({
        x,
        y,
        age: 0,
        life: mode === "rings" ? 0.7 : 0.55,
        sparks,
      });
      wake();
    };

    const getSectionRect = () => {
      const now = performance.now();
      if (sectionRect && now - lastRectTime < 150) return sectionRect;
      if (!cachedMagEl || !cachedMagEl.isConnected) {
        // Cache negative lookup for 1s to avoid DOM queries on every move on non-magnetic pages
        if (now - lastQueryTime < 1000) return null;
        lastQueryTime = now;
        cachedMagEl = document.querySelector(MAGNETIC);
      }
      if (cachedMagEl) {
        sectionRect = cachedMagEl.getBoundingClientRect();
        lastRectTime = now;
        return sectionRect;
      }
      sectionRect = null;
      return null;
    };

    const spawnThresholdSpark = (x, y, sparkAngle) => {
      thresholdRipples.push({
        x,
        y,
        age: 0,
        life: 0.35,
        width: 120,
      });

      const n = 5;
      const sparks = Array.from({ length: n }, () => {
        const angle = sparkAngle + (Math.random() - 0.5) * Math.PI * 0.7;
        return {
          a: angle,
          d: 14 + Math.random() * 18,
          len: 3 + Math.random() * 5,
        };
      });
      bursts.push({
        x,
        y,
        age: 0,
        life: 0.28,
        sparks,
      });

      spawnEmbers(x, y, 60);
      wake();
    };

    const updateMagneticState = (cx, cy) => {
      const rect = getSectionRect();
      let nextImmersion = 0;
      let isInside = false;

      if (rect) {
        const inX = cx >= rect.left && cx <= rect.right;
        const inY = cy >= rect.top && cy <= rect.bottom;
        isInside = inX && inY;

        if (isInside) {
          const dTop = cy - rect.top;
          const dBottom = rect.bottom - cy;
          const curtainTop = Math.min(1, Math.max(0, dTop / curtainDepth));
          const curtainBottom = Math.min(1, Math.max(0, dBottom / curtainDepth));
          nextImmersion = Math.min(curtainTop, curtainBottom);
        }
      }

      if (mouse.seen && isInside !== wasInside) {
        if (rect) {
          const distTop = Math.abs(cy - rect.top);
          const distBottom = Math.abs(cy - rect.bottom);
          const atTop = distTop <= distBottom;
          const angle = atTop
            ? (isInside ? Math.PI * 0.5 : -Math.PI * 0.5)
            : (isInside ? -Math.PI * 0.5 : Math.PI * 0.5);
          spawnThresholdSpark(cx, cy, angle);
        } else {
          spawnThresholdSpark(cx, cy, isInside ? Math.PI * 0.5 : -Math.PI * 0.5);
        }
      }

      wasInside = isInside;
      magImmersion = nextImmersion;
    };

    const onMove = (e) => {
      // Disregard finger touch or pen inputs on 2-in-1 touchscreen devices
      if (e.pointerType && e.pointerType !== "mouse") return;
      lastActiveTime = performance.now();

      const t = e.target;
      lastHoverTarget = t;
      const nextOverText = !!(t.closest && t.closest(TEXTUAL));
      const nextHovering = !!(t.closest && t.closest(INTERACTIVE));

      updateMagneticState(e.clientX, e.clientY);

      overText = nextOverText;
      hovering = nextHovering;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!mouse.seen) {
        mouse.seen = true;
        ring.x = mouse.x;
        ring.y = mouse.y;
      }
      visible = true;
      setNativeHidden(hideNative && !overText);
      if (trail && !overText) {
        const now = performance.now();
        const dx = mouse.x - lastMove.x;
        const dy = mouse.y - lastMove.y;
        const speed =
          Math.hypot(dx, dy) / Math.max(0.001, (now - lastSpawn) / 1000);
        if (now - lastSpawn > 24 && Math.hypot(dx, dy) > 2) {
          spawnEmbers(mouse.x, mouse.y, speed);
          lastSpawn = now;
          lastMove = { x: mouse.x, y: mouse.y };
        }
      }
      wake();
    };

    const onDown = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      lastActiveTime = performance.now();
      down = true;
      wake();
    };

    const onUp = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      lastActiveTime = performance.now();
      down = false;
      wake();
    };

    const onClick = (e) => {
      // Filter out keyboard clicks (Enter/Space on focused elements dispatch e.detail === 0)
      if (e.detail === 0) return;
      if (e.target.closest && e.target.closest(TEXTUAL)) return;
      spawnClick(e.clientX, e.clientY);
    };

    const onLeave = () => {
      visible = false;
      magImmersion = 0;
      wasInside = false;
      lastHoverTarget = null;
      setNativeHidden(false);
      wake();
    };

    // Tells React/DOM listeners that the pointer left the old element when content
    // scrolled away under a stationary mouse. React builds onMouseEnter/onMouseLeave
    // from the native "mouseout" event, so one event with relatedTarget is enough.
    const syncHoverTarget = (el) => {
      if (el === lastHoverTarget) return;
      const prev = lastHoverTarget;
      lastHoverTarget = el;
      if (!prev || !el || !prev.isConnected) return;
      prev.dispatchEvent(
        new MouseEvent("mouseout", {
          bubbles: true,
          clientX: mouse.x,
          clientY: mouse.y,
          relatedTarget: el,
          view: window,
        }),
      );

      // Force the browser's native C++ style engine to immediately clear CSS :hover
      const interactiveEl = prev.closest ? prev.closest(INTERACTIVE) || prev : prev;
      if (interactiveEl && interactiveEl.style) {
        interactiveEl.style.pointerEvents = "none";
        requestAnimationFrame(() => {
          interactiveEl.style.removeProperty("pointer-events");
        });
      }
    };

    const resolveUnderPointer = () => {
      if (!mouse.seen || !visible || mouse.x < 0 || mouse.y < 0) return;
      const el = document.elementFromPoint(mouse.x, mouse.y);
      syncHoverTarget(el);
      overText = !!(el && el.closest && el.closest(TEXTUAL));
      hovering = !!(el && el.closest && el.closest(INTERACTIVE));
      setNativeHidden(hideNative && !overText);
      updateMagneticState(mouse.x, mouse.y);
      wake();
    };

    let scrollScheduled = false;
    let scrollEndTimer = 0;
    const onScroll = () => {
      sectionRect = null;
      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(() => {
          scrollScheduled = false;
          resolveUnderPointer();
        });
      }
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(resolveUnderPointer, 50);
    };

    const frame = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      clock += dt;

      // ring follows the pointer a little behind it; scale eases toward its target
      const follow = 1 - Math.exp(-dt * 14);
      ring.x += (mouse.x - ring.x) * follow;
      ring.y += (mouse.y - ring.y) * follow;
      magCur += (magImmersion - magCur) * (1 - Math.exp(-dt * 12));
      const sTarget = overText ? 0 : hovering ? 1.8 : magCur > 0.01 ? 1 + 0.25 * magCur : down ? 0.8 : 1;
      ring.s += (sTarget - ring.s) * (1 - Math.exp(-dt * 16));

      ctx.clearRect(0, 0, W, H);

      // embers (frame-rate independent drag using Math.pow(0.97, dt * 60))
      ctx.globalCompositeOperation = "lighter";
      const drag = Math.pow(0.97, dt * 60);
      const keep = [];
      for (const q of embers) {
        q.age += dt;
        if (q.age >= q.life) continue;
        q.vx *= drag;
        q.vy = q.vy * drag - 18 * dt; // drift upward like embers
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        const t = q.age / q.life;
        ctx.globalAlpha = (1 - t) * (1 - t) * 0.9;
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, q.y, (q.size * (1 - t * 0.5)) / 2, 0, TAU);
        ctx.fill();
        keep.push(q);
      }
      embers = keep;

      // click effects
      const live = [];
      for (const b of bursts) {
        b.age += dt;
        const t = b.age / b.life;
        if (t >= 1) continue;
        const e = easeOut(t);
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = "#ef4444";
        ctx.fillStyle = "#fca5a5";
        ctx.lineCap = "round";
        if (mode === "bloom" || mode === "rings") {
          ctx.lineWidth = 1.6 * (1 - t) + 0.4;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 6 + 40 * e, 0, TAU);
          ctx.stroke();
          if (mode === "rings") {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 4 + 22 * easeOut(Math.max(0, t - 0.12)), 0, TAU);
            ctx.stroke();
          }
        }
        if (mode !== "rings") {
          ctx.lineWidth = 1.6 * (1 - t) + 0.3;
          for (const s of b.sparks) {
            const d0 = 8 + s.d * e;
            if (mode === "bloom") {
              ctx.beginPath();
              ctx.arc(
                b.x + Math.cos(s.a) * d0,
                b.y + Math.sin(s.a) * d0,
                1.8 * (1 - t) + 0.3,
                0,
                TAU,
              );
              ctx.fill();
            } else {
              const d1 = d0 + s.len * (1 - t);
              ctx.beginPath();
              ctx.moveTo(b.x + Math.cos(s.a) * d0, b.y + Math.sin(s.a) * d0);
              ctx.lineTo(b.x + Math.cos(s.a) * d1, b.y + Math.sin(s.a) * d1);
              ctx.stroke();
            }
          }
        }
        live.push(b);
      }
      bursts = live;

      // Laser Membrane Threshold Ripples (Boundary crossing sparks)
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1; // Prevent embers/bursts globalAlpha leak
      const liveRipples = [];
      for (const rip of thresholdRipples) {
        rip.age += dt;
        const t = rip.age / rip.life;
        if (t >= 1) continue;
        const alpha = (1 - t) * (1 - t);
        const w = rip.width * (0.2 + 0.8 * easeOut(t));

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2.2 * (1 - t) + 0.4;
        const grad = ctx.createLinearGradient(rip.x - w, rip.y, rip.x + w, rip.y);
        grad.addColorStop(0, "rgba(239, 68, 68, 0)");
        grad.addColorStop(0.3, `rgba(239, 68, 68, ${alpha * 0.7})`);
        grad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.95})`);
        grad.addColorStop(0.7, `rgba(239, 68, 68, ${alpha * 0.7})`);
        grad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(rip.x - w, rip.y);
        ctx.lineTo(rip.x + w, rip.y);
        ctx.stroke();

        // Expanding circular shockwave ring at crossing point
        const ringR = 26 * easeOut(t);
        ctx.lineWidth = 1.4 * (1 - t);
        ctx.strokeStyle = `rgba(252, 165, 165, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, ringR, 0, TAU);
        ctx.stroke();
        ctx.restore();

        liveRipples.push(rip);
      }
      thresholdRipples = liveRipples;

      // The cursor itself: ring + dot (remain visible at screen bounds x=0 or y=0)
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1; // Prevent leak into magnetic halo
      if (visible && mouse.seen && ring.s > 0.02) {
        const r = 14 * ring.s;

        // Magnetic Flux Halo (Ethereal gravitational field waves & dipole brackets)
        if (magCur > 0.01) {
          ctx.save();

          // 1. Soft Electromagnetic Aura Core
          const auraR = r * (1.8 + 0.6 * magCur);
          const auraGrad = ctx.createRadialGradient(ring.x, ring.y, 2, ring.x, ring.y, auraR);
          auraGrad.addColorStop(0, `rgba(239, 68, 68, ${0.32 * magCur})`);
          auraGrad.addColorStop(0.5, `rgba(220, 38, 38, ${0.12 * magCur})`);
          auraGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, auraR, 0, TAU);
          ctx.fill();

          // 2. Wave Pulse 1 (Expanding concentric flux ripple)
          const pulse1 = (clock * 1.8) % 1;
          const r1 = r * (1.1 + pulse1 * 1.15);
          const a1 = (1 - pulse1) * 0.75 * magCur;
          ctx.lineWidth = 1.8 * Math.max(0.3, magCur);
          ctx.strokeStyle = `rgba(239, 68, 68, ${a1})`;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, r1, 0, TAU);
          ctx.stroke();

          // 3. Wave Pulse 2 (Phase-offset outer ripple)
          const pulse2 = (clock * 1.8 + 0.5) % 1;
          const r2 = r * (1.1 + pulse2 * 1.75);
          const a2 = (1 - pulse2) * 0.5 * magCur;
          ctx.lineWidth = 1.3 * Math.max(0.3, magCur);
          ctx.strokeStyle = `rgba(248, 113, 113, ${a2})`;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, r2, 0, TAU);
          ctx.stroke();

          // 4. Magnetic Dipole Field Brackets (( • ))
          const breath = Math.sin(clock * 6) * 2.2;
          const bR1 = r * 1.55 + breath;
          const bR2 = r * 2.2 + breath * 1.4;
          const bAlpha = 0.85 * magCur;

          ctx.lineWidth = 2.0 * Math.max(0.3, magCur);
          ctx.strokeStyle = `rgba(239, 68, 68, ${bAlpha})`;
          // Inner Left bracket (
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, bR1, Math.PI * 0.76, Math.PI * 1.24);
          ctx.stroke();
          // Inner Right bracket )
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, bR1, -Math.PI * 0.24, Math.PI * 0.24);
          ctx.stroke();

          // Outer faint brackets (( ))
          ctx.lineWidth = 1.4 * Math.max(0.3, magCur);
          ctx.strokeStyle = `rgba(252, 165, 165, ${bAlpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, bR2, Math.PI * 0.82, Math.PI * 1.18);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, bR2, -Math.PI * 0.18, Math.PI * 0.18);
          ctx.stroke();

          ctx.restore();
        }

        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ef4444";
        ctx.fillStyle = `rgba(239,68,68,${clampAlpha((ring.s - 1) * 0.16)})`;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, r, 0, TAU);
        ctx.fill();
        ctx.stroke();

        const pulse = 1 + Math.sin(clock * 8) * 0.12;
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#faf8f5";
        ctx.beginPath();
        ctx.arc(
          mouse.x,
          mouse.y,
          (hovering ? 1.6 : 3) * pulse * (down ? 0.8 : 1),
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Go to sleep when there's nothing left to animate, or after 2 seconds idle inside magnetic section
      const settled =
        Math.abs(ring.x - mouse.x) < 0.3 &&
        Math.abs(ring.y - mouse.y) < 0.3 &&
        Math.abs(ring.s - sTarget) < 0.01 &&
        Math.abs(magCur - magImmersion) < 0.01;

      const isStationary = now - lastActiveTime > 2000;

      if (
        embers.length === 0 &&
        bursts.length === 0 &&
        thresholdRipples.length === 0 &&
        settled &&
        (magImmersion === 0 || isStationary)
      ) {
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    function clampAlpha(v) {
      return Math.min(Math.max(v, 0), 1);
    }
    function wake() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      clearTimeout(scrollEndTimer);
      dprMql.removeEventListener?.("change", onDprChange);
      setNativeHidden(false);
      styleTag.remove();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [active, mode, hideNative, trail]);

  if (typeof document === "undefined" || !document.body) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      role="presentation"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999] h-full w-full"
    />,
    document.body
  );
};

export default CursorFX;
