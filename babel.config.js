// biome-ignore lint/complexity/useArrowFunction: <explanation>
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
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
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowlist: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};
