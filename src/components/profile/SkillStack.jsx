import { useMemo, useRef, useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";
import { groupSkillsByCategory } from "../../utils/skillHelpers";

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
 * Handcrafted Analog Resting Offsets
 * Gives underlying cards in the deck an organic, human-dealt feel.
 * The active top card is always perfectly straight (0 deg, 0 px) for crisp reading;
 * cards waiting underneath peek out with subtle, alternating micro-tilts and offsets.
 */
const RESTING_OFFSETS = [
  { x: 0,   y: 0,  rotate: 0,    scale: 1.00, dim: 0.00 }, // Card 0 (front & center)
  { x: 10,  y: 6,  rotate: 2.2,  scale: 0.97, dim: 0.18 }, // Card 1 (peeks top-right)
  { x: -11, y: 12, rotate: -2.0, scale: 0.94, dim: 0.26 }, // Card 2 (peeks top-left)
  { x: 9,   y: 18, rotate: 1.7,  scale: 0.91, dim: 0.34 }, // Card 3 (peeks right)
  { x: -8,  y: 22, rotate: -1.5, scale: 0.88, dim: 0.40 }, // Card 4 (peeks left)
];

const getRestingConfig = (index) => {
  if (index === 0) return RESTING_OFFSETS[0];
  if (index < RESTING_OFFSETS.length) return RESTING_OFFSETS[index];
  const sign = index % 2 === 1 ? 1 : -1;
  return {
    x: sign * (8 + (index % 3) * 2),
    y: Math.min(26, 6 * index),
    rotate: sign * Math.max(1.0, 2.5 - index * 0.2),
    scale: Math.max(0.85, 1.0 - 0.03 * index),
    dim: Math.min(0.45, 0.15 + index * 0.07),
  };
};

/**
 * Organic Asymmetrical Throw Profiles
 * Each card flicks into the atmosphere with an organic, hand-dealt trajectory
 * rather than a repeating mechanical loop.
 */
const THROW_PROFILES = [
  { x: -310, y: -540, rotate: -14, scale: 0.88 }, // Card 0: sweeps top-left
  { x: 280,  y: -510, rotate: 11,  scale: 0.90 }, // Card 1: sails top-right
  { x: -290, y: -560, rotate: -16, scale: 0.87 }, // Card 2: high arc top-left
  { x: 315,  y: -500, rotate: 13,  scale: 0.89 }, // Card 3: drifts top-right
  { x: -295, y: -530, rotate: -13, scale: 0.88 }, // Card 4: sweeps top-left
];

const getThrowProfile = (index) => {
  if (index < THROW_PROFILES.length) return THROW_PROFILES[index];
  const isEven = index % 2 === 0;
  return {
    x: isEven ? -290 : 290,
    y: -520 - (index % 3) * 20,
    rotate: isEven ? -13 : 13,
    scale: 0.89,
  };
};

/**
 * Compute strictly monotonic keyframes with continuous Hermite smoothing for card i
 */
function computeCardKeyframes(i, total) {
  if (total <= 1) {
    return {
      input: [0, 1],
      x: [0, 0],
      y: [0, 0],
      rotate: [0, 0],
      scale: [1, 1],
      opacity: [1, 1],
      dim: [0, 0],
      zIndex: 20,
    };
  }

  const resting = getRestingConfig(i);
  const throwing = getThrowProfile(i);

  const steps = total - 1;
  const stepSize = 1 / steps;
  const input = [];
  const x = [];
  const y = [];
  const rotate = [];
  const scale = [];
  const opacity = [];
  const dim = [];

  // Helper to push keyframe ensuring strictly increasing input progression
  const pushPoint = (t, xVal, yVal, rVal, sVal, oVal, dVal) => {
    const lastT = input.length > 0 ? input[input.length - 1] : -1;
    const safeT = t <= lastT ? lastT + 0.0005 : t;
    input.push(Number(safeT.toFixed(5)));
    x.push(Number(xVal.toFixed(2)));
    y.push(Number(yVal.toFixed(2)));
    rotate.push(Number(rVal.toFixed(2)));
    scale.push(Number(sVal.toFixed(4)));
    opacity.push(Number(oVal.toFixed(4)));
    dim.push(Number(dVal.toFixed(4)));
  };

  // Stack Order: Card 0 is on top of deck (zIndex: 20), cards 1..N wait underneath
  const zIndex = 20 - i;

  // Initial state at scroll = 0:
  // Card 0 is straight front & center. Cards 1..N rest with subtle organic peeks.
  pushPoint(0, resting.x, resting.y, resting.rotate, resting.scale, 1.0, resting.dim);

  // Generate transition steps with subdivision smoothing
  const SUBDIVISIONS = 8;

  for (let k = 0; k < steps; k++) {
    const stepProgressStart = k * stepSize;
    const stepProgressEnd = (k + 1) * stepSize;

    // Transition window: generous reading pause, then smooth curved throw, settled pause
    const tActiveStart = stepProgressStart + stepSize * 0.12;
    const tActiveEnd = stepProgressEnd - stepSize * 0.08;

    // Pre-step resting plateau
    if (tActiveStart > 0) {
      if (k < i) {
        // Still waiting underneath in the deck at its organic resting peek
        pushPoint(tActiveStart, resting.x, resting.y, resting.rotate, resting.scale, 1.0, resting.dim);
      } else if (k === i) {
        // Currently active in front: straight and centered for reading
        pushPoint(tActiveStart, 0, 0, 0, 1.0, 1.0, 0);
      } else {
        // Already thrown away into the atmosphere
        pushPoint(tActiveStart, throwing.x, throwing.y, throwing.rotate, throwing.scale, 0.0, 0.4);
      }
    }

    // Subdivided Hermite smootherstep interpolation
    for (let s = 1; s <= SUBDIVISIONS; s++) {
      const frac = s / SUBDIVISIONS;
      const t = tActiveStart + frac * (tActiveEnd - tActiveStart);
      const ease = smootherstep(frac);

      if (k < i - 1) {
        // Still resting underneath in the deck
        pushPoint(t, resting.x, resting.y, resting.rotate, resting.scale, 1.0, resting.dim);
      } else if (k === i - 1) {
        // Being REVEALED as the card above throws away:
        // Smoothly un-tilts from resting angle into straight 0 deg reading position!
        const currentX = resting.x * (1 - ease) + 0 * ease;
        const currentY = resting.y * (1 - ease) + 0 * ease;
        const currentRotate = resting.rotate * (1 - ease) + 0 * ease;
        const currentScale = resting.scale * (1 - ease) + 1.0 * ease;
        const currentDim = resting.dim * (1 - ease) + 0 * ease;
        pushPoint(t, currentX, currentY, currentRotate, currentScale, 1.0, currentDim);
      } else if (k === i) {
        // THROWING AWAY: Arcs outwards, tilts along throw profile, dissolves into atmosphere
        const currentX = 0 * (1 - ease) + throwing.x * ease;
        const currentY = 0 * (1 - ease) + throwing.y * ease;
        const currentRotate = 0 * (1 - ease) + throwing.rotate * ease;
        const currentScale = 1.0 * (1 - ease) + throwing.scale * ease;
        const currentOpacity =
          frac < 0.35 ? 1.0 : Math.max(0, 1.0 - (frac - 0.35) / 0.65);
        const currentDim = 0 * (1 - ease) + 0.4 * ease;
        pushPoint(
          t,
          currentX,
          currentY,
          currentRotate,
          currentScale,
          currentOpacity,
          currentDim,
        );
      } else {
        // Already thrown away
        pushPoint(t, throwing.x, throwing.y, throwing.rotate, throwing.scale, 0.0, 0.4);
      }
    }

    // Post-step settled plateau until next step begins
    if (k < steps - 1) {
      const nextStepStart = (k + 1) * stepSize;
      if (k + 1 < i) {
        pushPoint(nextStepStart, resting.x, resting.y, resting.rotate, resting.scale, 1.0, resting.dim);
      } else if (k + 1 === i) {
        pushPoint(nextStepStart, 0, 0, 0, 1.0, 1.0, 0);
      } else {
        pushPoint(nextStepStart, throwing.x, throwing.y, throwing.rotate, throwing.scale, 0.0, 0.4);
      }
    }
  }

  // Final state at scroll = 1
  if (i === total - 1) {
    // The final card stays front and center
    pushPoint(1, 0, 0, 0, 1.0, 1.0, 0);
  } else {
    // Previous cards are parked cleanly thrown into the atmosphere
    pushPoint(1, throwing.x, throwing.y, throwing.rotate, throwing.scale, 0.0, 0.4);
  }

  return {
    input,
    x,
    y,
    rotate,
    scale,
    opacity,
    dim,
    zIndex,
  };
}

const DeckCard = ({ group, i, total, progress, perCategory, reduce }) => {
  const [expanded, setExpanded] = useState(false);
  const subtitle = getCategorySubtitle(group.name);
  const shown = expanded ? group.items : group.items.slice(0, perCategory);
  const more = group.items.length - Math.min(group.items.length, perCategory);
  const tint = 0.14 + i * 0.03;
  const glow =
    i % 2 === 0
      ? `radial-gradient(ellipse at 90% 0%, rgba(220,38,38,${tint}), transparent 55%)`
      : `radial-gradient(ellipse at 8% 100%, rgba(220,38,38,${tint}), transparent 55%)`;

  const keyframes = useMemo(() => computeCardKeyframes(i, total), [i, total]);

  const cardX = useTransform(progress, keyframes.input, keyframes.x);
  const cardY = useTransform(progress, keyframes.input, keyframes.y);
  const cardRotate = useTransform(progress, keyframes.input, keyframes.rotate);
  const cardScale = useTransform(progress, keyframes.input, keyframes.scale);
  const cardOpacity = useTransform(progress, keyframes.input, keyframes.opacity);
  const cardDim = useTransform(progress, keyframes.input, keyframes.dim);

  return (
    <motion.div
      style={
        reduce
          ? { position: "relative", marginBottom: "2rem" }
          : {
              position: "absolute",
              inset: 0,
              x: cardX,
              y: cardY,
              rotate: cardRotate,
              scale: cardScale,
              opacity: cardOpacity,
              zIndex: keyframes.zIndex,
              transformOrigin: "bottom center",
            }
      }
      className="will-change-transform"
    >
      <article
        aria-label={group.name}
        className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c0a09] p-4 sm:p-7 md:p-9 lg:p-10 transition-colors duration-300 hover:border-red-500/35"
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

        {/* Quiet Mono Deck Index Counter (01 / 05) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3.5 right-4 sm:top-6 sm:right-8 font-mono text-[11px] sm:text-xs tracking-widest text-stone-500/70 select-none z-20"
        >
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>

        {/* Content Layer (Harmonious 2-Column Grid on Desktop, Centered Flow on Mobile) */}
        <div className="relative z-10 flex flex-col justify-center md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] h-full gap-3 sm:gap-6 md:gap-8 items-center">
          {/* Left Column: Title and Subtitle (Pure Confident Editorial Typography) */}
          <div className="flex flex-col justify-center gap-1 sm:gap-2.5 w-full md:w-auto text-left">
            <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#faf8f5] break-words">
              {group.name}
            </h3>
            {subtitle && (
              <p className="text-[11px] sm:text-[13px] font-mono text-stone-400/85 tracking-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right Column: Skill Chips and Link (Balanced Flow with Inline Brand Icons) */}
          <div className="flex flex-wrap items-center content-center gap-1.5 sm:gap-2.5 w-full">
            {shown.map((s) => (
              <span
                key={s._id ?? s.name}
                className="group/chip inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/[0.08] bg-stone-900/60 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-[13px] font-medium text-stone-200 backdrop-blur-md transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-white"
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
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-950/30 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-[13px] font-medium text-red-300 backdrop-blur-md transition-colors hover:border-red-500/60 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {expanded ? "Show less" : `+${more} more`}
              </button>
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
  const scrollYProgress = useMotionValue(0);

  // Directly track runway scroll against viewport with zero layout thrashing.
  // Pre-computes document-space runway offset and calculates progress directly via window.scrollY.
  useEffect(() => {
    if (reduce) return;

    let ticking = false;
    let cachedMetrics = null;

    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      cachedMetrics = {
        topDoc: rect.top + window.scrollY,
        height: rect.height,
      };
    };

    const updateProgress = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      if (!cachedMetrics) measure();
      if (!cachedMetrics) return;

      const maxScroll = cachedMetrics.height - window.innerHeight;
      if (maxScroll <= 0) {
        scrollYProgress.set(0);
        return;
      }
      // -rect.top is calculated in memory from cached document offset: 0 DOM layout queries
      const rectTop = cachedMetrics.topDoc - window.scrollY;
      const p = Math.min(1, Math.max(0, -rectTop / maxScroll));
      scrollYProgress.set(p);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateProgress);
      }
    };

    const onResize = () => {
      cachedMetrics = null;
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    measure();
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [scrollYProgress, reduce]);

  const groups = useMemo(
    () => groupSkillsByCategory(skills, maxCategories),
    [skills, maxCategories]
  );

  const total = groups.length;
  if (!total) return null;

  // Responsive scroll runway height: 65vh per step on mobile, 82vh on desktop
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 768;
  const vhPerStep = isMobileScreen ? 65 : 82;
  const runwayHeight = reduce
    ? "auto"
    : `${Math.max(1, total - 1) * vhPerStep + 100}vh`;

  return (
    <div ref={ref} className="relative w-full" style={{ height: runwayHeight }}>
      {/* Pinned Stage: Stays centered in viewport during scroll, cleared above mobile dock */}
      <div
        className={
          reduce
            ? "w-full"
            : "sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center pb-12 md:pb-0 px-4 sm:px-6"
        }
      >
        <div className="relative w-full max-w-4xl h-[min(380px,58vh)] sm:h-[400px] md:h-[400px]">
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
