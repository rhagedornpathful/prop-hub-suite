import { useState, useMemo, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
}

export const usePagination = (
  totalItems: number,
  initialPageSize: number = 20
): PaginationState & PaginationActions => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize) || 1,
    [totalItems, pageSize]
  );

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  const canGoNext = page < totalPages;
  const canGoPrevious = page > 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    setPageSize,
    canGoNext,
    canGoPrevious,
    startIndex,
    endIndex,
  };
};
