import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Pro Carrier brand palette
        midnight: {
          DEFAULT: "#322a6d",
          75: "#584e8a",
          50: "#9894b6",
          25: "#cbc9da",
          10: "#eae9f0",
          shade: "#261f52",
        },
        teal: {
          DEFAULT: "#4bbbba",
          75: "#78cccc",
          50: "#a5dddc",
          25: "#d2eeee",
          10: "#edf8f8",
          shade: "#235e5e",
        },
        fuchsia: {
          DEFAULT: "#e83271",
          75: "#ee5f94",
          50: "#f498b8",
          25: "#f9cbdb",
          10: "#fce9f0",
          shade: "#7e133a",
        },
        lemon: "#efd600",
        orange: "#f4990b",
        plum: { DEFAULT: "#723a62", 50: "#b99db0", 10: "#f0eaee" },
        lilac: { DEFAULT: "#9681ba", 50: "#cbc0dd", 10: "#f4f2f8" },
        green: { DEFAULT: "#66b556" },
        ink: { DEFAULT: "#404040", muted: "#767676", subtle: "#a0a0a0" },
        pallet: "#F4F4F8",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(50, 42, 109, 0.08), 0 4px 16px rgba(50, 42, 109, 0.04)",
        strong:
          "0 24px 80px rgba(50, 42, 109, 0.14), 0 10px 30px rgba(50, 42, 109, 0.08)",
        elevated:
          "0 24px 72px rgba(50, 42, 109, 0.12), 0 10px 28px rgba(50, 42, 109, 0.06)",
      },
      borderRadius: {
        "4xl": "1.75rem",
        "5xl": "2.25rem",
      },
      animation: {
        "fade-up": "fadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.4s ease both",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.93)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
