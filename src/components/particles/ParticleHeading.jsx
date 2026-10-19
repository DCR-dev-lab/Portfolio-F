import { useEffect, useRef, useSyncExternalStore } from "react";
import { registerHeading, subscribe, getStatus } from "./particleRegistry";

/**
 * ParticleHeading
 * Reserves a box for a heading and registers it with the page-wide <ParticleStage>,
 * which gathers particles out of the atmosphere to spell the text inside that box.
 * The real heading stays in the DOM (sr-only) for SEO and screen readers, and shows
 * as normal text if the particle stage can't run (no WebGL).
 *
 * Size the box with className, e.g. "w-[min(92vw,500px)] h-[100px]".
 */
const ParticleHeading = ({
  text,
  as: Tag = "h2",
  className = "",
  align = "center", // "center" | "left"
  splitOnMobile = false, // hero name: 3 lines on phones
  cap, // max particles on desktop
  capMobile, // max particles on phones
  intro = false, // slower, more dramatic first gather (use for the hero name)
  fallbackClassName = "text-4xl sm:text-6xl font-extrabold tracking-tight text-[#faf8f5]",
}) => {
  const ref = useRef(null);
  const status = useSyncExternalStore(subscribe, getStatus, getStatus);

  useEffect(() => {
    if (!ref.current) return;
    return registerHeading({ el: ref.current, text, align, splitOnMobile, cap, capMobile, intro });
  }, [text, align, splitOnMobile, cap, capMobile, intro]);

  const failed = status === "failed";
  return (
    <div
      ref={ref}
      className={`${className} ${failed ? `flex items-center ${align === "left" ? "justify-start" : "justify-center"}` : ""}`}
    >
      <Tag className={failed ? fallbackClassName : "sr-only"}>{text}</Tag>
    </div>
  );
};

export default ParticleHeading;
