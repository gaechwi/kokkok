import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

export interface InfiniteResponse<T> {
  data: T[];
  total: number;
  hasNext: boolean;
  nextPage: number;
}

export default function useInfiniteLoad<T>({
  queryFn,
  queryKey,
  limit,
  genLimit,
}: {
  queryFn: ({
    page,
    limit,
  }: { page?: number; limit?: number }) => Promise<InfiniteResponse<T>>;
  queryKey: (string | number)[];
  limit?: number;
  genLimit?: (pageParams: number) => number;
}) {
  const {
    data,
    error,
    isFetching,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      queryFn({ page: pageParam, limit: genLimit?.(pageParam) || limit }),
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

  return {
    data,
    error,
    isFetching,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loadMore,
    refetch,
  };
}
