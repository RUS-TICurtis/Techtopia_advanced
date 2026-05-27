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
          chartreuse: "#E4FF1A",
          cyan: "#01FDF6",
          green: "#21FA90",
          magenta: "#FF47DA",
          purple: "#8A4FFF",
          blue: "#3772FF",
        },
        bg: {
          app: {
            light: "#F5F7FA",
            dark: "#080D1A",
          },
          sidebar: {
            light: "#FFFFFF",
            dark: "#0A0F1E",
          },
          card: {
            light: "#FFFFFF",
            dark: "#0F1629",
          }
        }
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "-apple-system", "sans-serif"],
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
