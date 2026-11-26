import { ExternalLink, Github, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { isSafeUrl, sanitizeHref } from "../../utils/security";

export const hasValidUrl = (url) =>
  isSafeUrl(url, { allowMailTel: false }) && url !== "#" && url !== "";

/**
 * Reusable spotlight project details block:
 * displays project type banner, title, description, technology tags, and action buttons.
 */
export const SpotlightProjectContent = ({
  project,
  isOpen = true,
  maxTech = 6,
  titleClassName = "text-2xl font-bold leading-tight text-[#faf8f5] sm:text-3xl",
}) => {
  if (!project) return null;

  return (
    <>
      {project.type && (
        <div className="mb-2 sm:mb-3 flex items-center gap-2">
          <span className="h-px w-6 bg-red-500" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-red-400">
            {project.type}
          </span>
        </div>
      )}

      <h3 className={titleClassName}>{project.title}</h3>

      {project.shortDescription && (
        <p className="mt-2 sm:mt-2.5 line-clamp-3 max-w-lg text-xs sm:text-sm leading-relaxed text-stone-300">
          {project.shortDescription}
        </p>
      )}

      {project.technologies?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.technologies.slice(0, maxTech).map((t) => (
            <span
              key={t}
              className="rounded-md border border-stone-700/70 bg-stone-900/80 px-2.5 py-0.5 font-mono text-[11px] text-stone-300"
            >
              {t}
            </span>
          ))}
          {project.technologies.length > maxTech && (
            <span className="rounded-md border border-stone-800 bg-stone-900/80 px-2 py-0.5 font-mono text-[11px] text-red-300">
              +{project.technologies.length - maxTech}
            </span>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
        {hasValidUrl(project.projectUrl) && (
          <a
            href={sanitizeHref(project.projectUrl)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-sm shadow-red-900/40 transition hover:bg-red-500 active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live Demo
          </a>
        )}
        {hasValidUrl(project.githubUrl) && (
          <a
            href={sanitizeHref(project.githubUrl)}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900/80 px-4 sm:px-5 py-2 text-xs font-medium text-stone-200 transition hover:border-red-500/50 hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            Source Code
          </a>
        )}
        {project._id && !hasValidUrl(project.projectUrl) && !hasValidUrl(project.githubUrl) && (
          <Link
            to={`/projects?project=${project._id}`}
            tabIndex={isOpen ? 0 : -1}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/40 px-4 sm:px-5 py-2 text-xs font-medium text-red-300 transition hover:border-red-500 hover:text-white active:scale-95"
          >
            <span>View Architecture</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </>
  );
};

export default SpotlightProjectContent;
