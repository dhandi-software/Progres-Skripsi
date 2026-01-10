import { useEffect, useState } from "react";
import { newsApi } from "~/api/news";
import type { NewsListItem } from "~/api/types";

interface UseMiningPageReturn {
  news: NewsListItem[];
  loading: boolean;
  error: string | null;
}

export function useMiningPage(): UseMiningPageReturn {
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await newsApi.getPublishedNews({
          order: "desc",
          category: "mining",
          limit: 15
        });
        setNews(response.data || []);
      } catch (err: any) {
        console.error("Error fetching mining news:", err);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { news, loading, error };
}
