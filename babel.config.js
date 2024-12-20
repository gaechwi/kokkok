// biome-ignore lint/complexity/useArrowFunction: <explanation>
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@components": "./components",
            "@constants": "./constants",
            "@assets": "./assets",
            "@utils": "./utils",
            "@contexts": "./contexts",
          },
        },
      ],
    ],
  };
};
