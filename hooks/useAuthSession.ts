import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

async function updateUserInfo(session: Session | null) {
  if (session)
    await Promise.all([
      SecureStore.setItemAsync("userId", session.user.id),
      SecureStore.setItemAsync("createdAt", session.user.created_at),
    ]);
  else
    await Promise.all([
      SecureStore.deleteItemAsync("userId"),
      SecureStore.deleteItemAsync("createdAt"),
    ]);
}

export function useAuthSession(queryClient: QueryClient) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session);
      await updateUserInfo(session);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);
      await updateUserInfo(session);
      queryClient.clear();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { isLoggedIn, isLoading };
}
