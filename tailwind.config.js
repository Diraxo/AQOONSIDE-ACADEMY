/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AQOONSIDE SCHOOL brand — sampled from the official emblem (src/assets/aqoonside-logo-original.jpeg):
        // royal blue #103E95 (primary), golden yellow #FBC11F (accent), red #D32521 (sparing accent).
        // `brand` is the primary scale; `gold` is the warm detail accent.
        brand: {
          50: "#f0f5fc",
          100: "#dfe8f8",
          200: "#bccdf0",
          300: "#8aaae3",
          400: "#4f7fd0",
          500: "#2459b8",
          600: "#103e95", // primary — the sampled emblem blue
          700: "#0d3278",
          800: "#0b2960",
          900: "#0a224f",
          950: "#06142f",
        },
        gold: {
          50: "#fffaeb",
          100: "#fef0c3",
          200: "#fde28a",
          300: "#fcd155",
          400: "#fbc11f", // accent — the sampled emblem yellow
          500: "#e0a508",
          600: "#a87305",
          700: "#855a05",
          800: "#6b4806",
          900: "#573a07",
        },
        // Supporting accent from the emblem's open book — use sparingly (rules, small highlights).
        emblemred: "#d32521",
      },
    },
  },
  plugins: [],
};
