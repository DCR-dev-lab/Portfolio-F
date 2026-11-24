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

const CATEGORY_LUCIDE_RULES = [
    { match: (c, norm) => c === "Frontend" || norm.includes("front"), icon: LucideIcons.Code2 },
    { match: (c, norm) => c === "Backend" || norm.includes("back"), icon: LucideIcons.Server },
    { match: (c, norm) => c === "Database" || norm.includes("data"), icon: LucideIcons.Database },
    { match: (c, norm) => c === "DevOps" || norm.includes("cloud") || norm.includes("devops"), icon: LucideIcons.Layers },
    { match: (c) => c === "Language", icon: LucideIcons.Code },
    { match: (c) => c === "Testing", icon: LucideIcons.Bug },
    { match: (c, norm) => c === "UI/UX" || norm.includes("design") || norm.includes("ui"), icon: LucideIcons.Palette },
    { match: (c) => c === "Performance", icon: LucideIcons.Gauge },
    { match: (c, norm) => c === "Deployment" || norm.includes("saas"), icon: LucideIcons.Rocket },
    { match: (c) => c === "Authentication", icon: LucideIcons.Key },
    { match: (c) => c === "Cookie", icon: LucideIcons.Cookie },
    { match: (_, norm) => norm.includes("ai") || norm.includes("ml"), icon: LucideIcons.Cpu },
    { match: (_, norm) => norm.includes("mobile") || norm.includes("app"), icon: LucideIcons.Smartphone },
    { match: (_, norm) => norm.includes("productivity"), icon: LucideIcons.Zap },
];

export const CategoryIcon = ({ category, className, iconKeyword, skillName }) => {
    const customIcon = getIcon(iconKeyword || skillName);
    if (customIcon?.type === "fontawesome") {
        return <FontAwesomeIcon icon={customIcon.icon} className={className} aria-hidden="true" />;
    }

    const normCat = category?.toLowerCase() || "";
    const matchedRule = CATEGORY_LUCIDE_RULES.find((r) => r.match(category, normCat));
    const IconComponent = matchedRule?.icon || LucideIcons.Award;

    return <IconComponent className={className} aria-hidden="true" />;
};
