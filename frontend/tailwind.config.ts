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
