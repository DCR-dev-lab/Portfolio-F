/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      keyframes: {
        // For the Liquid Wave Skill Card
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // For the Cyberpunk Neon Skill Card
        pulseGlow: {
          "0%, 100%": { opacity: "0.8", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.5)" },
        },
        // For the Morphing Blob Project/Skill Card
        morph: {
          "0%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
        },
        // For the Skill Tree Node pulse
        innerSurge: {
          "0%": { transform: "scale(0.95)", opacity: "0.5" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
          "100%": { transform: "scale(0.95)", opacity: "0.5" },
        },
        // For the Animated Shimmer in your original bar
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        wave: "wave 3s linear infinite",
        "neon-pulse": "pulseGlow 2s ease-in-out infinite",
        "morph-blob": "morph 8s ease-in-out infinite",
        surge: "innerSurge 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};
