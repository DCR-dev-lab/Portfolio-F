import { useState, useRef, useEffect } from "react";
import { ExternalLink, Github, X } from "lucide-react";
import portfolioPlaceholder from "../../assets/images/portfolio-placeholder.svg";

const hasUrl = (u) => Boolean(u) && u !== "#";

/**
 * MagneticProjectCarousel (Option 3 — Originkit Inspired)
 *
 * Full custom magnetic dock carousel tailored for portfolio projects.
 * - Idle / Hover: Cards rest in a horizontal dock and smoothly swell in width & height
 *   based on cursor proximity (macOS Dock wave using RAF spring physics).
 * - Click: Promotes the selected card to an expanded spotlight card (openWidth x openHeight)
 *   while the background cards blur and dim.
 * - Backdrop: Clicking anywhere outside returns to the magnetic dock.
 */
const MagneticProjectCarousel = ({
  projects = [],
  collapsedWidth = 115,
  hoverWidth = 220,
  collapsedHeight = 360,
  hoverHeight = 420,
  openWidth = 620,
  openHeight = 440,
  gap = 14,
  influence = 210,
  blur = 4,
}) => {
  const items = Array.isArray(projects) && projects.length > 0 ? projects : [];
  const count = items.length;

  const containerRef = useRef(null);
  const [factors, setFactors] = useState(() => items.map(() => 0));
  const [open, setOpen] = useState(null);
  const [closing, setClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const targetRef = useRef(items.map(() => 0));
  const curRef = useRef(items.map(() => 0));
  const loopRef = useRef(0);
  const closeTimer = useRef(null);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync animation buffers when project list changes
  useEffect(() => {
    targetRef.current = Array.from({ length: count }, () => 0);
    curRef.current = Array.from({ length: count }, () => 0);
    setFactors(Array.from({ length: count }, () => 0));
  }, [count]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // Continuous RAF interpolation loop (spring easing)
  const startLoop = () => {
    if (loopRef.current) return;
    const step = () => {
      const tgt = targetRef.current;
      const cur = curRef.current;
      let moving = false;
      for (let i = 0; i < cur.length; i++) {
        const d = (tgt[i] ?? 0) - cur[i];
        if (Math.abs(d) > 0.001) {
          cur[i] += d * 0.2; // spring velocity
          moving = true;
        } else {
          cur[i] = tgt[i] ?? 0;
        }
      }
      setFactors([...cur]);
      loopRef.current = moving ? requestAnimationFrame(step) : 0;
    };
    loopRef.current = requestAnimationFrame(step);
  };

  const setTargetFromCursor = (clientX) => {
    const el = containerRef.current;
    if (!el || isMobile) return;
    const rect = el.getBoundingClientRect();
    const cx = clientX - rect.left;
    const n = items.length;

    const cWidth = collapsedWidth;
    const totalBase = n * cWidth + (n - 1) * gap;
    const startX = (rect.width - totalBase) / 2;

    targetRef.current = items.map((_, i) => {
      const center = startX + i * (cWidth + gap) + cWidth / 2;
      const dist = Math.abs(cx - center);
      const f = Math.max(0, 1 - dist / influence);
      return f * f * (3 - 2 * f); // Hermite smoothstep curve
    });

    startLoop();
  };

  const onMouseMove = (e) => {
    if (open !== null || isMobile) return;
    setTargetFromCursor(e.clientX);
  };

  const onMouseLeave = () => {
    if (open !== null || isMobile) return;
    targetRef.current = items.map(() => 0);
    startLoop();
  };

  const close = () => {
    targetRef.current = items.map(() => 0);
    curRef.current = items.map(() => 0);
    setFactors(items.map(() => 0));
    setClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setClosing(false), 500);
    setOpen(null);
  };

  // Dimensions computation
  const sizeFor = (i) => {
    if (isMobile) {
      return {
        width: "100%",
        height: open === i ? 420 : 92,
      };
    }

    if (open !== null) {
      return i === open
        ? { width: Math.min(openWidth, window.innerWidth - 60), height: openHeight }
        : { width: Math.max(70, collapsedWidth - 25), height: collapsedHeight - 30 };
    }

    const f = factors[i] ?? 0;
    return {
      width: collapsedWidth + (hoverWidth - collapsedWidth) * f,
      height: collapsedHeight + (hoverHeight - collapsedHeight) * f,
    };
  };

  if (!items.length) return null;

  const barTransition =
    open !== null || closing
      ? "width 500ms cubic-bezier(0.22, 1, 0.36, 1), height 500ms cubic-bezier(0.22, 1, 0.36, 1), filter 400ms ease, opacity 400ms ease, transform 400ms ease"
      : "border-color 300ms ease, box-shadow 300ms ease";

  return (
    <div className="relative w-full py-4 flex flex-col items-center justify-center">
      {/* Click-outside backdrop when a card is opened in spotlight */}
      {open !== null && (
        <div
          onClick={close}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
          aria-label="Close project preview"
        />
      )}

      {/* Magnetic Carousel Track */}
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`relative w-full flex items-center justify-center ${
          isMobile
            ? "flex-col gap-3"
            : "flex-row overflow-visible min-h-[460px]"
        }`}
        style={{ gap: isMobile ? 12 : gap }}
      >
        {items.map((p, i) => {
          const isOpen = open === i;
          const isBlurred = open !== null && !isOpen;
          const { width, height } = sizeFor(i);
          const factor = factors[i] ?? 0;
          const index = String(i + 1).padStart(2, "0");
          const imageSrc = p.imageUrl || portfolioPlaceholder;

          return (
            <article
              key={p._id ?? i}
              onClick={(e) => {
                e.stopPropagation();
                if (isOpen) close();
                else setOpen(i);
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (isOpen) close();
                  else setOpen(i);
                } else if (e.key === "Escape" && isOpen) {
                  close();
                }
              }}
              aria-label={p.title}
              style={{
                width,
                height,
                transition: barTransition,
                zIndex: isOpen ? 30 : 10,
                filter: isBlurred ? `blur(${blur}px)` : "none",
                opacity: isBlurred ? 0.38 : 1,
                boxShadow:
                  isOpen
                    ? "0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(220, 38, 38, 0.25)"
                    : factor > 0.08
                    ? `0 12px 30px -5px rgba(0, 0, 0, 0.6), 0 0 20px rgba(220, 38, 38, ${factor * 0.28})`
                    : "0 8px 24px -4px rgba(0, 0, 0, 0.5)",
              }}
              className={`group relative overflow-hidden rounded-2xl border bg-stone-950 cursor-pointer select-none outline-none ${
                isOpen
                  ? "border-red-500/50 ring-1 ring-red-500/30"
                  : factor > 0.1
                  ? "border-red-500/40"
                  : "border-stone-800 hover:border-stone-700"
              }`}
            >
              {/* Background Project Image */}
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                style={{
                  filter: isOpen
                    ? "brightness(0.75) grayscale(0)"
                    : `brightness(${0.35 + factor * 0.35}) grayscale(${Math.max(
                        0,
                        1 - factor * 0.85
                      )})`,
                  transform: isOpen
                    ? "scale(1)"
                    : `scale(${1.1 - factor * 0.05})`,
                }}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-500"
              />

              {/* Obsidian Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/60 to-transparent" />
              <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                  isOpen || factor > 0.2 ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 120%, rgba(220,38,38,0.25), transparent 65%)",
                }}
              />

              {/* Top Bar: Index + Close Button */}
              <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-10">
                <span
                  className={`font-mono text-xs transition-colors duration-300 ${
                    isOpen || factor > 0.15
                      ? "text-red-400 font-bold"
                      : "text-stone-300/80"
                  }`}
                >
                  {index}
                </span>

                {isOpen && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                    aria-label="Close details"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/80 border border-stone-700 text-stone-300 hover:border-red-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Collapsed Slat Labels (Desktop & Mobile) */}
              {!isOpen && (
                <>
                  {/* Vertical title on desktop */}
                  <span
                    className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 whitespace-nowrap text-sm font-semibold tracking-tight transition-all duration-300 [writing-mode:vertical-rl] md:block ${
                      factor > 0.15
                        ? "text-white"
                        : "text-stone-300/80"
                    }`}
                  >
                    {p.title}
                  </span>

                  {/* Horizontal title on mobile */}
                  <span className="absolute inset-y-0 left-14 right-4 flex items-center truncate text-base font-semibold text-stone-100 md:hidden">
                    {p.title}
                  </span>
                </>
              )}

              {/* Opened Spotlight Content */}
              {isOpen && (
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10 transition-all duration-500 animate-fadeIn">
                  {p.type && (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-px w-6 bg-red-500" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">
                        {p.type}
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold leading-tight text-[#faf8f5] sm:text-3xl">
                    {p.title}
                  </h3>

                  {p.shortDescription && (
                    <p className="mt-2.5 line-clamp-3 max-w-lg text-xs sm:text-sm leading-relaxed text-stone-300">
                      {p.shortDescription}
                    </p>
                  )}

                  {p.technologies?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.technologies.slice(0, 6).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-stone-700/70 bg-stone-900/80 px-2.5 py-0.5 font-mono text-[11px] text-stone-300"
                        >
                          {t}
                        </span>
                      ))}
                      {p.technologies.length > 6 && (
                        <span className="rounded-md border border-stone-800 bg-stone-900/80 px-2 py-0.5 font-mono text-[11px] text-red-300">
                          +{p.technologies.length - 6}
                        </span>
                      )}
                    </div>
                  )}

                  {(hasUrl(p.projectUrl) || hasUrl(p.githubUrl)) && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      {hasUrl(p.projectUrl) && (
                        <a
                          href={p.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Live Demo
                        </a>
                      )}
                      {hasUrl(p.githubUrl) && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900/80 px-4 py-2 text-xs font-medium text-stone-200 transition hover:border-red-500/50 hover:text-white"
                        >
                          <Github className="h-3.5 w-3.5" />
                          Source Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default MagneticProjectCarousel;
