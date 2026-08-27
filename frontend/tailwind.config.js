/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        bgDeep: '#050510',
        panelBg: 'rgba(20, 20, 35, 0.55)',
        mtn: '#ffbb00',
        telecel: '#ff3366',
        at: '#00e5ff',
        success: '#00ffa3',
      },
      backgroundImage: {
        'gradient-radial-custom': 'radial-gradient(circle at 15% 50%, rgba(0, 229, 255, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(255, 51, 102, 0.08), transparent 25%), radial-gradient(circle at 50% 80%, rgba(255, 187, 0, 0.08), transparent 25%)',
        'metallic-text': 'linear-gradient(135deg, #ffffff 0%, #b4b4cb 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(15, 15, 25, 0.8))',
        'tx-hover': 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'tx-default': 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow-mtn': '0 0 15px var(--tw-colors-mtn)',
        'glow-telecel': '0 0 15px var(--tw-colors-telecel)',
        'glow-at': '0 0 15px var(--tw-colors-at)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'card-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
