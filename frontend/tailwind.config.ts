import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        border: 'var(--border)',
        green: 'var(--green)',
        red: 'var(--red)',
        amber: 'var(--amber)',
        blue: 'var(--blue)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        orbitron: ['Orbitron', 'monospace'],
      },
      keyframes: {
        passGlow: {
          '0%, 100%': {
            textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8866',
          },
          '50%': {
            textShadow: '0 0 30px #00ff88, 0 0 60px #00ff8899',
          },
        },
        failFlash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        screenFlash: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        passGlow: 'passGlow 2s ease-in-out infinite',
        failFlash: 'failFlash 0.5s ease-in-out infinite',
        screenFlash: 'screenFlash 0.8s ease-out forwards',
        scanline: 'scanline 8s linear infinite',
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-in forwards',
        pulse: 'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
