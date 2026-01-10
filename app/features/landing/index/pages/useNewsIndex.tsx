import { useEffect, useState } from "react";
import { newsApi } from "~/api/news";
import type { NewsListItem, NewsIndexQuery } from "~/api/types";

interface UseNewsIndexReturn {
  news: NewsListItem[];
  loading: boolean;
  error?: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRows: number;
    limit: number;
  };
  setPage: (page: number) => void;
  setFilters: (filters: Omit<NewsIndexQuery, "page" | "limit">) => void;
}

export function useNewsIndex(initialLimit: number = 10): UseNewsIndexReturn {
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState<Omit<NewsIndexQuery, "page" | "limit">>({});

  const limit = initialLimit;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await newsApi.getNewsIndex({
          ...filters,
          page: currentPage,
          limit,
        });

        setNews(response.data.rows);
        setTotalPages(response.data.total_pages);
        setTotalRows(response.data.total_rows);
      } catch (err) {
        console.error("Error fetching news index:", err);
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentPage, limit, filters]);

  return {
    news,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalRows,
      limit,
    },
    setPage: setCurrentPage,
    setFilters,
  };
}
