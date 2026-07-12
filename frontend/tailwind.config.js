/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Formal ERP accent - deep, muted navy/blue. Kept as a single
                // named scale so pages reference `brand-*` instead of ad hoc
                // indigo/blue/violet shades scattered across the codebase.
                brand: {
                    50: '#eff4fb',
                    100: '#dce7f5',
                    200: '#b9cfeb',
                    300: '#8fb0dc',
                    400: '#5f8cc7',
                    500: '#3d6bab',
                    600: '#2c5490',
                    700: '#254674',
                    800: '#213c60',
                    900: '#1c3150',
                },
            },
            boxShadow: {
                // A single restrained elevation - no glossy/soft "floating card" shadows.
                card: '0 1px 2px 0 rgb(15 23 42 / 0.04)',
            },
        },
    },
    plugins: [],
}
