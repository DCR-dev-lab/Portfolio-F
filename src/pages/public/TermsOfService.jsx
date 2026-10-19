import { Shield, Code2, AlertCircle, Scale, ExternalLink, Mail } from "lucide-react";
import LegalPageLayout from "../../components/layout/LegalPageLayout";
import usePageSEO from "../../hooks/usePageSEO";

const TERMS_SECTIONS = [
    {
        id: "acceptance",
        index: "01",
        title: "Agreement to Terms",
        icon: Scale,
        summary: "Visiting or interacting with this site constitutes agreement with these terms.",
        details: [
            "Portfolio Scope: By accessing, browsing, or referencing this portfolio website (and associated API routes), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.",
            "Personal Creative Work: This site is maintained by Denny Charles Raj as a professional engineering portfolio showcasing capabilities, technical architecture, and creative digital products.",
            "Updates: These terms may be refined periodically to reflect new features, infrastructure changes, or legal updates. Continued use of the website following changes constitutes acceptance."
        ]
    },
    {
        id: "intellectual-property",
        index: "02",
        title: "Intellectual Property & Code Rights",
        icon: Code2,
        summary: "Clear distinction between proprietary brand assets and open-source code.",
        details: [
            "Proprietary Portfolio Design: The custom visual layouts, design tokens, typography treatments, color schemes, custom loader mechanics, and branding assets ('DCR.') displayed on this website are the intellectual property of Denny Charles Raj.",
            "Open-Source Repositories: Software repositories linked from this portfolio to GitHub are governed by their respective repository licenses (typically MIT, Apache 2.0, or GPL). Those project-specific licenses prevail over these general terms for their respective source code.",
            "Personal Inspection Permitted: Visitors, engineering recruiters, and collaborators are warmly invited to inspect the source code for evaluation and portfolio review purposes."
        ]
    },
    {
        id: "acceptable-use",
        index: "03",
        title: "Acceptable Use & API Integrity",
        icon: AlertCircle,
        summary: "Respectful interaction with our infrastructure and endpoints.",
        details: [
            "No Malicious Probing: You agree not to probe, scan, or test the vulnerability of private endpoints (such as `/api/admin/*`), or attempt to breach token authorization protocols.",
            "No Automated Flooding: You may not use automated bots, scrapers, or scripts to flood API endpoints with requests in a manner that degrades service availability for other visitors.",
            "Accurate Inquiries: When submitting messages through the contact form, you agree not to submit deceptive information, impersonate other individuals, or transmit malicious code/spam."
        ]
    },
    {
        id: "external-links",
        index: "04",
        title: "Live Demos & External Services",
        icon: ExternalLink,
        summary: "Context regarding third-party production sandboxes and live links.",
        details: [
            "Project Demos: Many featured projects include links to external live production sites, staging instances, or third-party cloud hosts (Vercel, Render, AWS, Heroku).",
            "Third-Party Content: Denny Charles Raj is not responsible for the availability, uptime, third-party content, or ongoing maintenance of external demonstration environments once deployed.",
            "Security of External Sites: Visiting third-party websites or external platforms (GitHub, LinkedIn) is subject to the respective terms and privacy policies of those independent domains."
        ]
    },
    {
        id: "disclaimer",
        index: "05",
        title: "Disclaimer of Warranties",
        icon: Shield,
        summary: "Portfolio provided on an 'as is' and 'as available' basis.",
        details: [
            "Informational Purpose: All content, demonstrations, and technical metrics provided on this portfolio are for professional showcase and informational purposes only.",
            "No Warranty: To the maximum extent permitted by applicable law, this portfolio is provided 'as is' without warranties of uninterrupted uptime, zero downtime, or error-free rendering.",
            "Limitation of Liability: In no event shall Denny Charles Raj be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use this portfolio."
        ]
    },
    {
        id: "contact",
        index: "06",
        title: "Governing Context & Inquiries",
        icon: Mail,
        summary: "Direct communication for licensing, inquiries, or collaboration.",
        details: [
            "Licensing Queries: If you wish to license original design elements, collaborate on commercial architecture, or discuss customized solutions, please reach out directly.",
            "Resolving Questions: Any questions or feedback concerning these terms should be directed to Denny Charles Raj via the contact page or email."
        ]
    }
];

const TermsOfService = () => {
    usePageSEO({
        title: "Terms of Service",
        description: "Terms and conditions of use for Denny Charles Raj's developer portfolio, hosted demonstrations, and software architectures.",
    });

    return (
        <LegalPageLayout
            currentTab="terms"
            badge="Legal & Guidelines"
            title="Terms of Service"
            description="Guidelines, rights, and acceptable use terms governing interactions with this portfolio platform, deployed projects, and associated software architectures."
            lastUpdated="October 2026"
            effective="Immediate"
            version="Version 1.2"
            sections={TERMS_SECTIONS}
            contactTitle="Questions or Collaboration Requests?"
            contactDescription="If you have questions regarding these terms, commercial licensing, or architecture inquiries, please feel free to reach out directly."
            contactEmail="dennycharls77@gmail.com"
        />
    );
};

export default TermsOfService;
