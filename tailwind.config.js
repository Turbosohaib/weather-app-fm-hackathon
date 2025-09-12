// eslint-disable-next-line import/no-anonymous-default-export
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neutral: {
          0: '#FFFFFF',
          200: 'hsl(250 6% 84%)',
          300: 'hsl(240 6% 70%)',
          600: 'hsl(243 23% 30%)',
          700: 'hsl(243 23% 24%)',
          800: 'hsl(243 27% 20%)',
          900: 'hsl(243 96% 9%)',
        },
        orange: { 500: 'hsl(28 100% 52%)' },
        blue: { 500: 'hsl(233 67% 56%)', 700: 'hsl(248 70% 36%)' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'ui-sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)'],
      },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
};
