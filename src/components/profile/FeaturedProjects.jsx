import { useMemo } from "react";
import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import useScrollReveal from "../../hooks/useScrollReveal";
import ParticleHeading from "../particles/ParticleHeading";
import MagneticProjects from "./MagneticProjects";
import { CURTAIN_DEPTH } from "../../constants/layout";

export { CURTAIN_DEPTH };

const FALLBACK_7_PROJECTS = [
  {
    _id: "demo-1",
    title: "DevPulse Analytics",
    type: "FULL STACK WEB APP",
    shortDescription:
      "Real-time telemetry and API performance monitoring dashboard with automated anomaly detection.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/612d1402-0ad9-4135-3bbc-a30a6a252b00/w=800",
    technologies: ["React", "Node.js", "TimescaleDB", "Tailwind CSS", "WebSockets"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-2",
    title: "OmniFlow AI Canvas",
    type: "AI PLATFORM",
    shortDescription:
      "Interactive node-based canvas for orchestrating multi-agent LLM workflows and streaming generative completions.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/6d2ad64a-102d-4eab-0efe-31479e34b500/w=800",
    technologies: ["TypeScript", "Three.js", "Python", "FastAPI", "Tailwind CSS"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-3",
    title: "Nexus Orchestrator",
    type: "CLOUD ARCHITECTURE",
    shortDescription:
      "Microservice orchestration and continuous deployment platform with instant rollback pipelines.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/be854dd1-37aa-4fc7-f569-fdb948109300/w=800",
    technologies: ["Go", "Docker", "Kubernetes", "Next.js", "PostgreSQL"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-4",
    title: "Krypton DeFi Terminal",
    type: "FINTECH INTERFACE",
    shortDescription:
      "High-frequency decentralized market visualizer with sub-second order book matching and gas estimation.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/51984031-9176-484b-f5e0-4af9a8e9ed00/w=800",
    technologies: ["React", "Web3.js", "Solidity", "Tailwind CSS", "Chart.js"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-5",
    title: "Quantum Code Studio",
    type: "DEVELOPER TOOLING",
    shortDescription:
      "In-browser collaborative code editor and syntax tree visualizer with real-time peer synchronization.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/34ce1842-4b7a-4d52-0302-38582c341700/w=800",
    technologies: ["React", "Monaco Editor", "WebAssembly", "CRDT", "WebSockets"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-6",
    title: "Aether Design System",
    type: "UI ARCHITECTURE",
    shortDescription:
      "Accessible, theme-aware component architecture built for speed and consistent multi-platform rendering.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/88369c6d-00cc-4ac9-74ca-0f0965e06300/w=800",
    technologies: ["TypeScript", "Tailwind CSS", "Radix UI", "Storybook"],
    projectUrl: "#",
    githubUrl: "#",
  },
  {
    _id: "demo-7",
    title: "Hyperion Vector Engine",
    type: "DATA ENGINE",
    shortDescription:
      "Distributed vector indexing and similarity search pipeline for low-latency RAG retrieval.",
    imageUrl:
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/aeaa0756-9647-4f6c-d900-204bd25e4a00/w=800",
    technologies: ["Python", "FastAPI", "Redis", "Pinecone", "Docker"],
    projectUrl: "#",
    githubUrl: "#",
  },
];

const EMPTY_PROJECTS = [];

/**
 * FeaturedProjects
 * Automatically adapts across all screen sizes:
 * - Desktop (>= 720px): Magnetic Dock Carousel with smooth proximity wave & spotlight expansion.
 * - Mobile (< 720px): Clean vertical accordion stack.
 */
const FeaturedProjects = ({ projects = EMPTY_PROJECTS, loading = false }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.1 });

  const displayProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects.filter(Boolean) : [];
    // Only fall back to dummy demo projects if user has no projects at all (and not loading)
    if (list.length > 0) return list;
    return FALLBACK_7_PROJECTS;
  }, [projects]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-section="projects"
      data-magnetic-area
      aria-labelledby="projects-heading"
      className="relative min-h-[100dvh] py-10 md:py-14 px-6 bg-transparent border-t border-stone-800/40 overflow-hidden flex flex-col justify-center"
    >
      {/* Volumetric Laser Curtain Threshold (Top Entry) */}
      <div
        aria-hidden="true"
        style={{ height: `${CURTAIN_DEPTH}px` }}
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-red-500/[0.08] via-red-500/[0.02] to-transparent"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
      </div>
      {/* Volumetric Laser Curtain Threshold (Bottom Exit) */}
      <div
        aria-hidden="true"
        style={{ height: `${CURTAIN_DEPTH}px` }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-red-500/[0.08] via-red-500/[0.02] to-transparent"
      >
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.7)]" />
      </div>
      <div className="relative max-w-7xl mx-auto w-full">
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-8 gap-4 transition-all duration-700 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex flex-col items-start w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 sm:mb-5 rounded-full bg-stone-900/70 border border-stone-800">
              <Briefcase aria-hidden="true" className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-mono tracking-wide text-stone-300">Selected Work</span>
            </div>

            <ParticleHeading
              id="projects-heading"
              text="Projects"
              align="left"
              className="w-full md:w-[320px] h-[52px] sm:h-[60px] md:h-[68px]"
            />
          </div>

          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/70 border border-stone-800 text-stone-200 font-medium text-sm hover:border-red-500/40 hover:text-red-400 transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 shrink-0 mt-1 md:mt-0"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div
          className={`transition-all duration-700 delay-150 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {loading ? (
            <div
              aria-hidden="true"
              className="w-full"
            >
              <div className="hidden md:flex items-center justify-center gap-3 h-[340px]">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-[340px] flex-1 max-w-[110px] rounded-2xl border border-stone-800/50 bg-stone-900/30 animate-pulse"
                  />
                ))}
              </div>
              <div className="flex flex-col gap-3 md:hidden">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-24 w-full rounded-2xl border border-stone-800/50 bg-stone-900/30 animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <MagneticProjects projects={displayProjects} />
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
