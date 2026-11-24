import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { CategoryIcon } from "../cards/skill/CategoryIcon";
import { getDomainMeta, groupSkillsByCategory } from "../../utils/skillHelpers";

/**
 * FolderDeckCard: A single card in the interactive accordion deck.
 * When active, its body (description + chips) smoothly expands via layout animation.
 * When collapsed, it presents a tactile tab header ready to be opened.
 */
const FolderDeckCard = ({
  group,
  index,
  total,
  isActive,
  onSelect,
  perCategory,
}) => {
  const meta = getDomainMeta(group.name);
  const shown = group.items.slice(0, perCategory);
  const more = group.items.length - shown.length;
  const indexStr = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <motion.article
      layout
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-stone-700/80 bg-[#12100e] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.9),0_0_28px_-6px_rgba(239,68,68,0.18)]"
          : "border-stone-800/80 bg-[#100e0c]/90 hover:border-stone-700 hover:bg-[#141210] shadow-[0_6px_20px_-4px_rgba(0,0,0,0.6)]"
      }`}
    >
      {/* Top ambient highlight line (stronger when active) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        }`}
      />

      {/* Radial crimson aura on active card */}
      {isActive && (
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-25 blur-3xl transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Card Tab Header */}
      <div className="relative flex items-center justify-between gap-3 p-4 sm:p-6 select-none">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Index Pill */}
          <span
            className={`shrink-0 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all duration-200 ${
              isActive
                ? "bg-red-950/60 border-red-500/40 text-red-400"
                : "bg-stone-900/80 border-stone-800 text-stone-400 group-hover:text-stone-300"
            }`}
          >
            {indexStr}
          </span>

          {/* Domain Title */}
          <h3
            className={`truncate text-base sm:text-xl font-bold tracking-tight transition-colors duration-200 ${
              isActive
                ? "text-white"
                : "text-stone-300 group-hover:text-[#faf8f5]"
            }`}
          >
            {group.name}
          </h3>

          {/* Monospace Tag Badge */}
          <span className="hidden md:inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-stone-400 border border-stone-800/80 rounded-md px-2 py-0.5 bg-stone-900/40">
            {meta.tag}
          </span>
        </div>

        {/* Right Controls: Category Icon + Expand/Collapse Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border transition-all duration-300 ${
              isActive
                ? "border-red-500/50 bg-red-500/10 text-red-400 scale-105"
                : "border-stone-800 bg-stone-900/80 text-stone-400 group-hover:border-stone-700 group-hover:text-stone-300"
            }`}
          >
            <CategoryIcon category={group.name} className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>

          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 transition-transform duration-300 ${
              isActive ? "rotate-180 text-red-400" : "rotate-0 group-hover:text-stone-200"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Expandable Body: Description and Skill Chips */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
              {/* Divider */}
              <div className="h-px w-full bg-stone-800/70 mb-4" />

              {/* Domain Scope Narrative */}
              <p className="text-xs sm:text-sm leading-relaxed text-stone-300 max-w-2xl">
                {meta.description}
              </p>

              {/* Skills Chips Grid */}
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-2.5">
                {shown.map((s) => (
                  <span
                    key={s._id ?? s.name}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-950/70 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-stone-200 transition-all duration-200 hover:border-red-500/40 hover:bg-stone-900 hover:text-white"
                  >
                    <CategoryIcon
                      category={group.name}
                      iconKeyword={s.iconKeyword}
                      skillName={s.name}
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400"
                    />
                    <span>{s.name}</span>
                  </span>
                ))}

                {more > 0 && (
                  <Link
                    to="/skills"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-medium text-red-300 transition-all duration-200 hover:border-red-500/60 hover:bg-red-900/30 hover:text-red-100"
                  >
                    <span>+{more} more</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

/**
 * SkillCategoryCards
 * Interactive Folder / Accordion Deck:
 * Displays all domain cards in a unified stack where the active card
 * expands with fluid Framer Motion animations.
 */
const SkillCategoryCards = ({
  skills = [],
  perCategory = 8,
  maxCategories = 4,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const groups = useMemo(
    () => groupSkillsByCategory(skills, maxCategories),
    [skills, maxCategories]
  );

  const total = groups.length;
  if (!total) return null;

  return (
    <div className="relative w-full max-w-3xl mx-auto space-y-3 sm:space-y-3.5">
      {groups.map((group, index) => (
        <FolderDeckCard
          key={group.name}
          group={group}
          index={index}
          total={total}
          isActive={activeIndex === index}
          onSelect={() => setActiveIndex(index)}
          perCategory={perCategory}
        />
      ))}
    </div>
  );
};

export default SkillCategoryCards;
