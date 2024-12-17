import { Redirect, Stack } from "expo-router";

import { Header, HeaderWithBack } from "@/components/Header";
import { useAuthSession } from "@/hooks/useAuthSession";

const AuthLayout = () => {
  const { session, isLoading } = useAuthSession();

  if (isLoading) return null;
  if (session) return <Redirect href="/home" />;

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
    </>
  );
};

export default AuthLayout;
