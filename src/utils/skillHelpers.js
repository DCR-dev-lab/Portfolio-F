const DOMAIN_META_RULES = [
  {
    keywords: ["front", "ui", "client"],
    tag: "UI & CLIENT ARCHITECTURE",
    description:
      "Crafting fluid, high-performance interfaces with reactive state, accessible design, and modular component hierarchies.",
  },
  {
    keywords: ["back", "api", "server"],
    tag: "APIS & DISTRIBUTED SERVICES",
    description:
      "Engineering secure, scalable backend architectures, RESTful & WebSocket endpoints, and resilient business logic pipelines.",
  },
  {
    keywords: ["data", "db", "sql"],
    tag: "DATA MODELING & PERSISTENCE",
    description:
      "Designing structured data stores, performant indexing strategies, caching mechanisms, and robust transactional schemas.",
  },
  {
    keywords: ["devops", "cloud", "tool", "infra"],
    tag: "INFRASTRUCTURE & DEPLOYMENT",
    description:
      "Automated CI/CD workflows, containerization, cloud infrastructure management, and modern developer tooling ecosystems.",
  },
];

const DEFAULT_DOMAIN_META = {
  tag: "TECHNICAL CAPABILITY",
  description:
    "Specialized frameworks, utilities, and engineering workflows built for production-grade reliability.",
};

/**
 * Resolves display metadata (tag + description) for a skill domain category.
 */
export const getDomainMeta = (name = "") => {
  const lower = name.toLowerCase();
  const match = DOMAIN_META_RULES.find((rule) =>
    rule.keywords.some((kw) => lower.includes(kw))
  );
  return match
    ? { tag: match.tag, description: match.description }
    : DEFAULT_DOMAIN_META;
};

/**
 * Groups skills by category, sorts items by descending proficiency,
 * orders categories by count then name, and limits to maxCategories.
 */
export const groupSkillsByCategory = (skills = [], maxCategories = 4) => {
  const map = new Map();
  skills.forEach((s) => {
    const name = (s.category || "").trim() || "Other";
    if (!map.has(name)) map.set(name, []);
    map.get(name).push(s);
  });

  return [...map.entries()]
    .map(([name, items]) => ({
      name,
      items: [...items].sort(
        (a, b) => (Number(b.proficiency) || 0) - (Number(a.proficiency) || 0)
      ),
    }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
    .slice(0, maxCategories);
};
