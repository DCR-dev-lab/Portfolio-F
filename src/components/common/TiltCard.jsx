import { useRef } from "react";

/**
 * Wrap any card to give it a 3D tilt toward the cursor and a soft red spotlight.
 * Mouse only (touch and reduced-motion users get the plain card).
 *
 *   <TiltCard><ProjectCard project={p} /></TiltCard>
 *
 * `radius` should match the wrapped card's corner radius so the glow stays inside it.
 */
const TiltCard = ({
  children,
  className = "",
  radius = "rounded-2xl",
  max = 7,
}) => {
  const ref = useRef(null);
  const frame = useRef(0);

  const set = (el, rx, ry, gx, gy) => {
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${gx}%`);
    el.style.setProperty("--gy", `${gy}%`);
  };

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    // stay still while a card inside is open (put data-open={isOpen} on the card root)
    if (el.querySelector('[data-open="true"]')) return onLeave();
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() =>
      set(el, (0.5 - py) * max * 2, (px - 0.5) * max * 2, px * 100, py * 100),
    );
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    if (ref.current) set(ref.current, 0, 0, 50, 50);
  };

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`group relative h-full ${radius} will-change-transform transition-transform duration-200 ease-out [transform-style:preserve-3d]`}
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
        }}
      >
        {children}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${radius} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
          style={{
            background:
              "radial-gradient(420px circle at var(--gx, 50%) var(--gy, 50%), rgba(220,38,38,0.16), transparent 60%)",
          }}
        />
      </div>
    </div>
  );
};

export default TiltCard;
