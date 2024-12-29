/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
      },
    },
  },
  plugins: [],
};
