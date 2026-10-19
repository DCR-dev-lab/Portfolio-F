import {
  ArrowUpRight,
  Code2,
  UserRound,
  Cpu,
  MapPin,
  Terminal,
} from "lucide-react";

import useScrollReveal from "../../hooks/useScrollReveal";
import ParticleHeading from "../particles/ParticleHeading";

const AboutMe = ({ about, profile }) => {
  const [sectionRef, isVisible] = useScrollReveal({
    threshold: 0.15,
  });

  const corePillars = [
    {
      num: "01",
      title: "Logical Problem Solving",
      icon: Cpu,
    },
    {
      num: "02",
      title: "Frontend & User Experience",
      icon: Code2,
    },
    {
      num: "03",
      title: "Clean & Maintainable Code",
      icon: Terminal,
    },
  ];

  const location = profile?.location || "Tamil Nadu, India";

  const narrativeText =
    about ||
    "I'm a developer with a background in mathematics who enjoys turning complex problems into practical web applications. I approach development with logical thinking, attention to detail, and a focus on building intuitive user experiences.\n\nThrough hands-on projects, I'm continuously improving my skills in frontend development, backend systems, and writing maintainable code. I enjoy learning new technologies and turning ideas into products people can actually use.";

  const revealClass = (delay = "") =>
    `transition-all duration-700 motion-reduce:transition-none ${delay} ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
    }`;

  return (
    <section
      ref={sectionRef}
      data-section="about"
      aria-labelledby="about-heading"
      className="relative min-h-[100dvh] py-16 md:py-24 px-5 sm:px-8 lg:px-10 bg-transparent border-t border-stone-800/40 overflow-hidden flex flex-col justify-center"
    >
      <div className="relative max-w-6xl mx-auto w-full">
        {/* Section Header */}
        <div className={`${revealClass()} mb-10 md:mb-12`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/60 border border-stone-800/80">
              <UserRound
                aria-hidden="true"
                className="w-3.5 h-3.5 text-red-400"
              />
              <span className="text-xs font-mono tracking-wide text-stone-300">
                WHO I AM
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
              <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-red-400" />

              <span>{location}</span>
            </div>
          </div>

          <ParticleHeading
            text="About"
            align="left"
            className="w-[min(92vw,460px)] h-[55px] sm:h-[65px] md:h-[75px]"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Headline and Core Pillars */}
          <div className={`${revealClass("delay-100")} lg:col-span-6`}>
            <div className="mb-8">
              <span className="block mb-3 text-[11px] font-mono uppercase tracking-widest text-red-400">
                My Approach
              </span>

              <h2
                id="about-heading"
                className="text-xl sm:text-2xl lg:text-[26px] font-semibold tracking-[-0.02em] text-[#faf8f5] leading-snug"
              >
                Building useful web experiences through{" "}
                <span className="text-red-400">thoughtful engineering.</span>
              </h2>
            </div>

            <div className="border-t border-white/[0.08]">
              {corePillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <div
                    key={pillar.num}
                    className="group flex items-center gap-4 py-3.5 border-b border-white/[0.06] transition-colors duration-300 hover:border-red-500/30"
                  >
                    <span className="text-xs font-mono font-medium text-red-400/90">
                      {pillar.num}
                    </span>

                    <Icon
                      aria-hidden="true"
                      className="w-4 h-4 shrink-0 text-stone-500 group-hover:text-red-400 transition-colors duration-300"
                    />

                    <span className="text-sm font-medium tracking-tight text-stone-200 group-hover:text-white transition-colors duration-300">
                      {pillar.title}
                    </span>

                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-stone-700/80 group-hover:bg-red-400 transition-colors duration-300" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Narrative and Resume */}
          <div className={`${revealClass("delay-200")} lg:col-span-6 lg:pt-1`}>
            <div className="mb-8">
              <span className="block mb-4 text-[11px] font-mono uppercase tracking-widest text-stone-400">
                My Story
              </span>

              <div className="space-y-4">
                {(typeof narrativeText === "string"
                  ? narrativeText.split("\n\n").filter(Boolean)
                  : [narrativeText]
                ).map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? "text-stone-200 text-sm sm:text-[15px] leading-relaxed font-normal"
                        : "text-stone-400 text-xs sm:text-sm leading-relaxed"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Resume Link */}
            {profile?.resumeUrl && (
              <div className="pt-6 border-t border-white/[0.08]">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View resume in a new tab"
                  className="group inline-flex items-center gap-2.5 rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-2.5 text-xs font-mono font-medium text-stone-300 transition-all duration-300 hover:border-red-500/40 hover:text-white hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span>View Resume</span>

                  <ArrowUpRight
                    aria-hidden="true"
                    className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                  />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
