import { useState, useEffect } from "react";
import {
  Mail, Phone, MapPin, Send, Copy, CheckCircle, ExternalLink,
  MessageSquare, Palette, Code2, Layers, Lightbulb, Zap
} from "lucide-react";

import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";
import SectionHeader from "../../components/common/SectionHeader";
import PulseDot from "../../components/ui/PulseDot";
import SocialLinks from "../../components/common/SocialLinks";
import { getProfile } from "../../services/profile.service";
import usePageSEO from "../../hooks/usePageSEO";

const CAPABILITIES = [
  { icon: Code2,     label: "Frontend Engineering", sub: "React 19, Vite, responsive UI" },
  { icon: Layers,    label: "Full Stack Architecture", sub: "Node.js, Express, MongoDB" },
  { icon: Palette,   label: "UI / UX Systems",      sub: "Design tokens, Tailwind CSS" },
  { icon: Lightbulb, label: "Technical Consulting", sub: "Code audits & performance" },
];

const Contact = () => {
  usePageSEO({
    title: "Contact & Inquiries",
    description: "Connect directly with Denny Charles Raj for full-stack software development projects, technical consulting, or architectural discussions.",
  });

  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setProfile(res.data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const copyEmail = () => {
    if (!profile?.email) return;
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  if (loading) return <PageLoader />;

  if (error) return <PageError error={error} onRetry={fetchProfile} />;

  const email = profile?.email || "hello@example.com";
  const phone = profile?.phone || "";
  const location = profile?.location || "";
  const socialLinks = profile?.socialLinks || {};

  const contactMethods = [
    {
      icon:   Mail,
      label:  "Email",
      value:  email,
      action: copyEmail,
      actionLabel: copiedEmail ? "Copied" : "Copy email",
      actionIcon:  copiedEmail ? CheckCircle : Copy,
      href:   `mailto:${email}`,
    },
    {
      icon:        Phone,
      label:       "Phone",
      value:       phone,
      actionLabel: "Call now",
      actionIcon:  Send,
      href:        phone ? `tel:${phone}` : undefined,
    },
    {
      icon:        MapPin,
      label:       "Location",
      value:       location,
      actionLabel: "View map",
      actionIcon:  ExternalLink,
      href:        location
        ? `https://maps.google.com?q=${encodeURIComponent(location)}`
        : undefined,
    },
  ];

  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <SectionHeader
          as="h1"
          align="center"
          badge="Initiate Contact"
          icon={MessageSquare}
          title="Let's Connect"
          subtitle="Have a project in mind, an architectural challenge, or just want to chat tech? Reach out through any channel below."
          className="mb-14 max-w-2xl"
        />

          {/* Contact Method Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {contactMethods.map((method, i) =>
              method.value ? (
                <div
                  key={i}
                  className="group relative bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 hover:border-red-500/40 hover:bg-stone-900/70 transition-all duration-300 backdrop-blur-md shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700/60 flex items-center justify-center mb-4 text-red-400 group-hover:border-red-500/40 group-hover:bg-red-500/10 transition-colors">
                      <method.icon className="w-5 h-5 text-red-400" />
                    </div>

                    <p className="text-[11px] font-mono text-stone-500 uppercase tracking-wider mb-1">
                      {method.label}
                    </p>

                    <p className="text-[#faf8f5] font-medium text-sm md:text-base break-all mb-4">
                      {method.value}
                    </p>
                  </div>

                  {method.href && (
                    <div className="pt-3 border-t border-stone-800/80">
                      <a
                        href={method.href}
                        target={method.label === "Location" ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-mono font-medium transition-colors"
                        onClick={
                          method.label === "Email"
                            ? (e) => { e.preventDefault(); copyEmail(); }
                            : undefined
                        }
                      >
                        <method.actionIcon className="w-3.5 h-3.5" />
                        <span>{method.actionLabel}</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : null
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Ready to send CTA with Red Button */}
              <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-lg font-bold text-[#faf8f5] mb-1 flex items-center gap-2">
                    <Send className="w-4 h-4 text-red-400" />
                    Ready to start a conversation?
                  </h2>
                  <p className="text-stone-400 text-sm leading-relaxed max-w-md">
                    Drop a line directly via email to share project specs, timelines, or role details.
                  </p>
                </div>

                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-900/40 transition-all hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>

              {/* Core Engagement Areas */}
              <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-mono uppercase tracking-wider text-red-400 mb-5">
                  Core Engagement Areas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CAPABILITIES.map(({ icon: Icon, label, sub }) => (
                    <div
                      key={label}
                      className="bg-stone-900/60 border border-stone-800/80 rounded-xl p-4 hover:border-red-500/30 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-3 text-red-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-[#faf8f5] text-sm font-semibold mb-0.5">{label}</p>
                      <p className="text-stone-400 text-xs">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">

              {/* Connect card */}
              <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-sm font-mono uppercase tracking-wider text-red-400 mb-4">
                  Connect & Socials
                </h2>

                <SocialLinks socialLinks={socialLinks} variant="list" />
              </div>

              {/* Live availability indicator */}
              <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0">
                  <PulseDot size="md" />
                </div>
                <div>
                  <p className="text-[#faf8f5] font-medium text-xs font-mono">Available for Work</p>
                  <p className="text-stone-500 text-[11px] font-mono">Full-time & contract inquiries</p>
                </div>
                <Zap className="w-4 h-4 text-red-400 ml-auto flex-shrink-0" />
              </div>

              {/* Response turnaround */}
              <div className="bg-stone-900/40 border border-stone-800/80 rounded-2xl p-5 backdrop-blur-md flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center flex-shrink-0 text-red-400 text-xs font-mono">
                  24h
                </div>
                <div>
                  <p className="text-[#faf8f5] font-medium text-xs font-mono">Fast Response</p>
                  <p className="text-stone-500 text-[11px] font-mono">Replies typically within 24 hours</p>
                </div>
              </div>

            </div>
          </div>
      </div>
    </div>
  );
};

export default Contact;