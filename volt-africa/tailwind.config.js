/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#f59e0b",
        background: "#09090b",
        foreground: "#fafafa",
        muted: "#27272a",
        "muted-foreground": "#a1a1aa",
        border: "#27272a",
        card: "#18181b",
        destructive: "#ef4444",
      },
    },
  },
  plugins: [],
};
