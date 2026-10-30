import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

const getDomainMeta = (name = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("front") || lower.includes("ui") || lower.includes("client")) {
    return {
      tag: "UI & CLIENT ARCHITECTURE",
      description:
        "Crafting fluid, high-performance interfaces with reactive state, accessible design, and modular component hierarchies.",
    };
  }
  if (lower.includes("back") || lower.includes("api") || lower.includes("server")) {
    return {
      tag: "APIS & DISTRIBUTED SERVICES",
      description:
        "Engineering secure, scalable backend architectures, RESTful & WebSocket endpoints, and resilient business logic pipelines.",
    };
  }
  if (lower.includes("data") || lower.includes("db") || lower.includes("sql")) {
    return {
      tag: "DATA MODELING & PERSISTENCE",
      description:
        "Designing structured data stores, performant indexing strategies, caching mechanisms, and robust transactional schemas.",
    };
  }
  if (
    lower.includes("devops") ||
    lower.includes("cloud") ||
    lower.includes("tool") ||
    lower.includes("infra")
  ) {
    return {
      tag: "INFRASTRUCTURE & DEPLOYMENT",
      description:
        "Automated CI/CD workflows, containerization, cloud infrastructure management, and modern developer tooling ecosystems.",
    };
  }
  return {
    tag: "TECHNICAL CAPABILITY",
    description:
      "Specialized frameworks, utilities, and engineering workflows built for production-grade reliability.",
  };
};

/**
 * SkillStackingDeck
 *
 * True Scroll-Pinned Card Stacking:
 * The stage pins in the viewport while the user scrolls through the track.
 * As scroll progress advances, each domain card dynamically slides up from below,
 * locks into the center, and scales down as the next card stacks on top of it.
 */
const SkillStackingDeck = ({
  skills = [],
  perCategory = 8,
  maxCategories = 4,
}) => {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((s) => {
      const name = (s.category || "").trim() || "Other";
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(s);
    });
    return [...map.entries()]
      .map(([name, items]) => ({
        name,
        items: [...items].sort(
          (a, b) => (Number(b.proficiency) || 0) - (Number(a.proficiency) || 0)
        ),
      }))
      .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
      .slice(0, maxCategories);
  }, [skills, maxCategories]);

  const count = groups.length;

  useEffect(() => {
    if (!count) return;

    let rafId = 0;
    const calculateProgress = () => {
      rafId = 0;
      const el = trackRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) {
        setProgress(0);
        return;
      }

      // Progress is 0 when the top of the track hits the top of the viewport,
      // and reaches 1.0 when the bottom of the track aligns with the bottom of the viewport
      const currentScroll = -rect.top;
      const p = clamp(currentScroll / totalScrollable, 0, 1);
      setProgress(p);
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(calculateProgress);
    };

    calculateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  if (!count) return null;

  // Map progress (0..1) to continuous active step index (0 .. count - 1)
  const currentStep = progress * (count - 1);
  const activeIndex = Math.min(count - 1, Math.round(currentStep));

  return (
    <div
      ref={trackRef}
      style={{ height: `${count * 90}vh` }}
      className="relative w-full"
    >
      {/* Pinned Stage Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Step Indicator Badges */}
        <div className="mb-6 flex items-center gap-2 font-mono text-xs text-stone-400">
          <span className="text-red-400 font-semibold">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span>/</span>
          <span>{String(count).padStart(2, "0")}</span>
          <span className="mx-2 h-3 w-px bg-stone-700/60" />
          <div className="flex items-center gap-1.5">
            {groups.map((g, idx) => (
              <span
                key={g.name}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  idx === activeIndex
                    ? "w-6 bg-red-500 shadow-sm shadow-red-500/50"
                    : idx < activeIndex
                    ? "w-2 bg-stone-600"
                    : "w-2 bg-stone-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Stacking Stage */}
        <div className="relative w-full max-w-4xl h-[420px] sm:h-[450px]">
          {groups.map((g, i) => {
            const meta = getDomainMeta(g.name);
            const shown = g.items.slice(0, perCategory);
            const more = g.items.length - shown.length;
            const delta = currentStep - i;

            // Physics calculation for each card
            let translateY = 0;
            let scale = 1;
            let opacity = 1;
            let brightness = 1;

            if (delta < 0) {
              // Card has not arrived yet: glides up smoothly from below
              const incoming = Math.abs(delta);
              translateY = Math.min(120, incoming * 105);
              scale = 1.0;
              opacity = clamp(1 - (incoming - 0.3) * 1.5, 0, 1);
            } else {
              // Card is at or behind the current step: stacks down & recedes
              scale = Math.max(0.86, 1 - delta * 0.045);
              translateY = -delta * 22; // shifts up into the stack tab
              brightness = Math.max(0.35, 1 - delta * 0.22);
              opacity = 1;
            }

            return (
              <article
                key={g.name}
                style={{
                  transform: `translate3d(0, ${translateY}%, 0) scale(${scale})`,
                  filter: `brightness(${brightness})`,
                  opacity,
                  zIndex: 10 + i,
                  boxShadow:
                    delta >= 0
                      ? `0 ${-12 + delta * 2}px 35px -5px rgba(0,0,0,0.85), 0 25px 50px -10px rgba(0,0,0,0.9)`
                      : "0 25px 50px -10px rgba(0,0,0,0.7)",
                }}
                className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-stone-800 bg-[#12100e]/95 p-6 sm:p-8 md:p-10 backdrop-blur-2xl transition-transform duration-75 will-change-transform"
              >
                {/* Top ambient highlight line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent opacity-60" />

                {/* Radial crimson aura */}
                <div
                  className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-25 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)",
                  }}
                />

                {/* Card Top: Header & Category Info */}
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-red-400">
                          {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                        </span>
                        <span className="h-3 w-px bg-stone-700" />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-stone-400">
                          {meta.tag}
                        </span>
                      </div>

                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#faf8f5] sm:text-3xl">
                        {g.name}
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-stone-700/60 bg-stone-800/80 text-red-400">
                      <CategoryIcon category={g.name} className="h-6 w-6" />
                    </div>
                  </div>

                  <p className="mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-stone-300">
                    {meta.description}
                  </p>
                </div>

                {/* Card Bottom: Technology Badges */}
                <div className="relative pt-6 border-t border-stone-800/80">
                  <div className="flex flex-wrap gap-2.5">
                    {shown.map((s) => (
                      <span
                        key={s._id ?? s.name}
                        className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950/70 px-3.5 py-2 text-xs font-medium text-stone-200 transition-colors hover:border-red-500/40"
                      >
                        <CategoryIcon
                          category={g.name}
                          iconKeyword={s.iconKeyword}
                          skillName={s.name}
                          className="h-4 w-4 text-red-400"
                        />
                        <span>{s.name}</span>
                      </span>
                    ))}

                    {more > 0 && (
                      <Link
                        to="/skills"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2 text-xs font-medium text-red-300 transition-colors hover:border-red-500/60"
                      >
                        <span>+{more} more</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillStackingDeck;
