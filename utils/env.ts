import Constants from "expo-constants";

// Expo 개발 환경과 빌드 환경 모두에서 동작하도록 함
export const ENV = {
  SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl,
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey,
};
