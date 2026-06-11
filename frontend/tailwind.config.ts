import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ic-green': '#7EC850',
        'ic-dark': '#1a1a1a',
        'brand-green': '#8fc640',
        'brand-dark': '#1A1D1E',
        'brand-light': '#FFFFFF',
        'brand-accent': '#E8F0E5',
        'brand-secondary': '#7B85A7',
      },
      fontFamily: {
        sans: ['Montserrat', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        glass: '0 20px 40px rgba(0,0,0,0.04)',
        button: '0 10px 40px rgba(143,198,64,0.2)',
      },
      fontSize: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      spacing: {
        '6': '1.5rem',
        '8': '2rem',
      },
    },
  },
  plugins: [],
}
export default config
