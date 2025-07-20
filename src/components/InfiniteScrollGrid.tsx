import React, { useCallback, useRef, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface InfiniteScrollGridProps<T> {
  queryKey: string[];
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<{ data: T[]; nextPage?: number; hasNextPage: boolean }>;
  renderItem: (item: T, index: number) => React.ReactNode;
  gridClassName?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  itemsPerPage?: number;
}

export function InfiniteScrollGrid<T>({
  queryKey,
  queryFn,
  renderItem,
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
  loadingComponent,
  emptyComponent,
  itemsPerPage = 10
}: InfiniteScrollGridProps<T>) {
  const observerRef = useRef<IntersectionObserver>();
  const lastElementRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const lastElementCallback = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (lastElementRef.current) {
      lastElementCallback(lastElementRef.current);
    }
  }, [lastElementCallback]);

  if (isLoading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: itemsPerPage }).map((_, index) => (
          <Card key={index} className="p-4">
            {loadingComponent || (
              <>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </>
            )}
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading data: {error?.message}
      </div>
    );
  }

  const allItems = data?.pages.flatMap(page => page.data) || [];

  if (allItems.length === 0) {
    return emptyComponent || (
      <div className="text-center py-8 text-muted-foreground">
        No items found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={gridClassName}>
        {allItems.map((item, index) => (
          <div
            key={index}
            ref={index === allItems.length - 1 ? lastElementRef : undefined}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  );
}