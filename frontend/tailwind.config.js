export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 60px rgba(0, 0, 0, 0.22)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(59,130,246,0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(168,85,247,0.18), transparent 20%)',
      },
    },
  },
  plugins: [],
};
