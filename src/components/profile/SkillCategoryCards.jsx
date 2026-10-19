import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";

/**
 * SkillCategoryCards
 * One card per skill category (no percentage bars): the category's top skills as chips,
 * plus a "+N more" chip that leads to the full Skills page.
 */
const SkillCategoryCards = ({ skills = [], perCategory = 6, maxCategories = 4, revealed = true }) => {
  const groups = useMemo(() => {
    const map = new Map();
    skills.forEach((s) => {
      const name = (s.category || "").trim() || "Other";
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(s);
    });
    return [...map.entries()]
      .map(([name, items]) => ({
        name,
        items: [...items].sort((a, b) => (Number(b.proficiency) || 0) - (Number(a.proficiency) || 0)),
      }))
      .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name))
      .slice(0, maxCategories);
  }, [skills, maxCategories]);

  if (!groups.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {groups.map((g, i) => {
        const shown = g.items.slice(0, perCategory);
        const more = g.items.length - shown.length;
        return (
          <article
            key={g.name}
            style={{ transitionDelay: `${i * 90}ms` }}
            className={`group relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/50 p-6 transition-all duration-700 hover:border-red-500/40 ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(ellipse at 50% -10%, rgba(220,38,38,0.12), transparent 60%)",
              }}
            />

            <div className="relative flex items-start justify-between">
              <span className="font-mono text-xs text-stone-500">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700/60 bg-stone-800/80 text-red-400 transition-colors group-hover:border-red-500/50 group-hover:bg-red-500/10">
                <CategoryIcon category={g.name} className="h-5 w-5" />
              </span>
            </div>

            <h3 className="relative mt-6 text-xl font-bold tracking-tight text-[#faf8f5]">{g.name}</h3>
            <p className="relative mt-1 font-mono text-xs text-stone-500">
              {g.items.length} {g.items.length === 1 ? "skill" : "skills"}
            </p>

            <div className="relative mt-5 flex flex-wrap gap-2">
              {shown.map((s) => (
                <span
                  key={s._id ?? s.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-950/70 px-2.5 py-1.5 text-xs text-stone-300 transition-colors group-hover:border-stone-700"
                >
                  <CategoryIcon
                    category={g.name}
                    iconKeyword={s.iconKeyword}
                    skillName={s.name}
                    className="h-3.5 w-3.5 text-red-400"
                  />
                  {s.name}
                </span>
              ))}
              {more > 0 && (
                <Link
                  to="/skills"
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/30 px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:border-red-500/60 hover:text-red-200"
                >
                  +{more} more
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default SkillCategoryCards;
