import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuthSession(queryClient: QueryClient) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(session?.user.id);
      setSession(session);
      queryClient.clear();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return { session, isLoading };
}
