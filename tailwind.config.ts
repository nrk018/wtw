import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#158fd4",
        white: "#ffffff",
        dark: "#01050b",
        accent: "#0e4a80",
        muted: "#9daecc",
      },
      fontFamily: {
        mario: ["var(--font-fredoka)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        mario: "0 6px 0 0 #0e4a80, 0 8px 0 0 rgba(0,0,0,0.2)",
        "mario-hover": "0 4px 0 0 #0e4a80, 0 6px 0 0 rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
