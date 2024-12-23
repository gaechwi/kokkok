import type {
  InfiniteData,
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import { useState } from "react";
export default function useRefresh<T>({
  refetch,
}: {
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<InfiniteData<T, unknown>, Error>>;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return { refreshing, onRefresh };
}
