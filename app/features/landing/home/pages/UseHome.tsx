import { useEffect, useState } from "react";
import { newsApi } from "~/api/news";
import { videoApi } from "~/api/video";
import type { NewsListItem, VideoListItem } from "~/api/types";

interface UseHomeReturn {
  latestNews: NewsListItem[];
  trendingVideos: VideoListItem[];
  nickelNews: NewsListItem[];
  miningNews: NewsListItem[];
  marketNews: NewsListItem[];
  technologyNews: NewsListItem[];
  trendingNews: NewsListItem[];
  headlineNews: NewsListItem[];
  exclusiveInterviewNews: NewsListItem[];
  loading: boolean;
  errors: {
    latestNews?: string;
    trendingVideos?: string;
    nickelNews?: string;
    miningNews?: string;
    marketNews?: string;
    technologyNews?: string;
    trendingNews?: string;
    headlineNews?: string;
    exclusiveInterviewNews?: string;
  };
}

export function useHome(): UseHomeReturn {
  const [latestNews, setLatestNews] = useState<NewsListItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<VideoListItem[]>([]);
  const [nickelNews, setNickelNews] = useState<NewsListItem[]>([]);
  const [miningNews, setMiningNews] = useState<NewsListItem[]>([]);
  const [marketNews, setMarketNews] = useState<NewsListItem[]>([]);
  const [technologyNews, setTechnologyNews] = useState<NewsListItem[]>([]);
  const [trendingNews, setTrendingNews] = useState<NewsListItem[]>([]);
  const [headlineNews, setHeadlineNews] = useState<NewsListItem[]>([]);
  const [exclusiveInterviewNews, setExclusiveInterviewNews] = useState<NewsListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<UseHomeReturn["errors"]>({});

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const results = await Promise.allSettled([
        newsApi.getHeadlineNews(),
        newsApi.getPublishedNews({ order: "desc", limit: 6 }),
        videoApi.getVideos({ limit: 6, order: "desc" }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 6,
          category: "nickel",
        }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 6,
          category: "mining",
        }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 6,
          category: "market-investment",
        }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 6,
          category: "technology",
        }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 6,
          isTrending: true,
        }),
        newsApi.getPublishedNews({
          order: "desc",
          limit: 3,
          category: "exclusive-interview",
        }),
      ]);

      const newErrors: UseHomeReturn["errors"] = {};

      // Headline News
      if (results[0].status === "fulfilled") {
        setHeadlineNews(results[0].value.data || []);
      } else {
        console.error("Error fetching headline news:", results[0].reason);
        newErrors.headlineNews = "Failed to load headline news";
      }

      // Latest News
      if (results[1].status === "fulfilled") {
        setLatestNews(results[1].value.data);
      } else {
        console.error("Error fetching latest news:", results[1].reason);
        newErrors.latestNews = "Failed to load latest news";
      }

      // Trending Videos
      if (results[2].status === "fulfilled") {
        setTrendingVideos(results[2].value.data);
      } else {
        console.error("Error fetching videos:", results[2].reason);
        newErrors.trendingVideos = "Failed to load videos";
      }

      // Nickel News
      if (results[3].status === "fulfilled") {
        setNickelNews(results[3].value.data);
      } else {
        console.error("Error fetching nickel news:", results[3].reason);
        newErrors.nickelNews = "Failed to load nickel news";
      }

      // Mining News
      if (results[4].status === "fulfilled") {
        setMiningNews(results[4].value.data);
      } else {
        console.error("Error fetching mining news:", results[4].reason);
        newErrors.miningNews = "Failed to load mining news";
      }

      // Market Investment News
      if (results[5].status === "fulfilled") {
        setMarketNews(results[5].value.data);
      } else {
        console.error(
          "Error fetching market investment news:",
          results[5].reason,
        );
        newErrors.marketNews = "Failed to load market investment news";
      }

      // Technology News
      if (results[6].status === "fulfilled") {
        setTechnologyNews(results[6].value.data);
      } else {
        console.error(
          "Error fetching technology news:",
          results[6].reason,
        );
        newErrors.technologyNews = "Failed to load technology news";
      }

      // Trending News
      if (results[7].status === "fulfilled") {
        setTrendingNews(results[7].value.data);
      } else {
        console.error("Error fetching trending news:", results[7].reason);
        newErrors.trendingNews = "Failed to load trending news";
      }

      // Exclusive Interview News
      if (results[8].status === "fulfilled") {
        setExclusiveInterviewNews(results[8].value.data);
      } else {
        console.error("Error fetching exclusive interview news:", results[8].reason);
        newErrors.exclusiveInterviewNews = "Failed to load exclusive interview news";
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return {
    latestNews,
    trendingVideos,
    nickelNews,
    miningNews,
    marketNews,
    technologyNews,
    trendingNews,
    headlineNews,
    exclusiveInterviewNews,
    loading,
    errors,
  };
}
