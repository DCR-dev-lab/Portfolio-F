import { useState } from "react";
import { ExternalLink, Github } from "lucide-react";
import portfolioPlaceholder from "../../assets/images/portfolio-placeholder.svg";

const hasUrl = (u) => Boolean(u) && u !== "#";

/**
 * ExpandedProjects
 * Image-first cards in a row: the hovered / focused / tapped card grows and reveals its details,
 * the others fold down to a slim strip. On phones the row becomes a vertical accordion.
 */
const ExpandedProjects = ({ projects = [] }) => {
  const [active, setActive] = useState(0);
  if (!projects.length) return null;

  return (
    <div className="flex flex-col gap-3 lg:h-[470px] xl:h-[490px] lg:flex-row max-h-[62vh]">
      {projects.map((p, i) => {
        const on = i === active;
        const index = String(i + 1).padStart(2, "0");
        const imageSrc = p.imageUrl || portfolioPlaceholder;

        return (
          <article
            key={p._id ?? i}
            data-active={on}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={p.title}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-stone-950 outline-none transition-[flex-grow,height,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-red-500/60 lg:min-w-0 lg:basis-0 ${
              on
                ? "h-[390px] border-red-500/30 lg:h-auto lg:grow-[3.4]"
                : "h-[88px] border-stone-800 hover:border-stone-700 lg:h-auto lg:grow"
            }`}
          >
            {/* image */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt=""
                loading="lazy"
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 motion-reduce:transition-none ${
                  on
                    ? "scale-100 brightness-[0.75] grayscale-0"
                    : "scale-110 brightness-[0.35] grayscale"
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/55 to-transparent" />
            <div
              className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
                on ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "radial-gradient(ellipse at 50% 120%, rgba(220,38,38,0.22), transparent 65%)",
              }}
            />

            {/* index */}
            <span className="absolute left-4 top-4 font-mono text-xs text-stone-300/80">
              {index}
            </span>

            {/* collapsed label: vertical on desktop, a row on phones */}
            <span
              className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 whitespace-nowrap text-base font-semibold tracking-tight text-stone-100 transition-opacity duration-300 [writing-mode:vertical-rl] lg:block ${
                on ? "opacity-0" : "opacity-100 delay-300"
              }`}
            >
              {p.title}
            </span>
            <span
              className={`absolute inset-y-0 left-14 right-4 flex items-center truncate text-base font-semibold text-stone-100 transition-opacity duration-300 lg:hidden ${
                on ? "opacity-0" : "opacity-100 delay-200"
              }`}
            >
              {p.title}
            </span>

            {/* expanded details */}
            <div
              className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-500 sm:p-6 lg:p-7 ${
                on
                  ? "translate-y-0 opacity-100 delay-300"
                  : "pointer-events-none translate-y-4 opacity-0"
              }`}
            >
              {p.type && (
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="h-px w-6 bg-red-500" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">
                    {p.type}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold leading-tight text-[#faf8f5] sm:text-2xl">
                {p.title}
              </h3>
              {p.shortDescription && (
                <p className="mt-2 line-clamp-2 max-w-md text-xs sm:text-sm leading-relaxed text-stone-300">
                  {p.shortDescription}
                </p>
              )}
              {p.technologies?.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {p.technologies.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-stone-700/70 bg-stone-900/80 px-2.5 py-0.5 font-mono text-[11px] text-stone-300"
                    >
                      {t}
                    </span>
                  ))}
                  {p.technologies.length > 5 && (
                    <span className="rounded-md border border-stone-800 bg-stone-900/80 px-2 py-0.5 font-mono text-[11px] text-red-300">
                      +{p.technologies.length - 5}
                    </span>
                  )}
                </div>
              )}
              {(hasUrl(p.projectUrl) || hasUrl(p.githubUrl)) && (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {hasUrl(p.projectUrl) && (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={on ? 0 : -1}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
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
                      tabIndex={on ? 0 : -1}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900/70 px-4 py-1.5 text-xs font-medium text-stone-200 transition hover:border-red-500/50 hover:text-white"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Source
                    </a>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ExpandedProjects;
