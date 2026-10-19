import * as LucideIcons from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode,
    faDatabase,
    faServer,
    faPalette,
    faCloud,
    faTerminal,
    faRocket,
    faGaugeHigh,
    faToolbox,
    faCookie,
    faKey,
} from "@fortawesome/free-solid-svg-icons";
import {
    faGithub,
    faReact,
    faNodeJs,
    faJs,
    faHtml5,
    faGitAlt,
    faDocker,
    faPython,
    faBootstrap,
    faChrome,
} from "@fortawesome/free-brands-svg-icons";

const fontAwesomeMap = {
    python: faPython,
    react: faReact,
    nextjs: faReact,
    next: faReact,
    javascript: faJs,
    js: faJs,
    typescript: faCode,
    ts: faCode,
    html: faHtml5,
    css: faPalette,
    tailwind: faPalette,
    node: faNodeJs,
    express: faServer,
    api: faServer,
    mongo: faDatabase,
    mongodb: faDatabase,
    sqlite: faDatabase,
    sql: faDatabase,
    postgres: faDatabase,
    mysql: faDatabase,
    docker: faDocker,
    aws: faCloud,
    linux: faTerminal,
    testing: faToolbox,
    ui: faPalette,
    ux: faPalette,
    design: faPalette,
    figma: faPalette,
    performance: faGaugeHigh,
    deployment: faRocket,
    frontend: faCode,
    backend: faServer,
    devops: faCloud,
    database: faDatabase,
    git: faGitAlt,
    github: faGithub,
    vite: faRocket,
    cookie: faCookie,
    bootstrap: faBootstrap,
    chrome: faChrome,
    authentication: faKey,
};

const getIcon = (iconKeyword) => {
    // console.log("getIcon called with iconKeyword:", iconKeyword);
    if (!iconKeyword) return null;

    const trimmed = iconKeyword.trim();
    if (!trimmed) return null;
    // console.log("trimmed iconKeyword:", trimmed);
    const normalized = trimmed.toLowerCase();
    const candidates = [
        normalized,
        trimmed.replace(/\s+/g, ""),
        trimmed.replace(/[^a-z0-9]/g, ""),
    ];
    // console.log("candidates for icon lookup:", candidates);
    for (const candidate of candidates) {
        // console.log("checking candidate:", candidate);
        if (fontAwesomeMap[candidate]) {
            // console.log("found icon for candidate:", candidate, "icon:", fontAwesomeMap[candidate]);
            return { type: "fontawesome", icon: fontAwesomeMap[candidate] };
        }
    }

    return null;
};

export const CategoryIcon = ({ category, className, iconKeyword, skillName }) => {
    const customIcon = getIcon(iconKeyword || skillName);
    // console.log("customIcon", customIcon, "iconKeyword", iconKeyword, "skillName", skillName);
    if (customIcon?.type === "fontawesome") {
        return <FontAwesomeIcon icon={customIcon.icon} className={className} aria-hidden="true" />;
    }

    // const fallbackInitial = skillName?.trim()?.charAt(0)?.toUpperCase();
    // if (fallbackInitial) {
    //     return <span className={`flex items-center justify-center font-semibold ${className}`}>{fallbackInitial}</span>;
    // }

    const normCat = category?.toLowerCase() || "";

    if (category === "Frontend" || normCat.includes("front")) return <LucideIcons.Code2 className={className} aria-hidden="true" />;
    if (category === "Backend" || normCat.includes("back")) return <LucideIcons.Server className={className} aria-hidden="true" />;
    if (category === "Database" || normCat.includes("data")) return <LucideIcons.Database className={className} aria-hidden="true" />;
    if (category === "DevOps" || normCat.includes("cloud") || normCat.includes("devops")) return <LucideIcons.Layers className={className} aria-hidden="true" />;
    if (category === "Language") return <LucideIcons.Code className={className} aria-hidden="true" />;
    if (category === "Testing") return <LucideIcons.Bug className={className} aria-hidden="true" />;
    if (category === "UI/UX" || normCat.includes("design") || normCat.includes("ui")) return <LucideIcons.Palette className={className} aria-hidden="true" />;
    if (category === "Performance") return <LucideIcons.Gauge className={className} aria-hidden="true" />;
    if (category === "Deployment" || normCat.includes("saas")) return <LucideIcons.Rocket className={className} aria-hidden="true" />;
    if (category === "Authentication") return <LucideIcons.Key className={className} aria-hidden="true" />;
    if (category === "Cookie") return <LucideIcons.Cookie className={className} aria-hidden="true" />;
    if (normCat.includes("ai") || normCat.includes("ml")) return <LucideIcons.Cpu className={className} aria-hidden="true" />;
    if (normCat.includes("mobile") || normCat.includes("app")) return <LucideIcons.Smartphone className={className} aria-hidden="true" />;
    if (normCat.includes("productivity")) return <LucideIcons.Zap className={className} aria-hidden="true" />;

    return <LucideIcons.Award className={className} aria-hidden="true" />;
};
