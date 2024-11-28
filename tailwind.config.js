const { colors } = require("./constants/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				primary: colors.primary,
				secondary: {
					yellow: colors.secondary.yellow,
					red: colors.secondary.red,
				},
				black: colors.black,
				gray: colors.gray,
			},
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
