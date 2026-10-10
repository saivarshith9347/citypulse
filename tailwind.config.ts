import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Command center theme colors
        slate: {
          850: '#1a202e',
          900: '#0f1419',
          950: '#0a0e14',
        },
        cyan: {
          450: '#22d3ee',
          550: '#06b6d4',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
