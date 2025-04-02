import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--b2))",
        input: "hsl(var(--bc))",
        ring: "hsl(var(--bc))",
        background: "hsl(var(--b1))",
        foreground: "hsl(var(--bc))",
        primary: {
          DEFAULT: "hsl(var(--p))",
          foreground: "hsl(var(--pc))",
        },
        secondary: {
          DEFAULT: "hsl(var(--s))",
          foreground: "hsl(var(--sc))",
        },
        destructive: {
          DEFAULT: "hsl(var(--er))",
          foreground: "hsl(var(--erc))",
        },
        muted: {
          DEFAULT: "hsl(var(--b3))",
          foreground: "hsl(var(--bc))",
        },
        accent: {
          DEFAULT: "hsl(var(--a))",
          foreground: "hsl(var(--ac))",
        },
        popover: {
          DEFAULT: "hsl(var(--b1))",
          foreground: "hsl(var(--bc))",
        },
        card: {
          DEFAULT: "hsl(var(--b1))",
          foreground: "hsl(var(--bc))",
        },
      },
      borderRadius: {
        lg: "var(--rounded-btn)",
        md: "calc(var(--rounded-btn) - 2px)",
        sm: "calc(var(--rounded-btn) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "dracula", "emerald", "corporate"],
  },
} satisfies Config

export default config

