import { Code2 } from "lucide-react";
import useScrollReveal from "../../hooks/useScrollReveal";
import EmptyState from "../ui/EmptyState";
import ParticleHeading from "../particles/ParticleHeading";
import SkillStack from "./SkillStack";

/**
 * SkillsPreview
 * Showcases core technical domains with a clean, scroll-linked stacking deck.
 * NOTE: this section must not use `overflow-hidden`, or the sticky stack stops working.
 */
const SkillsPreview = ({ skills, perCategory = 8, loading = false }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 });
  const hasSkills = skills && skills.length > 0;

  return (
    <section
      ref={sectionRef}
      id="skills"
      data-section="skills"
      aria-labelledby="skills-heading"
      className="relative py-14 sm:py-24 md:py-32 px-4 sm:px-6 bg-transparent border-t border-stone-800/40 overflow-x-clip"
    >
      <div className="relative max-w-6xl mx-auto">
        <div
          className={`text-center mb-8 sm:mb-14 md:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 sm:mb-5 rounded-full bg-stone-900/70 border border-stone-800">
            <Code2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-mono tracking-wide text-stone-300">
              Core Capabilities
            </span>
          </div>

          <ParticleHeading
            id="skills-heading"
            text="Skills"
            className="w-full max-w-[380px] md:max-w-[340px] h-[52px] sm:h-[64px] md:h-[72px] mx-auto"
          />

          <p className="mt-2 sm:mt-3 text-stone-400 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Technologies and tools I specialize in to build fast, robust web
            applications.
          </p>
        </div>

        {loading ? (
          <div
            aria-hidden="true"
            className="max-w-4xl mx-auto h-[min(380px,58vh)] sm:h-[400px] rounded-3xl border border-stone-800/50 bg-stone-900/30 animate-pulse"
          />
        ) : hasSkills ? (
          /* Stacking deck tailored to max-w-4xl so background particle atmosphere breathes */
          <div className="max-w-4xl mx-auto">
            <SkillStack
              skills={skills}
              perCategory={perCategory}
            />
          </div>
        ) : (
          <EmptyState title="No skills to display" className="py-12" />
        )}
      </div>
    </section>
  );
};

export default SkillsPreview;
