import { useEffect, useState } from "react";
import { videoApi } from "~/api/videoApi";
import type { VideoListItem, VideoIndexQuery } from "~/api/types";

interface UseVideoIndexReturn {
  videos: VideoListItem[];
  loading: boolean;
  error?: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRows: number;
    limit: number;
  };
  setPage: (page: number) => void;
  setFilters: (filters: Omit<VideoIndexQuery, "page" | "limit">) => void;
}

export function useVideoIndex(initialLimit: number = 10): UseVideoIndexReturn {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState<Omit<VideoIndexQuery, "page" | "limit">>({});

  const limit = initialLimit;

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await videoApi.getVideoIndex({
          ...filters,
          page: currentPage,
          limit,
        });

        // Handle case where data.rows is null/undefined
        setVideos(response.data.rows || []);
        setTotalPages(response.data.total_pages);
        setTotalRows(response.data.total_rows);
      } catch (err) {
        console.error("Error fetching video index:", err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [currentPage, limit, filters]);

  return {
    videos,
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
