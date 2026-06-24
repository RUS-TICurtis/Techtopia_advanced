/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
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
        border: "var(--border-light)",
        input: "var(--border-light)",
        ring: "var(--border-focus)",
        background: "var(--bg-app)",
        foreground: "var(--text-main)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-main)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--bg-app)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--primary-bg)",
          foreground: "var(--primary)",
        },
        popover: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-main)",
        },
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-main)",
        },
        sidebar: {
          DEFAULT: 'var(--bg-sidebar)',
          foreground: 'var(--text-main)',
          primary: 'var(--primary)',
          'primary-foreground': '#ffffff',
          accent: 'var(--primary-bg)',
          'accent-foreground': 'var(--primary)',
          border: 'var(--border-light)',
          ring: 'var(--border-focus)',
        },
        /* Legacy colors */
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
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
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
  plugins: [require("tailwindcss-animate")],
}
