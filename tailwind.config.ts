import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        chrono: {
          "bg-page": "rgb(var(--chrono-bg-page))",
          "bg-card": "rgb(var(--chrono-bg-card))",
          "border-subtle": "rgb(var(--chrono-border-subtle))",
          "fg-primary": "rgb(var(--chrono-fg-primary))",
          "fg-muted": "rgb(var(--chrono-fg-muted))",
          accent: "rgb(var(--chrono-accent))",
          danger: "rgb(var(--chrono-danger))",
          success: "rgb(var(--chrono-success))",
          warning: "rgb(var(--chrono-warning))",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        "chrono-glow": "0 0 50px -12px rgba(129, 140, 248, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
