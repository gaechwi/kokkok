import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";

import "../global.css";
import { useFonts } from "expo-font";
import { HeaderWithBack } from "@/components/Header";
import { supabase } from "@/utils/supabase";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import { useAppState } from "@/hooks/useAppState";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

// 보호된 라우트 체크를 위한 함수
const useProtectedRoute = (session: Session | null) => {
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    // verify OTP가 session을 생성하여 예외처리
    const isPasswordResetSteps = [
      "/password-reset/step1",
      "/password-reset/step2",
      "/password-reset/step3",
    ].includes(pathname);

    if (!session && !inAuthGroup && segments.length > 0) {
      // 로그인되지 않은 상태에서 보호된 라우트 접근 시도
      router.replace("/sign-in");
    } else if (session && inAuthGroup && !isPasswordResetSteps) {
      console.log(pathname);
      console.log(session && inAuthGroup && !isPasswordResetSteps);
      // 이미 로그인된 상태에서 인증 페이지 접근 시도
      router.replace("/home");
    }
  }, [session, segments, pathname, router]);
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);

  useProtectedRoute(session);

  const [loaded, error] = useFonts({
    "Pretendard-Black": require("../assets/fonts/Pretendard-Black.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.otf"),
    "Pretendard-ExtraLight": require("../assets/fonts/Pretendard-ExtraLight.otf"),
    "Pretendard-Light": require("../assets/fonts/Pretendard-Light.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Thin": require("../assets/fonts/Pretendard-Thin.otf"),
  });

  useOnlineManager();
  useAppState();
  // shift+m 누르고 Open @dev-plugins/react-query 선택
  useReactQueryDevTools(queryClient);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // TODO - 세션 체크
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!loaded && !error) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification"
          options={{ header: () => <HeaderWithBack name="NOTIFICATION" /> }}
        />
        <Stack.Screen
          name="setting"
          options={{ header: () => <HeaderWithBack name="SETTING" /> }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
