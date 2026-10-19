import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, ArrowRight, ChevronDown } from "lucide-react";
import PulseDot from "../ui/PulseDot";
import SocialLinks from "../common/SocialLinks";
import ParticleHeading from "../particles/ParticleHeading";

/**
 * Hero
 * Renders the hero typography, CTA buttons, and status indicators.
 * The 3D particle text and ambient dust are handled seamlessly by the
 * shared GlobalParticleCanvas behind the page, aligning with boxRef.
 */
const Hero = ({ profile, onScrollToNext }) => {
  const [isVisible, setIsVisible] = useState(false);

  const heroProfile = {
    fullName: "Denny Charles Raj",
    title: "Full Stack Developer & UI Architect",
    shortIntro:
      "I build fast, resilient web products, from pixel-perfect interfaces to the APIs that power them.",
    socialLinks: {},
    ...profile,
  };
  const { fullName, title, shortIntro, resumeUrl, socialLinks } = heroProfile;

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
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleScrollClick = () => {
    if (onScrollToNext) onScrollToNext();
    else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const validateUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const reveal = (delay) =>
    `transition-all duration-1000 ${delay} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  const btnBase =
    "w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]";

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-transparent text-[#faf8f5] flex flex-col">
      <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-6 pt-24 pb-6 flex flex-col items-center justify-center text-center pointer-events-none">
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 mb-4 rounded-full bg-stone-900/70 border border-stone-800 backdrop-blur-md ${reveal("delay-[1900ms]")}`}
        >
          <PulseDot />
          <span className="text-xs font-mono tracking-wide text-stone-300">
            Available for new projects
          </span>
        </div>

        {/* The name is drawn in particles inside this box; the real h1 stays in the DOM for SEO and screen readers */}
        <ParticleHeading
          as="h1"
          text={cleanFullName}
          splitOnMobile
          intro
          cap={6500}
          capMobile={3200}
          className="w-[min(92vw,1240px)] h-[88vw] max-h-[380px] md:h-[10vw] md:max-h-[140px]"
        />

        <h2
          className={`mt-4 text-lg sm:text-2xl font-medium text-red-300/90 tracking-tight ${reveal("delay-[1900ms]")}`}
        >
          {displayTitle}
        </h2>

        <p
          className={`mt-3 text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed ${reveal("delay-[2200ms]")}`}
        >
          {shortIntro}
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center gap-3 pt-7 w-full sm:w-auto pointer-events-auto ${reveal("delay-[2500ms]")}`}
        >
          <Link
            to="/projects"
            className={`${btnBase} group bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50`}
            aria-label="View portfolio projects"
          >
            <span>Explore Featured Work</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {resumeUrl && validateUrl(resumeUrl) ? (
            <a
              href={resumeUrl}
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

        <div className={`pt-6 pointer-events-auto ${reveal("delay-[2800ms]")}`}>
          <SocialLinks socialLinks={socialLinks} variant="circles" />
        </div>
      </div>

      <div className={`relative z-10 pb-4 flex flex-col items-center gap-2 ${reveal("delay-[3200ms]")}`}>
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-stone-600">
          <span className="sm:hidden">Tap to shatter</span>
          <span className="hidden sm:inline">
            Move your cursor · Click to shatter
          </span>
        </span>
        <button
          onClick={handleScrollClick}
          className="flex flex-col items-center gap-1 text-stone-500 hover:text-red-400 transition-colors"
          aria-label="Scroll to next section"
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase">
            Scroll
          </span>
          <ChevronDown className="w-4 h-4 text-red-500 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

export default Hero;
