import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

import PageLoader from "../../components/common/PageLoader";
import PageError from "../../components/common/PageError";
import ParticleHeading from "../../components/particles/ParticleHeading";
import SocialLinks from "../../components/common/SocialLinks";
import StarfieldButton from "../../components/common/StarfieldButton";
import WhisperFooter from "../../components/common/WhisperFooter";
import { getProfile } from "../../services/profile.service";
import usePageSEO from "../../hooks/usePageSEO";
import "../../styles/contact.css";

const Contact = () => {
  usePageSEO({
    title: "Contact & Inquiries",
    description:
      "Connect directly with Denny Charles Raj for full-stack software development projects, technical consulting, or architectural discussions.",
  });

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const copyTimerRef = useRef(null);

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
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const email = profile?.email || "hello@example.com";
  const phone = profile?.phone || "";
  const location = profile?.location || "";
  const socialLinks = profile?.socialLinks || {};

  const copyValue = async (label, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedField(""), 2000);
    } catch {
      // Clipboard API unavailable in restricted contexts; fall back silently
    }
  };

  if (loading) return <PageLoader />;

  if (error) return <PageError error={error} onRetry={fetchProfile} />;

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      actionLabel: "Send email",
      actionIcon: Mail,
      href: `mailto:${email}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: phone,
      actionLabel: "Call now",
      actionIcon: Phone,
      href: phone ? `tel:${phone}` : undefined,
    },
    {
      icon: MapPin,
      label: "Location",
      value: location,
      actionLabel: "View map",
      actionIcon: ExternalLink,
      href: location
        ? `https://maps.google.com?q=${encodeURIComponent(location)}`
        : undefined,
      external: true,
    },
  ].filter((method) => Boolean(method.value));

  return (
    <div className="contact-page">
      {/* 1. Compact Banner Header */}
      <section className="contact-banner">
        <div className="contact-container">
          <div className="contact-banner__grid">
            <div className="contact-banner__main">
              <ParticleHeading
                as="h1"
                id="contact-hero-heading"
                text="Let’s connect."
                align="left"
                cap={2800}
                capMobile={1500}
                className="contact-banner__particle"
                fallbackClassName="contact-banner__title"
              />

              <p className="contact-banner__lead">
                Have a project in mind, an architectural challenge, or a role to
                discuss? Reach out directly below.
              </p>
            </div>

            <dl className="contact-banner__facts">
              <div className="contact-banner__fact">
                <dt>Availability</dt>
                <dd>Full-time &amp; contract inquiries</dd>
              </div>
              <div className="contact-banner__fact">
                <dt>Response time</dt>
                <dd>Replies typically within 24 hours</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* 2. Structured Channels + Compact Socials Rail + Shared Whisper Footer */}
      <section className="contact-section contact-section--closing">
        <div className="contact-container">
          <div className="contact-workspace">
            {/* Primary Left Column: Direct Channels */}
            <div className="contact-workspace__channels">
              <div className="contact-section__head">
                <h2
                  id="contact-channels-heading"
                  className="contact-section__title"
                >
                  Direct channels
                </h2>
                <p className="contact-section__lead">
                  Drop a line with project specs, timelines, or role details.
                </p>
              </div>

              <ul className="contact-rows">
                {contactMethods.map((method) => {
                  const ChannelIcon = method.icon;
                  const ActionIcon = method.actionIcon;
                  const isCopied = copiedField === method.label;
                  return (
                    <li key={method.label} className="contact-row">
                      <div className="contact-row__info">
                        <span className="contact-row__label">
                          <ChannelIcon
                            className="w-4 h-4 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{method.label}</span>
                        </span>

                        <div className="contact-row__value">
                          {method.href ? (
                            <a
                              href={method.href}
                              target={method.external ? "_blank" : undefined}
                              rel={
                                method.external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className="contact-row-link"
                            >
                              {method.value}
                            </a>
                          ) : (
                            <span>{method.value}</span>
                          )}
                        </div>
                      </div>

                      <div className="contact-row__actions">
                        {method.href && (
                          <StarfieldButton
                            label={method.actionLabel}
                            link={method.href}
                            newTab={method.external}
                            icon={
                              ActionIcon ? (
                                <ActionIcon
                                  className="w-3.5 h-3.5 shrink-0 text-stone-300"
                                  aria-hidden="true"
                                />
                              ) : null
                            }
                            padding="9px 16px"
                            rounded={100}
                            ariaLabel={method.actionLabel}
                            style={{ width: "136px" }}
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => copyValue(method.label, method.value)}
                          className="contact-row-action"
                          aria-label={`Copy ${method.label.toLowerCase()}`}
                        >
                          {isCopied ? (
                            <CheckCircle
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy
                              className="w-3.5 h-3.5 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span>{isCopied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="sr-only" role="status" aria-live="polite">
                {copiedField ? `${copiedField} copied to clipboard.` : ""}
              </p>
            </div>

            {/* Compact Right Rail: Connect Elsewhere */}
            <aside
              className="contact-workspace__socials"
              aria-labelledby="contact-socials-heading"
            >
              <div className="contact-section__head">
                <h2
                  id="contact-socials-heading"
                  className="contact-section__title"
                >
                  Connect elsewhere
                </h2>
                <p className="contact-section__lead">
                  Repositories &amp; public profiles.
                </p>
              </div>

              <SocialLinks socialLinks={socialLinks} variant="rows" />
            </aside>
          </div>

          <WhisperFooter className="pt-8" />
        </div>
      </section>
    </div>
  );
};

export default Contact;
