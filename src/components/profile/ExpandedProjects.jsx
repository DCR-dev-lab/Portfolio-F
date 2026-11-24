import { useState } from "react";
import portfolioPlaceholder from "../../assets/images/portfolio-placeholder.svg";
import SpotlightProjectContent from "./SpotlightProjectContent";

/**
 * ExpandedProjects
 * Image-first cards in a row: the hovered / focused / tapped card grows and reveals its details,
 * the others fold down to a slim strip. On phones the row becomes a vertical accordion.
 */
const ExpandedProjects = ({ projects = [] }) => {
    const [active, setActive] = useState(0);
    if (!projects.length) return null;

    return (
        <div data-no-shatter className="flex flex-col gap-3 lg:h-[540px] lg:flex-row">
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
                        onKeyDown={(e) => {
                            // only when the card itself is focused, so Enter on the links inside still opens them
                            if (e.target !== e.currentTarget) return;
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setActive(i);
                            }
                        }}
                        aria-label={p.title}
                        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-stone-950 outline-none transition-[flex-grow,height,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-red-500/60 lg:min-w-0 lg:basis-0 ${
                            on
                                ? "h-[420px] border-red-500/30 lg:h-auto lg:grow-[3.2]"
                                : "h-[92px] border-stone-800 hover:border-stone-700 lg:h-auto lg:grow"
                        }`}
                    >
                        {/* image */}
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt=""
                                loading="lazy"
                                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 motion-reduce:transition-none ${
                                    on ? "scale-100 brightness-[0.75] grayscale-0" : "scale-110 brightness-[0.35] grayscale"
                                }`}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/55 to-transparent" />
                        <div
                            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`}
                            style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(220,38,38,0.22), transparent 65%)" }}
                        />

                        {/* index */}
                        <span className="absolute left-4 top-4 font-mono text-xs text-stone-300/80">{index}</span>

                        {/* collapsed label: vertical on desktop, a row on phones */}
                        <span
                            className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 rotate-180 whitespace-nowrap text-lg font-semibold tracking-tight text-stone-100 transition-opacity duration-300 [writing-mode:vertical-rl] lg:block ${
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
                            className={`absolute inset-x-0 bottom-0 p-5 transition-all duration-500 sm:p-7 lg:p-8 ${
                                on ? "translate-y-0 opacity-100 delay-300" : "pointer-events-none translate-y-4 opacity-0"
                            }`}
                        >
                            <SpotlightProjectContent project={p} isOpen={on} maxTech={5} />
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default ExpandedProjects;
