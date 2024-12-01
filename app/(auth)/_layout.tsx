import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
};

export default AuthLayout;
