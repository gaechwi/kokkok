import { useReactQueryDevTools } from "@dev-plugins/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import "../global.css";
import { HeaderWithBack } from "@/components/Header";
import { ToastConfig } from "@/components/ToastConfig";
import { useAppState } from "@/hooks/useAppState";
import { useOnlineManager } from "@/hooks/useOnlineManager";
import NotificationProvider from "@/providers/notificationProvider";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
});

Sentry.init({
  dsn: Constants.expoConfig?.extra?.SENTRY_DSN,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing. Adjusting this value in production.
  integrations: [
    // Pass integration
    navigationIntegration,
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames in the application
});

function RootLayout() {
  const ref = useNavigationContainerRef();

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

  useEffect(() => {
    if (ref?.current) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  if (!loaded && !error) return null;

  return (
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
  );
}

// Wrap the Root Layout route component with `Sentry.wrap` to capture gesture info and profiling data.
export default Sentry.wrap(RootLayout);
