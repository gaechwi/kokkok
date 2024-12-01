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
          moduleName: "@env", // 사용할 모듈 이름
          path: ".env", // 환경변수 파일 경로
          blocklist: null, // 제외할 키 (선택 사항)
          allowlist: null, // 허용할 키 (선택 사항)
          safe: false, // 안전 모드 (선택 사항)
          allowUndefined: true, // 정의되지 않은 변수 허용 여부
        },
      ],
    ],
  };
};
