import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

/**
 * WaypointRail
 * Architectural desktop waypoint navigation.
 * Uses ultra-minimalist micro-ticks without any pill or background container,
 * completely eliminating any "bandage" appearance and blending seamlessly
 * into the Warm Obsidian canvas.
 */
const WaypointRail = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const isFirstVisit =
    typeof window !== "undefined" && !sessionStorage.getItem("dcr_visited_home");
  const [isIntroHeld, setIsIntroHeld] = useState(() => isFirstVisit);

  useEffect(() => {
    if (!isFirstVisit) {
      setIsIntroHeld(false);
      return;
    }

    const timer = setTimeout(() => setIsIntroHeld(false), 3500);
    return () => clearTimeout(timer);
  }, [isFirstVisit]);

  useEffect(() => {
    const handleScroll = () => {
      if (isIntroHeld && window.scrollY > 15) {
        setIsIntroHeld(false);
      }

      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const item = SECTIONS[i];
        const el =
          document.querySelector(`[data-section="${item.id}"]`) ||
          document.getElementById(item.id);

        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      setActiveSection(SECTIONS[0].id);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isIntroHeld]);

  const handleDotClick = (id) => {
    const target =
      document.querySelector(`[data-section="${id}"]`) ||
      document.getElementById(id);

    if (!target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: 0, immediate: reduced, duration: reduced ? 0 : 1.2 });
    } else {
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className={`hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end select-none transition-all duration-1000 ease-out motion-reduce:transition-none ${
        isIntroHeld
          ? "opacity-0 translate-x-4 pointer-events-none"
          : "opacity-100 translate-x-0 pointer-events-auto"
      }`}
    >
      <div className="flex flex-col items-end gap-1">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleDotClick(section.id)}
              aria-label={`Scroll to ${section.label} section`}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center justify-end gap-2.5 py-1.5 pl-4 pr-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded"
            >
              {/* Monospace section indicator: active stays visible, inactive glides in on hover */}
              <span
                className={`font-mono text-[10px] tracking-widest uppercase transition-all duration-200 pointer-events-none whitespace-nowrap ${
                  isActive
                    ? "text-stone-300 opacity-100 translate-x-0"
                    : "text-stone-500 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                }`}
              >
                {section.label}
              </span>

              {/* Bare micro-tick line: no pill card or background container */}
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-6 h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                    : "w-2.5 h-[1.5px] bg-stone-700/80 group-hover:w-4 group-hover:bg-stone-400"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default WaypointRail;
