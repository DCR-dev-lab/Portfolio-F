import { ArrowUpRight, MapPin } from "lucide-react";
import useScrollReveal from "../../hooks/useScrollReveal";
import { useReducedMotion } from "motion/react";
import { isSafeUrl, sanitizeHref } from "../../utils/security";

/**
 * AboutMe
 * Intentional editorial stillness — the deliberate breath between Hero and Projects.
 * One large display-scale statement, maximum obsidian space, one crimson accent.
 * No cards, no badges, no pillar lists. The whitespace is the design.
 */
const AboutMe = ({ about, profile }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const reduce = useReducedMotion();

  const rawLocation = profile?.location || "Tamil Nadu, India";
  const location = rawLocation.replace(/,([^\s])/g, ", $1");

  // The display statement — pulled from profile or falls back to the brand voice
  const rawStatement =
    about ||
    "I build fast, resilient web products — from pixel-perfect interfaces to the systems that power them.";
  const displayStatement = rawStatement
    .replace(/\s+\./g, ".")
    .replace(/\s+,/g, ",")
    .trim();

  // Split into lines for staggered reveal.
  // Preserve natural breaks by splitting on em-dash or comma boundaries.
  const lines = splitIntoLines(displayStatement);

  // Two-line bio beneath the statement — compact, metadata-like
  const introParts = profile?.shortIntro
    ? profile.shortIntro.split(".").map((s) => s.trim()).filter(Boolean)
    : [];
  const bioLine1 = (introParts[0] || "Developer with a background in mathematics").replace(/\.+$/, "");
  const bioLine2 =
    introParts.length > 1
      ? `${introParts.slice(1).join(". ")}.`
      : "Focused on performance, clean architecture & DX.";

  const delay = (ms) =>
    reduce
      ? {}
      : isVisible
        ? { opacity: 1, transform: "translateY(0)", transition: `opacity 0.8s ease ${ms}ms, transform 0.8s ease ${ms}ms` }
        : { opacity: 0, transform: "translateY(28px)" };

  return (
    <section
      ref={sectionRef}
      data-section="about"
      aria-labelledby="about-heading"
      className="relative min-h-[100dvh] flex flex-col justify-center bg-transparent border-t border-stone-800/40 px-5 sm:px-10 lg:px-16 py-14 sm:py-20 md:py-28 overflow-hidden"
    >
      {/* Subtle top hairline bridge for seamless transition from Hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-700/60 to-transparent"
      />
      <div className="relative max-w-5xl mx-auto w-full">

        {/* Top metadata line */}
        <div
          className="flex items-center justify-between mb-8 sm:mb-14 md:mb-20"
          style={delay(0)}
        >
          <span className="text-[11px] font-mono tracking-[0.18em] uppercase text-stone-400 font-medium">
            Who I am
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wide text-stone-300">
            <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-red-500" />
            {location}
          </span>
        </div>

        {/* Large display statement — the centrepiece */}
        <div className="mb-8 sm:mb-12 md:mb-16">
          {/* sr-only heading for screen readers and section labelling */}
          <h2 id="about-heading" className="sr-only">About</h2>
          {lines.map((line, i) => {
            const { text, accent } = parseAccent(line);
            return (
              <div
                key={i}
                style={delay(120 + i * 110)}
                className="overflow-hidden"
              >
                <p
                  className="text-[clamp(1.35rem,4.2vw,3.75rem)] font-semibold leading-[1.2] sm:leading-[1.12] tracking-[-0.03em] text-[#faf8f5] motion-reduce:transition-none"
                >
                  {text}
                  {accent && (
                    <span className="text-red-400">{accent}</span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Engineering Proof Strip — subtle technical discipline */}
        <div
          className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 pt-5 sm:pt-6 mb-6 sm:mb-8 border-t border-stone-800/40 text-[11px] font-mono text-stone-500 tracking-wider"
          style={delay(120 + lines.length * 110 + 40)}
        >
          <span className="flex items-center gap-1.5 text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            60 FPS WebGL Stage
          </span>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <span className="hover:text-stone-300 transition-colors">Sub-20ms Frame Budget</span>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <span className="hover:text-stone-300 transition-colors">Zero-Reflow Physics</span>
          <span className="text-stone-700 hidden sm:inline">•</span>
          <span className="hover:text-stone-300 transition-colors">Static SEO Pre-rendered</span>
        </div>

        {/* Bottom row: compact bio + resume */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 sm:pt-8 border-t border-stone-800/50"
          style={delay(120 + lines.length * 110 + 80)}
        >
          {/* Two-line bio */}
          <div className="space-y-1 sm:space-y-1.5">
            <p className="text-xs sm:text-[13px] font-mono text-stone-300 leading-relaxed">
              {bioLine1}.
            </p>
            <p className="text-xs sm:text-[13px] font-mono text-stone-400 leading-relaxed">
              {bioLine2}
            </p>
          </div>

          {/* Resume link — minimal */}
          {profile?.resumeUrl && isSafeUrl(profile.resumeUrl, { allowMailTel: false }) && (
            <a
              href={sanitizeHref(profile.resumeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View resume in a new tab"
              className="group inline-flex items-center gap-2 text-xs sm:text-[13px] font-mono text-stone-400 hover:text-[#faf8f5] transition-colors duration-300 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <span>View Resume</span>
              <ArrowUpRight
                aria-hidden="true"
                className="w-3.5 h-3.5 text-stone-500 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
              />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

/**
 * Splits a long statement into display lines.
 * Breaks on " — ", " - ", "," or every ~5 words for natural rhythm.
 */
function splitIntoLines(text) {
  // Try natural break points first
  const naturalBreaks = text.split(/\s*[—–]\s*/);
  if (naturalBreaks.length >= 2) {
    // Further split the last segment if too long
    return naturalBreaks.flatMap((chunk) => splitByLength(chunk.trim(), 7));
  }
  // Fallback: split by comma
  const commaBreaks = text.split(/,\s*/);
  if (commaBreaks.length >= 2) {
    return commaBreaks.flatMap((chunk) => splitByLength(chunk.trim(), 7));
  }
  // Final fallback: word-count chunks
  return splitByLength(text, 6);
}

/** Splits a text string into chunks of at most `maxWords` words */
function splitByLength(text, maxWords) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

/**
 * Identifies if a line contains a word/phrase to accent in crimson.
 * Returns { text, accent } where accent is appended in red.
 */
function parseAccent(line) {
  // Accent specific engineering words that carry meaning
  const accentWords = [
    "pixel-perfect",
    "pixel‑perfect",
    "resilient",
    "precision",
    "fast,",
    "fast",
  ];
  const lower = line.toLowerCase();
  for (const word of accentWords) {
    const idx = lower.indexOf(word);
    if (idx !== -1) {
      const before = line.slice(0, idx);
      const accent = line.slice(idx, idx + word.length);
      const after = line.slice(idx + word.length);
      // Only accent if it looks good (accent + rest on same line)
      return { text: before, accent: accent + after };
    }
  }
  return { text: line, accent: null };
}

export default AboutMe;
