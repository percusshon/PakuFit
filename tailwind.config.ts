import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "sans-serif"]
      },
      colors: {
        pakufit: {
          50: "#f0f8ff",
          100: "#d9edf7",
          200: "#bce0ee",
          500: "#2ea0c7",
          600: "#1f8fb4",
          700: "#176d88"
        }
      }
    }
  },
  plugins: []
};

export default config;
