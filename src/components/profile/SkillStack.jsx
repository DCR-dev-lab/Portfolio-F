import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";

/**
 * SkillStack (True Deck Stage)
 * - Single pinned stage: all cards live in one unified container.
 * - Cards slide in and pack flush behind at exact mathematical offsets.
 * - Zero hiking up, zero broken gaps, zero vanishing cards.
 * - The entire deck stays packed together and exits as a unified physical block.
 */

/**
 * Minimalist domain subtitles reflecting engineering scope
 */
const SUBTITLE_RULES = [
  [/analytic|visuali[sz]/i, "Data analysis, dashboards & visualization"],
  [
    /\b(front[\s-]?end|ui|ux|client|design)\b/i,
    "Client architecture & interactive interfaces",
  ],
  [/\b(back[\s-]?end|api|server)\b/i, "Services, APIs & server-side logic"],
  [/\b(data(base)?s?|db|sql|storage)\b/i, "Data modeling & persistence"],
  [/auth|secur/i, "Authentication, security & access control"],
  [
    /\b(tools?|dev[\s-]?ops|cloud|infra\w*|deploy\w*)\b/i,
    "Developer tooling, environments & workflows",
  ],
  [/\b(test\w*|qa)\b/i, "Testing & reliability"],
  [/\b(perform\w*|optimi[sz]\w*)\b/i, "Speed, profiling & optimization"],
];
const getCategorySubtitle = (name = "") =>
  (SUBTITLE_RULES.find(([re]) => re.test(name)) || [])[1] || null;

/**
 * Quintic smootherstep easing (Perlin curve)
 * Smoothly ramps velocity and acceleration to 0 at both endpoints for buttery deceleration.
 */
const smootherstep = (t) => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
};

/**
 * Compute strictly monotonic keyframes with continuous Hermite smoothing for card i
 */
function computeCardKeyframes(i, total) {
  if (total <= 1) {
    return {
      input: [0, 1],
      y: [0, 0],
      scale: [1, 1],
      dim: [0, 0],
      zIndex: 20,
    };
  }

  const steps = total - 1;
  const stepSize = 1 / steps;
  const input = [];
  const y = [];
  const scale = [];
  const dim = [];

  // Helper to push keyframe ensuring strictly increasing input progression
  const pushPoint = (t, yVal, sVal, dVal) => {
    const lastT = input.length > 0 ? input[input.length - 1] : -1;
    const safeT = t <= lastT ? lastT + 0.0005 : t;
    input.push(Number(safeT.toFixed(5)));
    y.push(Number(yVal.toFixed(2)));
    scale.push(Number(sVal.toFixed(4)));
    dim.push(Number(dVal.toFixed(4)));
  };

  // Option A (Lift & Reveal): Card 0 is on top of deck (zIndex: 20), cards 1..N wait underneath
  const zIndex = 20 - i;

  // Initial state at scroll = 0:
  // Card 0 is front and center. Cards 1..N wait quietly underneath in the deck.
  if (i === 0) {
    pushPoint(0, 0, 1.0, 0);
  } else {
    pushPoint(0, 0, 0.95, 0.25);
  }

  // Generate transition steps with subdivision smoothing
  const SUBDIVISIONS = 8;

  for (let k = 0; k < steps; k++) {
    const stepProgressStart = k * stepSize;
    const stepProgressEnd = (k + 1) * stepSize;

    // Transition window: generous reading pause, then smooth lift, settled pause
    const tActiveStart = stepProgressStart + stepSize * 0.12;
    const tActiveEnd = stepProgressEnd - stepSize * 0.08;

    // Pre-step resting plateau
    if (tActiveStart > 0) {
      if (k < i) {
        // Still waiting underneath in the deck
        pushPoint(tActiveStart, 0, 0.95, 0.25);
      } else if (k === i) {
        // Currently active in front
        pushPoint(tActiveStart, 0, 1.0, 0);
      } else {
        // Already lifted away to the top
        pushPoint(tActiveStart, -600, 0.92, 0.4);
      }
    }

    // Subdivided Hermite smootherstep interpolation
    for (let s = 1; s <= SUBDIVISIONS; s++) {
      const frac = s / SUBDIVISIONS;
      const t = tActiveStart + frac * (tActiveEnd - tActiveStart);
      const ease = smootherstep(frac);

      if (k < i - 1) {
        // Still resting deep underneath
        pushPoint(t, 0, 0.95, 0.25);
      } else if (k === i - 1) {
        // Being REVEALED as the card above lifts away: scales up into focus
        const currentScale = 0.95 * (1 - ease) + 1.0 * ease;
        const currentDim = 0.25 * (1 - ease) + 0 * ease;
        pushPoint(t, 0, currentScale, currentDim);
      } else if (k === i) {
        // LIFTING UP and away off the deck to cleanly reveal the card beneath
        const currentY = 0 * (1 - ease) + -600 * ease;
        const currentScale = 1.0 * (1 - ease) + 0.92 * ease;
        const currentDim = 0 * (1 - ease) + 0.4 * ease;
        pushPoint(t, currentY, currentScale, currentDim);
      } else {
        // Already lifted away
        pushPoint(t, -600, 0.92, 0.4);
      }
    }

    // Post-step settled plateau until next step begins
    if (k < steps - 1) {
      const nextStepStart = (k + 1) * stepSize;
      if (k + 1 < i) {
        pushPoint(nextStepStart, 0, 0.95, 0.25);
      } else if (k + 1 === i) {
        pushPoint(nextStepStart, 0, 1.0, 0);
      } else {
        pushPoint(nextStepStart, -600, 0.92, 0.4);
      }
    }
  }

  // Final state at scroll = 1
  if (i === total - 1) {
    // The final card stays front and center
    pushPoint(1, 0, 1.0, 0);
  } else {
    // Previous cards are parked cleanly above the stage
    pushPoint(1, -600, 0.92, 0.4);
  }

  return {
    input,
    y,
    scale,
    dim,
    zIndex,
  };
}

