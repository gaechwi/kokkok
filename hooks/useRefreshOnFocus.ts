import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";

// 화면에 포커스가 다시 돌아오면 화면 데이터 refetch
export function useRefreshOnFocus<T>(refetch: () => Promise<T>) {
  // 첫 번째 화면 포커스 제외
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }

      refetch();
    }, [refetch]),
  );
}
