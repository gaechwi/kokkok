import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

export interface InfiniteResponse<T> {
  data: T[];
  total: number;
  hasNext: boolean;
  nextPage: number;
}

export default function useInfiniteLoad<T>(
  queryFn: ({
    page,
    limit,
  }: { page: number; limit: number }) => Promise<InfiniteResponse<T>>,
  queryKey: string[],
  limit: number,
) {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => queryFn({ page: pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextPage : undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
    initialPageParam: 0,
  });

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return { data, error, isLoading, isFetchingNextPage, loadMore, refetch };
}
