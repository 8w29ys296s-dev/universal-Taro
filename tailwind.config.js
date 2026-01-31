/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#f4c025",
                "primary-glow": "#f4c02580",
                "background-light": "#f8f8f5",
                "background-dark": "#1a0b2e",
                "mystic-purple": "#581c87",
                "deep-space": "#0f0518",
                "surface-glass": "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                "sans": ["Noto Sans SC", "sans-serif"],
                "display": ["Spline Sans", "Noto Sans SC", "sans-serif"],
                "serif": ["Noto Serif", "serif"],
                "body": ["Noto Sans SC", "sans-serif"]
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'breathing-glow': 'breathing-glow 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { opacity: '0.5' },
                    '50%': { opacity: '1' },
                    '100%': { opacity: '0.5' },
                },
                'breathing-glow': {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)' },
                    '50%': { boxShadow: '0 0 20px rgba(244, 192, 37, 0.3), inset 0 0 20px rgba(244, 192, 37, 0.1)' },
                }
            }
        },
    },
    plugins: [],
}
