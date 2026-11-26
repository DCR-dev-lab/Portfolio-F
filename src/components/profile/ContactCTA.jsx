import { useState, useRef, useEffect } from "react";
import { Mail, Phone, ArrowRight, MessageSquare, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import useScrollReveal from "../../hooks/useScrollReveal";
import ParticleHeading from "../particles/ParticleHeading";
import WhisperFooter from "../common/WhisperFooter";

/**
 * ContactCTA
 * The open, cardless closing section of the Home page.
 * The 3D particles form "Let's talk." directly in the open atmosphere.
 * Concludes with a whisper-quiet baseline bar (copyright, legal, back-to-top)
 * with zero opaque background, letting stardust float through to the bottom.
 */
const ContactCTA = ({ profile }) => {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.15 });
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(0);

  useEffect(() => () => clearTimeout(copyTimerRef.current), []);

  const handleCopyEmail = async () => {
    if (!profile?.email) return;
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const reveal = (delay = "") =>
    `transition-all duration-700 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${delay} ${
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
    }`;

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-section="contact"
      aria-labelledby="contact-heading"
      className="relative min-h-[100dvh] pt-20 sm:pt-32 pb-8 px-6 bg-transparent border-t border-stone-800/40 overflow-hidden flex flex-col justify-between"
    >
      {/* Main Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center my-auto">
        {/* Status / Badge Pill */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1 mb-4 sm:mb-5 rounded-full bg-stone-900/70 border border-stone-800 backdrop-blur-md ${reveal("")}`}
        >
          <MessageSquare aria-hidden="true" className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-mono tracking-wide text-stone-300">
            Start A Conversation
          </span>
        </div>

        <ParticleHeading
          id="contact-heading"
          text="Let’s talk."
          cap={3200}
          capMobile={2200}
          className="w-full max-w-[680px] md:max-w-[460px] h-[68px] sm:h-[88px] md:h-[84px]"
        />

        {/* Subtitle / Question */}
        <h3
          className={`mt-3 sm:mt-4 text-base sm:text-2xl font-medium text-red-300/90 tracking-tight ${reveal("delay-200")}`}
        >
          Every great project starts with a conversation.
        </h3>

        <p
          className={`mt-2 sm:mt-3 text-xs sm:text-base text-stone-300/90 max-w-xl leading-relaxed ${reveal("delay-300")}`}
        >
          Whether you have an upcoming project, architecture questions, or a
          potential role, I'm always open to discussing new opportunities.
        </p>

        {/* Direct Contact Links with WCAG 44px mobile touch targets */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
          {profile?.email && (
            <div
              className={`inline-flex items-center rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-800 hover:border-red-500/40 transition-all ${reveal("delay-[450ms]")}`}
            >
              <a
                href={`mailto:${profile.email}`}
                className="min-h-[44px] inline-flex items-center gap-2 pl-5 pr-3 py-2.5 text-stone-300 font-medium text-xs font-mono hover:text-red-400 transition-colors rounded-l-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span>{profile.email}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label={copied ? "Email copied to clipboard" : "Copy email address"}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center pr-4 pl-2.5 border-l border-stone-800/80 text-stone-400 hover:text-red-400 transition-colors cursor-pointer rounded-r-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
          {profile?.phone && (
            <a
              href={`tel:${profile.phone}`}
              className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-800 text-stone-300 font-medium text-xs font-mono hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${reveal("delay-[580ms]")}`}
            >
              <Phone className="w-4 h-4 text-red-400" />
              <span>{profile.phone}</span>
            </a>
          )}
        </div>

        {/* Primary Action Button */}
        <div className={`pt-6 sm:pt-8 ${reveal("delay-[600ms]")}`}>
          <Link
            to="/contact"
            className="min-h-[48px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-xl shadow-red-950/60 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-950 group"
          >
            <span>Reach Out Directly</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Whisper-Quiet Baseline Closure */}
      <WhisperFooter
        className={`max-w-6xl mx-auto pt-16 sm:pt-20 ${reveal("delay-[950ms]")}`}
      />
    </section>
  );
};

export default ContactCTA;