const DeckCard = ({ group, i, total, progress, perCategory, reduce }) => {
  const subtitle = getCategorySubtitle(group.name);
  const shown = group.items.slice(0, perCategory);
  const more = group.items.length - shown.length;
  const tint = 0.14 + i * 0.03;
  const glow =
    i % 2 === 0
      ? `radial-gradient(ellipse at 90% 0%, rgba(220,38,38,${tint}), transparent 55%)`
      : `radial-gradient(ellipse at 8% 100%, rgba(220,38,38,${tint}), transparent 55%)`;

  const keyframes = useMemo(() => computeCardKeyframes(i, total), [i, total]);

  const cardY = useTransform(progress, keyframes.input, keyframes.y);
  const cardScale = useTransform(progress, keyframes.input, keyframes.scale);
  const cardDim = useTransform(progress, keyframes.input, keyframes.dim);

  return (
    <motion.div
      style={
        reduce
          ? { position: "relative", marginBottom: "2rem" }
          : {
              position: "absolute",
              inset: 0,
              y: cardY,
              scale: cardScale,
              zIndex: keyframes.zIndex,
              transformOrigin: "top center",
            }
      }
      className="will-change-transform"
    >
      <article
        className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c0a09] p-5 sm:p-7 md:p-9 lg:p-10 transition-colors duration-300 hover:border-red-500/35"
        style={{
          boxShadow:
            "0 -18px 45px -15px rgba(0,0,0,0.95), 0 24px 50px -10px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Surface Base: obsidian gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, #150f0e 0%, #0c0807 50%, #070504 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: glow }}
        />

        {/* Top Hairline Accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

        {/* Content Layer (Harmonious 2-Column Grid on Desktop, Centered Flow on Mobile) */}
        <div className="relative z-10 flex flex-col justify-center md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] h-full gap-5 sm:gap-6 md:gap-8 items-center">
          {/* Left Column: Title and Subtitle (Pure Confident Editorial Typography) */}
          <div className="flex flex-col justify-center gap-1.5 sm:gap-2.5 w-full md:w-auto text-left">
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#faf8f5] break-words">
              {group.name}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-[13px] font-mono text-stone-400/85 tracking-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Column: Skill Chips and Link (Balanced Flow with Inline Brand Icons) */}
          <div className="flex flex-wrap items-center content-center gap-2 sm:gap-2.5 w-full">
            {shown.map((s) => (
              <span
                key={s._id ?? s.name}
                className="group/chip inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-stone-900/60 px-3 py-1.5 text-xs sm:text-[13px] font-medium text-stone-200 backdrop-blur-md transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-white"
              >
                <CategoryIcon
                  category={group.name}
                  iconKeyword={s.iconKeyword}
                  skillName={s.name}
                  className="h-3.5 w-3.5 shrink-0 text-red-400/80 transition-colors duration-200 group-hover/chip:text-red-300"
                />
                <span>{s.name}</span>
              </span>
            ))}
            {more > 0 && (
              <Link
                to="/skills"
                className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-1.5 text-xs sm:text-[13px] font-medium text-red-300 backdrop-blur-md transition-colors hover:border-red-500/60 hover:text-red-200"
              >
                +{more} more
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Depth cue darkening overlay */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#0c0a09]"
          style={reduce ? { opacity: 0 } : { opacity: cardDim }}
        />
      </article>
    </motion.div>
  );
};

const SkillStack = ({ skills = [], perCategory = 8, maxCategories = 5 }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

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
          (a, b) => (Number(b.proficiency) || 0) - (Number(a.proficiency) || 0),
        ),
      }))
      .sort(
        (a, b) =>
          b.items.length - a.items.length || a.name.localeCompare(b.name),
      )
      .slice(0, maxCategories);
  }, [skills, maxCategories]);

  const total = groups.length;
  if (!total) return null;

  // Total scroll travel height: ~85vh per transition + 100vh stage visibility
  const runwayHeight = reduce
    ? "auto"
    : `${Math.max(1, total - 1) * 85 + 100}vh`;

  return (
    <div ref={ref} className="relative w-full" style={{ height: runwayHeight }}>
      {/* Pinned Stage: Stays centered in viewport during scroll */}
      <div
        className={
          reduce
            ? "w-full"
            : "sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center px-4 sm:px-6"
        }
      >
        <div className="relative w-full max-w-4xl h-[min(480px,68vh)] sm:h-[420px] md:h-[400px]">
          {groups.map((g, i) => (
            <DeckCard
              key={g.name}
              group={g}
              i={i}
              total={total}
              progress={scrollYProgress}
              perCategory={perCategory}
              reduce={reduce}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillStack;
