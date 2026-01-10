import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { newsApi } from "~/api/news";
import { videoApi } from "~/api/video";
import type { NewsListItem, VideoListItem, NewsQuery } from "~/api/types";

export function useDashboard(itemsPerPage: number = 8) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [articles, setArticles] = useState<NewsListItem[]>([]);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "video") {
        const response = await videoApi.getVideoIndex({
          limit: itemsPerPage,
          page: currentPage,
        });
        const videoData = response.data?.rows || [];
        const apiTotalPages = response.data?.total_pages || 1;

        setVideos(videoData);
        setTotalPages(apiTotalPages);
        setArticles([]);
      } else {
        const queryParams: NewsQuery = {
          limit: itemsPerPage,
          page: currentPage,
          order: "desc",
        };

        if (activeTab === "published") queryParams.status = "published";
        if (activeTab === "scheduled") queryParams.status = "scheduled";

        const response = await newsApi.getNews(queryParams);
        const newsData = response.data?.rows || [];
        const apiTotalPages = response.data?.total_pages || 1;

        setArticles(newsData);
        setTotalPages(apiTotalPages);
        setVideos([]);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const handleEdit = (id: string, type: "news" | "video") => {
    if (type === "news") {
      navigate(`/writer/upload?id=${id}`);
    } else {
      console.info(`Edit video:`, id);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
    articles,
    videos,
    loading,
    error,
    currentPage,
    totalPages,
    handleEdit,
    handlePrevPage,
    handleNextPage,
    handlePageClick,
    getPageNumbers,
    filteredItems: activeTab === "video" ? videos : articles,
  };
}
