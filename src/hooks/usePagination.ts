import { useMemo, useState, useCallback } from "react";

interface PaginationResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  data: T[];
  goToPage: (p: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  from: number;
  to: number;
}

export function usePagination<T>(
  items: T[],
  initialPageSize = 12,
): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const safePage = Math.min(page, totalPages);
  if (safePage !== page && totalPages > 0) {
    setPage(safePage);
  }

  const from = (safePage - 1) * pageSize;
  const to = Math.min(from + pageSize, total);

  const data = useMemo(
    () => items.slice(from, to),
    [items, from, to],
  );

  const goToPage = useCallback(
    (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    [totalPages],
  );

  const nextPage = useCallback(
    () => setPage((p) => Math.min(p + 1, totalPages)),
    [totalPages],
  );

  const prevPage = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [],
  );

  const handleSetPageSize = useCallback(
    (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    [],
  );

  return {
    page: safePage,
    pageSize,
    totalPages,
    total,
    data,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    from,
    to,
  };
}
