import { ArrowRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import useScrollReveal from "../../hooks/useScrollReveal";
import EmptyState from "../ui/EmptyState";
import ParticleHeading from "../particles/ParticleHeading";
import SkillCategoryCards from "./SkillCategoryCards";
import TechMarquee from "./TechMarquee";

/**
 * SkillsPreview
 * `skills` should be the full list: the cards group it by category and show the top
 * `perCategory` skills in each (set from the API / profile settings).
 */
const SkillsPreview = ({ skills, perCategory = 6 }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 });
  const hasSkills = skills && skills.length > 0;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 bg-transparent border-t border-stone-800/40 overflow-hidden"
    >
      <div className="relative max-w-6xl mx-auto">
        <div
          className={`text-center mb-14 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-3 rounded-full bg-stone-900/70 border border-stone-800">
            <Code2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-mono tracking-wide text-stone-300">Core Capabilities</span>
          </div>

          <ParticleHeading
            text="Skills"
            className="w-[min(92vw,480px)] h-[80px] sm:h-[100px] md:h-[115px] mx-auto"
          />

          <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Technologies and tools I specialize in to build fast, robust web applications.
          </p>
        </div>

        {hasSkills ? (
          <>
            <SkillCategoryCards skills={skills} perCategory={perCategory} revealed={isVisible} />

            <TechMarquee skills={skills} className="mt-12 md:mt-16" />

            <div
              className={`text-center mt-12 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <Link
                to="/skills"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-stone-900/70 border border-stone-800 text-stone-200 font-medium text-sm hover:border-red-500/40 hover:text-red-400 transition-all hover:scale-105 active:scale-95 group"
              >
                <span>Explore Full Toolkit</span>
                <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        ) : (
          <EmptyState title="No skills to display" className="py-12" />
        )}
      </div>
    </section>
  );
};

export default SkillsPreview;