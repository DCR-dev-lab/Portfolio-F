import { Mail, Phone, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import useScrollReveal from '../../hooks/useScrollReveal';
import ParticleHeading from '../particles/ParticleHeading';

/**
 * ContactCTA
 * The open, cardless closing section mirroring the Hero layout.
 * The 3D particles form "Let's talk." directly in the open atmosphere
 * with zero z-index obstruction or card backgrounds.
 */
const ContactCTA = ({ profile }) => {
    const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.15 });


    const reveal = (delay = '') =>
        `transition-all duration-700 ${delay} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`;

    return (
        <section
            ref={sectionRef}
            className="relative py-28 md:py-36 px-6 bg-transparent border-t border-stone-800/40 overflow-hidden"
        >
            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
                {/* Status / Badge Pill */}
                <div
                    className={`inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full bg-stone-900/70 border border-stone-800 backdrop-blur-md ${reveal('')}`}
                >
                    <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-xs font-mono tracking-wide text-stone-300">
                        Start A Conversation
                    </span>
                </div>

                <ParticleHeading
                    text="Let’s talk."
                    cap={3200}
                    capMobile={1800}
                    className="w-[min(92vw,800px)] h-[110px] sm:h-[130px] md:h-[150px]"
                />

                {/* Subtitle / Question */}
                <h3
                    className={`mt-4 text-lg sm:text-2xl font-medium text-red-300/90 tracking-tight ${reveal('delay-200')}`}
                >
                    Ready to Build Something Great?
                </h3>

                <p
                    className={`mt-3 text-sm sm:text-base text-stone-400 max-w-xl leading-relaxed ${reveal('delay-300')}`}
                >
                    Whether you have an upcoming project, architecture questions, or a potential role, I'm always open to discussing new opportunities.
                </p>

                {/* Direct Contact Links */}
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    {profile?.email && (
                        <a
                            href={`mailto:${profile.email}`}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/70 backdrop-blur-md border border-stone-800 text-stone-300 font-medium text-xs font-mono hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105 ${reveal('delay-[450ms]')}`}
                        >
                            <Mail className="w-4 h-4 text-red-400" />
                            <span>{profile.email}</span>
                        </a>
                    )}
                    {profile?.phone && (
                        <a
                            href={`tel:${profile.phone}`}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900/70 backdrop-blur-md border border-stone-800 text-stone-300 font-medium text-xs font-mono hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105 ${reveal('delay-[580ms]')}`}
                        >
                            <Phone className="w-4 h-4 text-red-400" />
                            <span>{profile.phone}</span>
                        </a>
                    )}
                </div>

                {/* Primary Action Button */}
                <div className={`pt-8 ${reveal('delay-[600ms]')}`}>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-xl shadow-red-950/60 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] group"
                    >
                        <span>Reach Out Directly</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ContactCTA;
