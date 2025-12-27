import type { Config } from "tailwindcss";

const config: Config = {
  // This ensures Tailwind scans your files for classes
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Allows us to force dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors from your admin design
        primary: "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-dark": "#1c1f27",
        "border-dark": "#282e39",
        "input-bg": "#111318",
        "text-secondary": "#9da6b9",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        shake: "shake 0.5s ease-in-out",
        slowZoom: "slowZoom 20s infinite alternate",
      },
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0", transform: "translateY(10px)" },
        "100%": { opacity: "1", transform: "translateY(0)" },
      },
    },

    // Add this inside theme -> extend -> keyframes
    shake: {
      "0%, 100%": { transform: "translateX(0)" },
      "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
      "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
    },
    slowZoom: {
      "0%": { transform: "scale(1)" },
      "100%": { transform: "scale(1.1)" },
    },
  },
  plugins: [],
};
export default config;
