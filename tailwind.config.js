/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gray: {
          850: "#1d263b",
        },
        brand: {
          chartreuse: "#F97316", // CTA Orange
          cyan: "#3B82F6",       // Secondary Blue
          green: "#10B981",
          magenta: "#EF4444",
          purple: "#6366F1",
          blue: "#2563EB",       // Primary Blue
        },
        bg: {
          app: {
            light: "#F8FAFC",
            dark: "#0F172A",
          },
          sidebar: {
            light: "#FFFFFF",
            dark: "#0F172A",
          },
          card: {
            light: "#FFFFFF",
            dark: "#1E293B",
          }
        }
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        'page-gap': '32px',
        'section-gap': '24px',
        'card-padding': '24px',
        'item-gap': '12px',
        'metadata-gap': '8px',
      },
      borderRadius: {
        'xl': '25px',
        'lg': '15px',
        'md': '10px',
        'sm': '8px',
      }
    },
  },
  plugins: [],
}
