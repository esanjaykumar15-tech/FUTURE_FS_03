/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EBDD',
        espresso: '#35251D',
        caramel: '#B8784A',
        // Darker caramel for TEXT: ~5:1 on cream, ~6:1 on white (caramel itself is ~3:1).
        'caramel-dark': '#8A5530',
        'cream-deep': '#EBDCC6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: { card: '0 1px 2px rgba(53,37,29,.06), 0 6px 18px rgba(53,37,29,.07)' },
    },
  },
  plugins: [],
};
