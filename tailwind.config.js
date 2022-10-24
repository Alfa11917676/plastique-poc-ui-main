module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // fontSize: {
    //   xs: '0.75rem',
    //   sm: '0.875rem',
    //   base: '1rem',
    //   lg: '1.125rem',
    //   xl: '1.25rem',
    //   '2xl': '1.5rem',
    //   '3xl': '1.875rem',
    //   '4xl': '2.25rem',
    //   '5xl': '3rem',
    //   '6xl': '4rem',
    // },
    extend: {
  
      colors: {
        pageBg: '#121212',
        grayBg: '#1F2231',
        mainPurple: '#5E00FF',
        mainGray: 'rgba(255, 255, 255, 0.6)',
        gray03: 'rgba(255, 255, 255, 0.3)',
        lightGray: 'rgba(255, 255, 255, 0.4)',
        mainBlue: '#31D2F5',
        mainGreen: '#23F0BF',
        searchButtonBg: `rgba(255, 255, 255, 0.1)`,
        searchButtonBorder: `rgba(255, 255, 255, 0.2)`,
        inputBackground: `rgba(255, 255, 255, 0.03)`,
        inputBorder: `rgba(255, 255, 255, 0.2)`,
      },
      transitionProperty: {
        height: 'max-height',
        spacing: 'margin, padding',
      },
      transitionDuration: {
        0: '0ms',
        2000: '2000ms',
      },
    },
  },
  variants: {},
  plugins: [],
};
