/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#f4c025",
                "primary-glow": "#f4c02580",
                "background-dark": "#1a0b2e",
                "mystic-purple": "#581c87",
                "deep-space": "#0f0518",
                "surface-glass": "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                "sans": ["Inter", "Noto Sans SC", "sans-serif"],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                    '100%': { opacity: '0.5' },
                },
            }
        },
    },
    plugins: [],
}
