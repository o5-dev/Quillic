/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg0)',
        bg1: 'var(--bg1)',
        bg2: 'var(--bg2)',
        bg3: 'var(--bg3)',
        bg4: 'var(--bg4)',
        bg5: 'var(--bg5)',
        bg6: 'var(--bg6)',
        muted: 'var(--mt)',
        accent: 'var(--ac)',
        accentDim: 'var(--ac-dim)',
        accentBorder: 'var(--ac-border)',
        text: 'var(--tx)',
        text2: 'var(--tx2)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        ui: ['-apple-system', '"Söhne"', '"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};