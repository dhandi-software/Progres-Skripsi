import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { newsApi } from "~/api/news";
import { getRelativeTime } from "~/lib/timeUtils";

export interface DraftArticle {
  id: string;
  title: string;
  caption: string;
  category: string;
  topics: string[];
  articleContent: string;
  image: string | null;
  createdAt: string;
  views: number;
}

interface UseDraftOptions {
  itemsPerPage?: number;
}

export const useDraft = (options: UseDraftOptions = {}) => {
  const { itemsPerPage = 8 } = options;
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<DraftArticle[]>([]);
  const [toastProps, setToastProps] = useState<{
    title: string;
    variant: "success" | "destructive" | "default";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const showToast = (
    title: string,
    variant: "success" | "destructive" | "default" = "success"
  ) => {
    setToastProps({ title, variant });
  };

  const hideToast = () => {
    setToastProps(null);
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const response = await newsApi.getNews({
        limit: itemsPerPage,
        page: currentPage,
        status: "draft",
        order: "desc",
      });

      const newsData = response.data?.rows || [];
      const apiTotalPages = response.data?.total_pages || 1;

      const mappedDrafts: DraftArticle[] = newsData.map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.image_caption || "",
        category: item.categories?.[0]?.name || "",
        topics: item.topics?.map((t) => t.name) || [],
        articleContent: item.body || "",
        image: item.media?.path || null,
        createdAt: item.created_at,
        views: item.analytic?.count || 0,
      }));

      setDrafts(mappedDrafts);
      setTotalPages(apiTotalPages);
    } catch (error) {
      console.error("Error loading drafts:", error);
      showToast("Failed to load drafts", "destructive");
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();

    const updateSuccess = localStorage.getItem("draftUpdateSuccess");
    if (updateSuccess) {
      showToast("Draft updated successfully!");
      localStorage.removeItem("draftUpdateSuccess");
    }

    const deleteSuccess = localStorage.getItem("draftDeleteSuccess");
    if (deleteSuccess) {
      showToast("Article deleted successfully!");
      localStorage.removeItem("draftDeleteSuccess");
    }
  }, [currentPage]);

  const getTimeAgo = (dateString: string): string => {
    return getRelativeTime(dateString);
  };

  const handleEdit = (draft: DraftArticle) => {
    navigate(`/writer/upload?id=${draft.id}`);
  };

  const createEmptyDraft = (index: number): DraftArticle => ({
    id: `empty-${index}`,
    title: "Create New Article",
    caption: "",
    category: "",
    topics: [],
    articleContent: "",
    image: null,
    createdAt: new Date().toISOString(),
    views: 0,
  });

  const getDisplayData = (): DraftArticle[] => {
    const emptySlotsCount = itemsPerPage - drafts.length;
    if (emptySlotsCount <= 0) return drafts;

    const emptySlots = Array.from({ length: emptySlotsCount }, (_, index) =>
      createEmptyDraft(drafts.length + index)
    );

    return [...drafts, ...emptySlots];
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getPageNumbers = (): number[] => {
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
    states: {
      drafts,
      loading,
      currentPage,
      totalPages,
      toastProps,
    },
    setters: {
      setCurrentPage,
      setToastProps,
      hideToast,
    },
    handlers: {
      handleEdit,
      getTimeAgo,
      getDisplayData,
      handlePageChange,
      handlePrevPage,
      handleNextPage,
      getPageNumbers,
    }
  };
}
