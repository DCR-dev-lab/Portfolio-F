export const levelStyles = [
    { min: 90, label: "Master", bar: "from-yellow-300 to-amber-500", text: "text-yellow-200" },
    { min: 80, label: "Expert", bar: "from-purple-300 to-pink-400", text: "text-purple-100" },
    { min: 70, label: "Advanced", bar: "from-blue-300 to-cyan-400", text: "text-blue-100" },
    { min: 0, label: "Growing", bar: "from-emerald-300 to-teal-400", text: "text-emerald-100" },
];

export const getLevelStyle = (proficiency) => (
    levelStyles.find((item) => proficiency >= item.min) ?? levelStyles[levelStyles.length - 1]
);

export const normalizeProficiency = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return 0;
    return Math.min(100, Math.max(0, parsed));
};
