import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowRight, ChevronDown } from "lucide-react";
import PulseDot from "../ui/PulseDot";
import SocialLinks from "../common/SocialLinks";
import ParticleHeading from "../particles/ParticleHeading";
import { isSafeUrl, sanitizeHref } from "../../utils/security";

/**
 * Hero
 * Renders the hero typography, CTA buttons, and status indicators.
 * The 3D particle text and ambient dust are handled seamlessly by the
 * shared GlobalParticleCanvas behind the page, aligning with boxRef.
 */
const Hero = ({ profile, onScrollToNext, isReturnVisit = false }) => {
  const hasVisited = isReturnVisit || (typeof window !== "undefined" && sessionStorage.getItem("dcr_visited_home") === "true");
  const [isVisible, setIsVisible] = useState(() => hasVisited);

  const heroProfile = {
    fullName: "Denny Charles Raj",
    title: "Full Stack Developer & UI Architect",
    shortIntro:
      "I build fast, resilient web products, from pixel-perfect interfaces to the APIs that power them.",
    socialLinks: {},
    ...profile,
  };
  const { fullName, title, shortIntro, resumeUrl, socialLinks } = heroProfile;
  const statusAvailable = heroProfile.isAvailable ?? true;
  const statusText =
    (heroProfile.availabilityText || "").trim() ||
    (statusAvailable ? "Available for new projects" : "Currently unavailable");

  const rawName = (fullName || "Denny Charles Raj").trim();
  const cleanFullName = rawName.endsWith(".")
    ? rawName.slice(0, -1).trim()
    : rawName;

  const displayTitle = (() => {
    if (!title) return "Full Stack Developer & UI Architect";
    const parts = title
      .split("&")
      .map((t) => t.trim())
      .filter(Boolean);
    return parts.length >= 2 ? `${parts[0]} & ${parts[1]}` : parts[0] || title;
  })();

  useEffect(() => {
    if (!isVisible) {
      const t = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const handleScrollClick = () => {
    if (onScrollToNext) {
      onScrollToNext();
      return;
    }
    const nextSection = document.querySelector('[data-section="about"]');
    if (window.__lenis) {
      window.__lenis.scrollTo(nextSection || window.innerHeight);
    } else if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const reveal = (delay) =>
    hasVisited
      ? `transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`
      : `transition-all duration-1000 ${delay} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  const btnBase =
    "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950";

  return (
    <section id="hero" data-section="hero" className="relative min-h-[100dvh] overflow-hidden bg-transparent text-[#faf8f5] flex flex-col">
      <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 pt-12 sm:pt-20 md:pt-24 pb-4 sm:pb-6 flex flex-col items-center justify-center text-center pointer-events-none">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 mb-3 sm:mb-4 rounded-full bg-stone-900/70 border border-stone-800 backdrop-blur-md ${reveal("delay-[800ms]")}`}
        >
          <PulseDot active={statusAvailable} />
          <span className="text-xs font-mono tracking-wide text-stone-300">
            {statusText}
          </span>
        </div>

        {/* The name is drawn in particles inside this box; the real h1 stays in the DOM for SEO and screen readers */}
        <ParticleHeading
          as="h1"
          text={cleanFullName}
          splitOnMobile
          intro={!hasVisited}
          cap={6500}
          capMobile={3200}
          className="w-full max-w-[1240px] h-[58vw] max-h-[220px] sm:h-[45vw] sm:max-h-[260px] md:h-[10vw] md:max-h-[140px]"
        />

        <h2
          className={`mt-3 sm:mt-4 text-base sm:text-2xl font-medium text-red-300/90 tracking-tight ${reveal("delay-[1000ms]")}`}
        >
          {displayTitle}
        </h2>

        <p
          className={`mt-2 sm:mt-3 text-xs sm:text-base text-stone-400 max-w-xl leading-relaxed ${reveal("delay-[1200ms]")}`}
        >
          {shortIntro}
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-5 sm:pt-7 w-full sm:w-auto pointer-events-auto ${reveal("delay-[1400ms]")}`}
        >
          <Link
            to="/projects"
            className={`${btnBase} group bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50`}
            aria-label="View portfolio projects"
          >
            <span>Explore Featured Work</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {resumeUrl && isSafeUrl(resumeUrl, { allowMailTel: false }) ? (
            <a
              href={sanitizeHref(resumeUrl)}
              target="_blank"
              rel="noreferrer"
              className={`${btnBase} bg-stone-900/60 backdrop-blur border border-stone-700 text-stone-200 hover:text-white hover:border-red-500/60`}
              aria-label="Download resume"
            >
              <Download className="w-4 h-4 text-red-400" />
              <span>Download Resume</span>
            </a>
          ) : (
            <Link
              to="/contact"
              className={`${btnBase} bg-stone-900/60 backdrop-blur border border-stone-700 text-stone-200 hover:text-white hover:border-red-500/60`}
              aria-label="Get in touch"
            >
              <span>Get in Touch</span>
            </Link>
          )}
        </div>

        <div className={`pt-4 sm:pt-6 pointer-events-auto ${reveal("delay-[1600ms]")}`}>
          <SocialLinks socialLinks={socialLinks} variant="circles" />
        </div>
      </div>

      <div className={`relative z-10 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-4 flex flex-col items-center gap-1.5 ${reveal("delay-[1900ms]")}`}>
        <span aria-hidden="true" className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-600">
          <span className="sm:hidden">Tap to shatter</span>
          <span className="hidden sm:inline">
            Move your cursor · Click to shatter
          </span>
        </span>
        <button
          onClick={handleScrollClick}
          className="flex flex-col items-center gap-1 text-stone-500 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded-lg p-1 group"
          aria-label="Scroll to next section"
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase">
            Scroll
          </span>
          <ChevronDown className="w-4 h-4 text-red-500 transition-transform duration-300 group-hover:translate-y-0.5 animate-bounce motion-reduce:animate-none" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
