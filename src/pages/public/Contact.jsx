import { useState, useEffect } from "react";
import {
  Mail, Phone, MapPin, Send, Github, Linkedin,
  Twitter, Instagram, Copy, CheckCircle, ExternalLink,
  Sparkles, Palette, Code2, Layers, Lightbulb, Zap
} from "lucide-react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import Loader1 from "../../components/common/loader/Loader1";
import { getProfile } from "../../services/profile.service";

const SKILLS = [
  { icon: Palette,   label: "UI / UX Design",  sub: "Interfaces & systems" },
  { icon: Code2,     label: "Frontend Dev",     sub: "React & modern stack" },
  { icon: Layers,    label: "Full Stack",       sub: "End-to-end builds"    },
  { icon: Lightbulb, label: "Consulting",       sub: "Strategy & advice"    },
];

const Contact = () => {
  const [profile,     setProfile]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  /* ── fetch ── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        setProfile(res.data);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── copy email ── */
  const copyEmail = () => {
    if (!profile?.email) return;
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  /* ── guards ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <Loader1 />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="text-center bg-red-500/10 backdrop-blur-sm border border-red-500/50 rounded-2xl p-8">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <p className="text-purple-300 text-lg">No profile data found.</p>
      </div>
    );
  }

  const { email, phone, location, socialLinks = {} } = profile;

  /* ── contact methods ── */
  const contactMethods = [
    {
      icon:   Mail,
      label:  "Email",
      value:  email,
      color:  "from-blue-500 to-cyan-500",
      action: copyEmail,
      actionLabel: copiedEmail ? "Copied!" : "Copy",
      actionIcon:  copiedEmail ? CheckCircle : Copy,
      href:   `mailto:${email}`,
    },
    {
      icon:        Phone,
      label:       "Phone",
      value:       phone,
      color:       "from-green-500 to-emerald-500",
      actionLabel: "Call",
      actionIcon:  Send,
      href:        `tel:${phone}`,
    },
    {
      icon:        MapPin,
      label:       "Location",
      value:       location,
      color:       "from-purple-500 to-pink-500",
      actionLabel: "View map",
      actionIcon:  ExternalLink,
      href:        location
        ? `https://maps.google.com?q=${encodeURIComponent(location)}`
        : undefined,
    },
  ];

  /* ── social platforms ── */
  const socialPlatforms = [
    { icon: Github,    name: "GitHub",    url: socialLinks.github,    bg: "from-gray-600 to-gray-800"   },
    { icon: Linkedin,  name: "LinkedIn",  url: socialLinks.linkedin,  bg: "from-blue-600 to-blue-800"   },
    { icon: Twitter,   name: "Twitter",   url: socialLinks.twitter,   bg: "from-sky-500 to-blue-600"    },
    { icon: Instagram, name: "Instagram", url: socialLinks.instagram, bg: "from-pink-500 to-purple-600" },
  ].filter((p) => p.url);

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden pt-4">

        {/* ── animated background blobs ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto">

            {/* ── hero header ── */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-200 text-sm font-medium">Get In Touch</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                Let's{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connect
                </span>
              </h1>

              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Have a project in mind or just want to chat? I'd love to hear from you.
                Reach out through any of the platforms below!
              </p>
            </div>

            {/* ── contact method cards (always 3 columns on md+) ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {contactMethods.map((method, i) =>
                method.value ? (
                  <div
                    key={i}
                    className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
                    />

                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <method.icon className="w-5 h-5 text-white" />
                      </div>

                      <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest mb-1">
                        {method.label}
                      </p>

                      <p className="text-white font-medium break-all mb-4 text-sm">
                        {method.value}
                      </p>

                      {method.href && (
                        <a
                          href={method.href}
                          target={method.label === "Location" ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 text-xs font-semibold transition-colors"
                          onClick={
                            method.label === "Email"
                              ? (e) => { e.preventDefault(); copyEmail(); }
                              : undefined
                          }
                        >
                          <method.actionIcon className="w-3.5 h-3.5" />
                          {method.actionLabel}
                        </a>
                      )}
                    </div>
                  </div>
                ) : null
              )}
            </div>

            {/* ── mobile social icon strip (hidden on lg) ── */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-8 flex flex-col  lg:hidden">
                  <h2 className="text-white font-bold text-base mb-5">
                    Connect with me
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {socialPlatforms.map((platform, i) => (
                      <a
                        key={i}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${platform.name} profile`}
                        className="flex flex-1 items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          <platform.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold leading-none mb-0.5">
                            {platform.name}
                          </p>
                          <p className="text-gray-400 text-xs">Follow me</p>
                        </div>
                        <Send className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </a>
                    ))}

                    {/* Fallback if no social links */}
                    {socialPlatforms.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">
                        No social links added yet.
                      </p>
                    )}
                  </div>
                </div>

            {/* ── main grid: left (1fr) + right sidebar (fixed 272px) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

              {/* ── LEFT COLUMN ── */}
              <div className="flex flex-col lg:col-span-2 gap-6 ">

                {/* CTA banner */}
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 flex items-center gap-5 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-1">
                      <Send className="w-5 h-5 text-purple-400" />
                      Ready to start a conversation?
                    </h2>
                    <p className="text-purple-200 text-sm">
                      Click the button to send me an email and let's discuss your ideas!
                    </p>
                  </div>
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-7 py-3.5 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/40 transition-all hover:scale-105 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    >
                      <Mail className="w-4 h-4" />
                      Send email
                    </a>
                  )}
                </div>

                {/* Skills / what I can help with */}
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-white font-bold text-base mb-5">
                    What I can help with
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {SKILLS.map(({ icon: Icon, label, sub }) => (
                      <div
                        key={label}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                          <Icon className="w-4 h-4 text-purple-300" />
                        </div>
                        <p className="text-white text-sm font-semibold mb-0.5">{label}</p>
                        <p className="text-gray-400 text-xs">{sub}</p>
                      </div>
                    ))}
                  </div>
                </div>

                
              </div>

              {/* ── RIGHT SIDEBAR (hidden on mobile) ── */}
              <div className="hidden lg:flex flex-col gap-4" >

                {/* Social card — stretches to match left column height */}
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex flex-col">
                  <h2 className="text-white font-bold text-base mb-5">
                    Connect with me
                  </h2>

                  <div className="flex flex-col justify-between flex-1 gap-3">
                    {socialPlatforms.map((platform, i) => (
                      <a
                        key={i}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${platform.name} profile`}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${platform.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                        >
                          <platform.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold leading-none mb-0.5">
                            {platform.name}
                          </p>
                          <p className="text-gray-400 text-xs">Follow me</p>
                        </div>
                        <Send className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </a>
                    ))}

                    {/* Fallback if no social links */}
                    {socialPlatforms.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">
                        No social links added yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick response — compact, fixed at bottom */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Quick response</p>
                    <p className="text-gray-400 text-xs">Replies within 24 hours</p>
                  </div>
                </div>
                

                {/* Availability bar */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Open to work — available now
                    </p>
                    <p className="text-gray-400 text-xs">
                      Freelance & full-time opportunities welcome
                    </p>
                  </div>
                  <Zap className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />
                </div>

              </div>
                
              
              <div className="grid grid-cols-1 gap-4 lg:hidden" >
                                    {/* Quick response — compact, fixed at bottom */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Quick response</p>
                    <p className="text-gray-400 text-xs">Replies within 24 hours</p>
                  </div>
                </div>
                

                {/* Availability bar */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Open to work — available now
                    </p>
                    <p className="text-gray-400 text-xs">
                      Freelance & full-time opportunities welcome
                    </p>
                  </div>
                  <Zap className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />
                </div>

              </div>

            </div>
          </div>
        </div>

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(30px, -50px) scale(1.1); }
            66%       { transform: translate(-20px, 20px) scale(0.9); }
          }
          .animate-blob               { animation: blob 7s infinite; }
          .animation-delay-2000       { animation-delay: 2s; }
          .animation-delay-4000       { animation-delay: 4s; }
        `}</style>
      </section>

      <Footer />
    </>
  );
};

export default Contact;