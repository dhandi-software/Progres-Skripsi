import { useState, useEffect, useCallback } from "react";
import { newsApi } from "~/api/news";
import type { NewsListItem } from "~/api/types";

export interface PendingArticle {
  id: string;
  number: string;
  title: string;
  author: string;
  authorAvatar?: string;
  date: string;
  status: string;
  body?: string;
  image?: string;
  imageCaption?: string;
  categories?: string[];
  subHeading?: string;
}

interface UsePendingReviewReturn {
  // States
  articles: PendingArticle[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  selectedArticle: PendingArticle | null;
  view: "list" | "preview";

  // Pagination
  setCurrentPage: (page: number) => void;

  // Article selection
  selectArticle: (article: PendingArticle) => void;
  clearSelectedArticle: () => void;

  // View management
  setView: (view: "list" | "preview") => void;
  goBackToList: () => void;

  // Data fetching
  refreshArticles: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `Published on ${day}/${month}/${year} at ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? "Just uploaded" : `${diffMins} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return "Just uploaded";
  }
}

function mapNewsItemToPendingArticle(item: NewsListItem, index: number): PendingArticle {
  return {
    id: item.id,
    number: (index + 1).toString(),
    title: item.title,
    author: item.user?.name || "Unknown Author",
    authorAvatar: item.user?.photo,
    date: formatDate(item.created_at),
    status: formatTimeAgo(item.created_at),
    body: item.body,
    image: item.media?.path,
    imageCaption: item.image_caption,
    categories: item.categories?.map((cat) => cat.name) || [],
    subHeading: item.description,
  };
}

export function usePendingReview(): UsePendingReviewReturn {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<PendingArticle | null>(null);
  const [view, setView] = useState<"list" | "preview">("list");

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await newsApi.getNews({
        status: "pending" as any, // Using "pending" status as specified
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.code === 200 && response.data) {
        const mappedArticles = response.data.rows.map((item, index) =>
          mapNewsItemToPendingArticle(item, (currentPage - 1) * ITEMS_PER_PAGE + index)
        );
        setArticles(mappedArticles);
        setTotalPages(response.data.total_pages || 1);
        setTotalItems(response.data.total_rows || 0);
      } else {
        setArticles([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err: any) {
      console.error("Error fetching pending articles:", err);
      setError(err.message || "Failed to fetch pending articles");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  // Initial fetch and refetch on page change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const selectArticle = useCallback((article: PendingArticle) => {
    setSelectedArticle(article);
    setView("preview");
  }, []);

  const clearSelectedArticle = useCallback(() => {
    setSelectedArticle(null);
  }, []);

  const goBackToList = useCallback(() => {
    setView("list");
    setSelectedArticle(null);
  }, []);

  const refreshArticles = useCallback(async () => {
    await fetchArticles();
  }, [fetchArticles]);

  return {
    // States
    articles,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalItems,
    selectedArticle,
    view,

    // Pagination
    setCurrentPage,

    // Article selection
    selectArticle,
    clearSelectedArticle,

    // View management
    setView,
    goBackToList,

    // Data fetching
    refreshArticles,
  };
}
