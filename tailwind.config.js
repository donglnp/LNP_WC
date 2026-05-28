/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#070A0E",
          surface: "#0D1117",
          card: "#11161D",
          border: "#1C242E",
          line: "#222B36",
          green: "#22E27A",
          greenDim: "#0E5E33",
          amber: "#F5C451",
          blue: "#60A5FA",
          blueDim: "#1E40AF",
          red: "#FF5A5A",
          muted: "#6B7787",
          text: "#E6EBF2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px #22E27A, 0 0 24px -8px #22E27A",
      },
    },
  },
  plugins: [],
};
