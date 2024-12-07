import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { Header, HeaderWithBack } from "@/components/Header";
import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const AuthLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
};

export default AuthLayout;
