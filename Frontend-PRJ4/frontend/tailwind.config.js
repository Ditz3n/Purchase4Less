/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'toast-slide-in-right': {
          '0%': { transform: 'translateX(calc(100% + 1rem))', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        'toast-slide-out-down': {
          '0%': { 
            transform: 'translateY(0) scale(1)', 
            opacity: 1 
          },
          '100%': { 
            transform: 'translateY(calc(100% + 1rem)) scale(0.95)', 
            opacity: 0 
          },
        },
        'toast-swipe-out': {
          '0%': { 
            transform: 'translateX(var(--radix-toast-swipe-end-x))',
            opacity: 1 
          },
          '100%': { 
            transform: 'translateX(var(--radix-toast-swipe-end-x)) translateY(100%)',
            opacity: 0 
          },
        },
      },
      animation: {
        'toast-slide-in-right': 'toast-slide-in-right 0.4s ease-out',
        'toast-slide-out-down': 'toast-slide-out-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'toast-swipe-out': 'toast-swipe-out 0.4s ease-out',
      },
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('touch-device', '@media (pointer: coarse)');
    },
  ],
}
