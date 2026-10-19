import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import useScrollReveal from "../../hooks/useScrollReveal";
import ParticleHeading from "../particles/ParticleHeading";
import ExpandedProjects from "./ExpandedProjects";

/**
 * FeaturedProjects
 * `projects` is already limited by the parent (count comes from the API / profile settings).
 * Nothing is shown if there are no real projects (no placeholder demo projects).
 */
const FeaturedProjects = ({ projects }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 });

  if (!projects || projects.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] py-10 md:py-14 px-6 bg-transparent border-t border-stone-800/40 overflow-hidden flex flex-col justify-center"
    >
      <div className="relative max-w-7xl mx-auto w-full">
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-2 rounded-full bg-stone-900/70 border border-stone-800">
              <Briefcase className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-mono tracking-wide text-stone-300">Selected Work</span>
            </div>

            <ParticleHeading
              text="Projects"
              align="left"
              className="w-[min(92vw,480px)] h-[60px] sm:h-[75px] md:h-[85px]"
            />
          </div>

          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/70 border border-stone-800 text-stone-200 font-medium text-sm hover:border-red-500/40 hover:text-red-400 transition-all hover:scale-105 active:scale-95"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div
          className={`transition-all duration-700 delay-150 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <ExpandedProjects projects={projects} />
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
