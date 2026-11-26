/**
 * PulseDot
 * Animated live status pinging dot with crimson accent.
 */
const PulseDot = ({
    size = "sm", // "sm" | "md" | "lg"
    active = true,
    className = "",
}) => {
    const sizeClasses = {
        sm: "h-2 w-2",
        md: "h-2.5 w-2.5",
        lg: "h-3 w-3",
    }[size] || "h-2 w-2";

    return (
        <span className={`relative flex ${sizeClasses} ${className}`} aria-hidden="true">
            {active && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span
                className={`relative inline-flex rounded-full h-full w-full ${
                    active ? "bg-red-500" : "bg-stone-500"
                }`}
            />
        </span>
    );
};

export default PulseDot;
