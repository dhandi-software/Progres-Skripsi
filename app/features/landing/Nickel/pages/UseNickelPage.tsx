import { useEffect, useState } from "react";
import { newsApi } from "~/api/news";
import type { NewsListItem } from "~/api/types";

interface UseNickelPageReturn {
  headlineNews: NewsListItem | null;
  news: NewsListItem[];
  policiesNews: NewsListItem[];
  hirilizationNews: NewsListItem[];
  moreFromNickelNews: NewsListItem[];
  loading: boolean;
  error: string | null;
}

export function useNickelPage(): UseNickelPageReturn {
  const [headlineNews, setHeadlineNews] = useState<NewsListItem | null>(null);
  const [news, setNews] = useState<NewsListItem[]>([]);
  const [policiesNews, setPoliciesNews] = useState<NewsListItem[]>([]);
  const [hirilizationNews, setHirilizationNews] = useState<NewsListItem[]>([]);
  const [moreFromNickelNews, setMoreFromNickelNews] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const [
          headlineResponse,
          newsResponse,
          policiesResponse,
          hirilizationResponse,
          moreResponse
        ] = await Promise.allSettled([
          newsApi.getHeadlineNews(),
          newsApi.getPublishedNews({
            order: "desc",
            category: "nickel",
            limit: 15
          }),
          newsApi.getPublishedNews({
            order: "desc",
            category: "nickel",
            topic: "policies",
            limit: 4
          }),
          newsApi.getPublishedNews({
            order: "desc",
            category: "nickel",
            topic: "hirilization",
            limit: 4
          }),
          newsApi.getPublishedNews({
            order: "desc",
            category: "nickel",
            limit: 4
          })
        ]);

        // Handle headline news
        if (headlineResponse.status === "fulfilled") {
          const headlines = headlineResponse.value.data;
          // Only use headline if it belongs to nickel category
          const nickelHeadline = headlines?.find(headline =>
            headline.categories?.some(cat => cat.slug === "nickel")
          );
          if (nickelHeadline) {
            setHeadlineNews(nickelHeadline);
          }
        }

        // Handle regular news (for featured and sidebar)
        if (newsResponse.status === "fulfilled") {
          setNews(newsResponse.value.data || []);
        } else {
          throw new Error("Failed to fetch nickel news");
        }

        // Handle policies news
        if (policiesResponse.status === "fulfilled") {
          setPoliciesNews(policiesResponse.value.data || []);
        }

        // Handle hirilization news
        if (hirilizationResponse.status === "fulfilled") {
          setHirilizationNews(hirilizationResponse.value.data || []);
        }

        // Handle more from nickel news
        if (moreResponse.status === "fulfilled") {
          setMoreFromNickelNews(moreResponse.value.data || []);
        }

      } catch (err: any) {
        console.error("Error fetching nickel news:", err);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { headlineNews, news, policiesNews, hirilizationNews, moreFromNickelNews, loading, error };
}
