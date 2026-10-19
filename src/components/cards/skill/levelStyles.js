export const levelStyles = [
    { min: 90, label: "Master", bar: "from-red-600 to-rose-400", text: "text-red-400" },
    { min: 80, label: "Expert", bar: "from-red-700 to-red-500", text: "text-rose-400" },
    { min: 70, label: "Advanced", bar: "from-stone-700 to-red-600", text: "text-stone-300" },
    { min: 0, label: "Growing", bar: "from-stone-800 to-stone-600", text: "text-stone-400" },
];

export const getLevelStyle = (proficiency) => (
    levelStyles.find((item) => proficiency >= item.min) ?? levelStyles[levelStyles.length - 1]
);

export const normalizeProficiency = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(100, Math.max(0, parsed));
};
