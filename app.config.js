module.exports = {
  expo: {
    name: "kokkok",
    slug: "kokkok",
    scheme: "kokkok",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.epilogue.kokkok",
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "사용자가 사진을 선택할 수 있도록 앨범 접근 권한이 필요합니다.",
        NSCameraUsageDescription:
          "사진 촬영을 위해 카메라 접근 권한이 필요합니다.",
        UIViewControllerBasedStatusBarAppearance: true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      googleServicesFile: "./google-services.json",
      package: "com.epilogue.kokkok",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      [
        "expo-font",
        {
          fonts: ["./assets/fonts/Pretendard-Regular.otf"],
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          url: "https://sentry.io/",
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "85f67272-5b0c-4bdc-9b49-4d03903e47ba",
      },
      EXPO_PUSH_TOKEN: process.env.EXPO_PUSH_TOKEN,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SENTRY_DSN: process.env.SENTRY_DSN,
    },
    owner: "epilogue-1",
  },
};
