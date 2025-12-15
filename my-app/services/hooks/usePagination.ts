import { useCallback, useState } from 'react';

/**
 * Hook to handle pagination state and logic
 * Useful for any paginated list
 */
export function usePagination(initialPageSize: number = 10) {
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  const reset = useCallback(() => {
    setOffset(0);
    setTotal(undefined);
  }, []);

  const advance = useCallback(
    (count: number) => {
      setOffset((prev) => prev + count);
    },
    []
  );

  const setLoadingState = useCallback((loading: boolean) => {
    setLoadingMore(loading);
  }, []);

  const setTotalCount = useCallback((count: number | undefined) => {
    setTotal(count);
  }, []);

  const hasMore = useCallback(() => {
    if (typeof total === 'number') {
      return offset < total;
    }
    return true;
  }, [offset, total]);

  const canLoadMore = useCallback(() => {
    return !loadingMore && hasMore();
  }, [loadingMore, hasMore]);

  return {
    offset,
    total,
    loadingMore,
    pageSize: initialPageSize,
    reset,
    advance,
    setLoadingState,
    setTotalCount,
    hasMore: hasMore(),
    canLoadMore: canLoadMore(),
  };
}
