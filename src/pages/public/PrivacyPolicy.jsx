import { Shield, Lock, Eye, Database, Cookie, ExternalLink } from "lucide-react";
import LegalPageLayout from "../../components/layout/LegalPageLayout";
import usePageSEO from "../../hooks/usePageSEO";

const SECTIONS = [
    {
        id: "collection",
        index: "01",
        title: "Information Collected",
        icon: Eye,
        summary: "We only collect data you explicitly choose to share with us.",
        details: [
            "Contact Form & Inquiries: When you send a message through the contact form or direct email, we collect your name, email address, subject, and message content solely to communicate with you.",
            "Technical Log Data: Standard, non-personally identifiable server logs (such as request timestamps, IP address, and browser user-agent) are processed automatically to maintain server health, diagnose runtime issues, and prevent spam/DDoS.",
            "No Sensitive Personal Data: This portfolio does not collect, store, or process financial details, payment cards, or government identification numbers."
        ]
    },
    {
        id: "usage",
        index: "02",
        title: "How Information Is Used",
        icon: Database,
        summary: "Your information is used strictly to communicate and deliver portfolio content.",
        details: [
            "Responding to Inquiries: To respond to technical inquiries, project consulting requests, or job opportunities you initiate.",
            "Service Delivery: To display dynamic portfolio projects, skill proficiencies, and resume downloads backed by our MongoDB API.",
            "Zero Monetization: We never sell, rent, monetize, or trade your personal information to third parties, advertising brokers, or data syndicates."
        ]
    },
    {
        id: "cookies",
        index: "03",
        title: "Cookies & Local Storage",
        icon: Cookie,
        summary: "Minimal browser storage used exclusively for site functionality.",
        details: [
            "Zero Ad Tracking Cookies: This website does not use tracking cookies, tracking pixels, or cross-site behavioral marketing scripts.",
            "Admin Authentication Cookie: A secure, encrypted session cookie (`adminToken`) is used solely to authenticate authorized admin sessions for portfolio content management.",
            "Client Preferences: Non-sensitive preferences (such as reduced motion settings or theme states) may be stored in browser storage for optimal rendering."
        ]
    },
    {
        id: "third-parties",
        index: "04",
        title: "Third-Party Services",
        icon: ExternalLink,
        summary: "Reputable, industry-standard infrastructure services.",
        details: [
            "Google Fonts: Typography styles (Plus Jakarta Sans & JetBrains Mono) are loaded via Google Fonts CDN without user tracking.",
            "External Profiles & Repositories: Outbound links to external platforms (GitHub, LinkedIn, Twitter/X, live demo hosts) are governed by the privacy policies of those respective external providers.",
            "Hosting & Database Infrastructure: Portfolio data is hosted on secure cloud infrastructure utilizing industry-standard database safeguards."
        ]
    },
    {
        id: "security",
        index: "05",
        title: "Security & Retention",
        icon: Lock,
        summary: "Modern cryptographic encryption and security hygiene.",
        details: [
            "Encryption in Transit: All data transferred between your browser and our servers is secured using modern Transport Layer Security (TLS/HTTPS).",
            "API Endpoint Hardening: Protected routes are fortified with JSON Web Token (JWT) authentication, rate limiting, and sanitized inputs.",
            "Data Retention: Contact messages are retained only as long as necessary to conduct ongoing professional communication, after which they can be permanently deleted upon request."
        ]
    },
    {
        id: "rights",
        index: "06",
        title: "Your Rights & Inquiries",
        icon: Shield,
        summary: "Full transparency and control over any data you provide.",
        details: [
            "Right of Access: You may request a copy of any personal information or messages submitted through this website.",
            "Right of Erasure: You may request the immediate deletion of any message history or contact records at any time.",
            "Direct Point of Contact: To exercise these rights or ask questions, email Denny Charles Raj directly at dennycharls77@gmail.com."
        ]
    }
];

const PrivacyPolicy = () => {
    usePageSEO({
        title: "Privacy Policy",
        description: "Privacy policy and data transparency statement for Denny Charles Raj's developer portfolio.",
    });

    return (
        <LegalPageLayout
            currentTab="privacy"
            badge="Legal & Transparency"
            title="Privacy Policy"
            description="This portfolio operates with strict respect for visitor privacy. This document outlines the minimal data handled when you visit this website or communicate with Denny Charles Raj."
            lastUpdated="October 2026"
            effective="Immediate"
            version="Version 1.2"
            sections={SECTIONS}
            contactTitle="Questions or Data Requests?"
            contactDescription="If you have questions about how your message data is handled or would like any past communications removed, feel free to reach out directly."
            contactEmail="dennycharls77@gmail.com"
        />
    );
};

export default PrivacyPolicy;
