/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      primary: "var(--color-primary)",
      secondary: {
        yellow: "var(--color-secondary-yellow)",
        red: "var(--color-secondary-red)",
      },
      white: "var(--color-white)",
      black: "var(--color-black)",
      gray: {
        5: "var(--color-gray-5)",
        10: "var(--color-gray-10)",
        20: "var(--color-gray-20)",
        25: "var(--color-gray-25)",
        30: "var(--color-gray-30)",
        40: "var(--color-gray-40)",
        45: "var(--color-gray-45)",
        50: "var(--color-gray-50)",
        55: "var(--color-gray-55)",
        60: "var(--color-gray-60)",
        65: "var(--color-gray-65)",
        70: "var(--color-gray-70)",
        80: "var(--color-gray-80)",
        90: "var(--color-gray-90)",
      },
    },
    extend: {
      fontFamily: {
        pblack: ["Pretendard-Black"],
        pbold: ["Pretendard-Bold"],
        pextrabold: ["Pretendard-ExtraBold"],
        pextralight: ["Pretendard-ExtraLight"],
        plight: ["Pretendard-Light"],
        pmedium: ["Pretendard-Medium"],
        pregular: ["Pretendard-Regular"],
        psemibold: ["Pretendard-SemiBold"],
        pthin: ["Pretendard-Thin"],
      },
    },
  },
  plugins: [],
};
