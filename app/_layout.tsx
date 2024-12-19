import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import "../global.css";
import { HeaderWithBack } from "@/components/Header";
import { ToastConfig } from "@/components/ToastConfig";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import NotificationProvider from "@/providers/notificationProvider";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
});

export default function RootLayout() {
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
    Jalnan: require("../assets/fonts/Jalnan2.otf"),
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

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <Stack
            screenOptions={{
              gestureEnabled: true,
              gestureDirection: "horizontal",
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(protected)" options={{ headerShown: false }} />
            <Stack.Screen
              name="password-reset/step1"
              options={{
                header: () => <HeaderWithBack name="CHANGE_PASSWORD" />,
              }}
            />
            <Stack.Screen
              name="password-reset/step2"
              options={{
                header: () => <HeaderWithBack name="CHANGE_PASSWORD" />,
              }}
            />
            <Stack.Screen
              name="password-reset/step3"
              options={{
                header: () => <HeaderWithBack name="RESET_PASSWORD" />,
              }}
            />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack>

          <StatusBar style="dark" />
          <Toast config={ToastConfig} />
        </NotificationProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
