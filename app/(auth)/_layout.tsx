import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Header, HeaderWithBack } from "@/components/Header";

const AuthLayout = () => {
  const router = useRouter();

  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{
            header: () => <Header name="LOGIN" />,
          }}
        />
        <Stack.Screen
          name="sign-up/step1"
          options={{
            header: () => <HeaderWithBack name="SIGNUP" />,
          }}
        />
        <Stack.Screen
          name="sign-up/step2"
          options={{
            header: () => <HeaderWithBack name="SIGNUP" />,
          }}
        />
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
    </>
  );
};

export default AuthLayout;
