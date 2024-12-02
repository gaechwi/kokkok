import { useQuery, QueryKey, UseQueryResult } from "@tanstack/react-query";

// queryKey, getService, defaultErrorMessage, enabled 순
// 기본 에러 핸들링: 제공된 메시지 || defaultErrorMessage
const useFetchData = <T>(
  queryKey: QueryKey,
  getService: () => Promise<T>,
  defaultErrorMessage: string,
  enabled = true,
): UseQueryResult<T, Error> => {
  return useQuery<T, Error>({
    queryKey: queryKey,
    queryFn: async () => {
      try {
        const response = await getService();
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : defaultErrorMessage;
        throw new Error(errorMessage);
      }
    },
    enabled: enabled,
  });
};

export default useFetchData;
