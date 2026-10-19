import { useEffect, useMemo, useRef } from "react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";

/**
 * TechMarquee
 * Two slow rows of tech chips drifting in opposite directions. The rows also slide a little
 * with the page scroll (parallax). Decorative: hidden from screen readers.
 */
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const TechMarquee = ({ skills = [], className = "" }) => {
  const wrapRef = useRef(null);

  const rows = useMemo(() => {
    const seen = new Set();
    const unique = [];
    skills.forEach((s) => {
      const key = (s.name || "").trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    });
    const list = unique.slice(0, 32);
    if (!list.length) return [];
    // make sure one set is wide enough to fill a big screen
    const repeat = (arr) => {
      const out = [];
      while (out.length < 14) out.push(...arr);
      return out;
    };
    const a = list.filter((_, i) => i % 2 === 0);
    const b = list.filter((_, i) => i % 2 === 1);
    return [repeat(a.length ? a : list), repeat(b.length ? b : list)];
  }, [skills]);

  // gentle scroll parallax (CSS variable only, no React re-renders)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.setProperty("--shift", `${clamp(p * 0.18, -240, 240)}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!rows.length) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`tm overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] ${className}`}
    >
      {rows.map((items, r) => (
        <div
          key={r}
          className="py-1.5"
          style={{ transform: `translateX(calc(var(--shift, 0px) * ${r === 0 ? 1 : -1}))` }}
        >
          <div
            className={`tm-track flex w-max ${r === 1 ? "tm-rev" : ""}`}
            style={{ "--dur": `${items.length * (r === 0 ? 3.4 : 3.9)}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-3 pr-3">
                {items.map((s, i) => (
                  <span
                    key={`${copy}-${i}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-stone-800 bg-stone-900/60 px-4 py-2 text-sm text-stone-300 select-none hover:border-red-500/40 hover:text-white transition-colors"
                  >
                    <CategoryIcon
                      category={s.category}
                      iconKeyword={s.iconKeyword}
                      skillName={s.name}
                      className="h-4 w-4 text-red-400"
                    />
                    {s.name}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes tm-scroll { to { transform: translateX(-50%); } }
        .tm-track { animation: tm-scroll var(--dur, 40s) linear infinite; }
        .tm-rev { animation-direction: reverse; }
        .tm:hover .tm-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .tm-track { animation: none; } }
      `}</style>
    </div>
  );
};

export default TechMarquee;
