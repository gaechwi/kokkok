/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ["./app/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		colors: {
			primary: "#8356F5",
			secondary: {
				yellow: "#FCEC5B",
				red: "#FF7A7A",
			},
			gray: {
				5: "#F8F8F8",
				10: "#F2F2F2",
				20: "#E1E1E1",
				25: "#DDDDDD",
				30: "#CECECE",
				40: "#9A9A9A",
				45: "#969696",
				50: "#868686",
				55: "#828282",
				60: "#727272",
				65: "#666666",
				70: "#5D5D5D",
				80: "#404040",
				90: "#333333",
				100: "#2B2B2B",
			},
		},
		extend: {},
	},
	plugins: [],
};
