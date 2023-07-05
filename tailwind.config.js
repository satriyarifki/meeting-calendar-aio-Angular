/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    // screens: {
    //   'xs': '475px',
    // },
    extend: {
      colors: {
        hijau: "#00FFC6",
        biru: "#30AADD",
        hijau2: "#43919B",
        hijau3: "#247881",
        hijau4: "#439A97",
        biru2: "#6D67E4",
        biru3: "#4B56D2",
      },
    },
    fontFamily: {
      manrope: ["Manrope"],
    },
  },
  plugins: [],
};
