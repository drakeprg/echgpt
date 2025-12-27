/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // iOS System Colors
                primary: {
                    DEFAULT: '#007AFF',
                    light: '#3395FF',
                    dark: '#0055CC',
                },
                secondary: {
                    DEFAULT: '#4ECDC4',
                    light: '#7EDED7',
                    dark: '#2EB5AB',
                },
                success: '#34C759',
                warning: '#FF9500',
                error: '#FF3B30',
                // iOS Background Colors
                background: {
                    DEFAULT: '#F2F2F7',
                    secondary: '#FFFFFF',
                    tertiary: '#E5E5EA',
                },
                // iOS Text Colors
                text: {
                    DEFAULT: '#1C1C1E',
                    secondary: '#8E8E93',
                    tertiary: '#AEAEB2',
                },
                // Disease Colors
                disease: {
                    candidiasis: '#FF6B6B',
                    tineaCorporis: '#4ECDC4',
                    tineaPedis: '#45B7D1',
                    tineaVersicolor: '#96CEB4',
                },
            },
            fontFamily: {
                sans: ['System', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            borderRadius: {
                'ios': '12px',
                'ios-lg': '16px',
                'ios-xl': '20px',
            },
            boxShadow: {
                'ios': '0 2px 10px rgba(0, 0, 0, 0.08)',
                'ios-lg': '0 4px 20px rgba(0, 0, 0, 0.12)',
            },
        },
    },
    plugins: [],
};
