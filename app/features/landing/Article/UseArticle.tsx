import { useEffect, useState } from "react";
import { newsApi } from "~/api/news";
import { videoApi } from "~/api/video";
import { adsApi } from "~/api/adsApi";
import type { ArticleDetail, NewsListItem, VideoListItem, AdvertisementResponse } from "~/api/types";
import { useParams } from "react-router";

interface UseArticleReturn {
  article: ArticleDetail | null;
  relatedNews: NewsListItem[];
  videos: VideoListItem[];
  ads: AdvertisementResponse[];
  loading: boolean;
  errors: {
    article?: string;
    relatedNews?: string;
    videos?: string;
  };
}

export function useArticle(): UseArticleReturn {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsListItem[]>([]);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [ads, setAds] = useState<AdvertisementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<UseArticleReturn["errors"]>({});

  useEffect(() => {
    if (!slug) {
      setErrors({ article: "No article slug provided" });
      setLoading(false);
      return;
    }

    const fetchArticleData = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const results = await Promise.allSettled([
        newsApi.getArticleBySlug(slug),
        newsApi.getPublishedNews({ order: "desc", limit: 6 }),
        videoApi.getVideos({ limit: 6, order: "desc" }),
        adsApi.getAdsByType("Spotlight"),
      ]);

      const newErrors: UseArticleReturn["errors"] = {};

      // Article Detail
      if (results[0].status === "fulfilled") {
        setArticle(results[0].value.data);
      } else {
        console.error("Error fetching article:", results[0].reason);
        newErrors.article = "Failed to load article";
      }

      // Related News
      if (results[1].status === "fulfilled") {
        setRelatedNews(results[1].value.data);
      } else {
        console.error("Error fetching related news:", results[1].reason);
        newErrors.relatedNews = "Failed to load related news";
      }

      // Videos
      if (results[2].status === "fulfilled") {
        setVideos(results[2].value.data);
      } else {
        console.error("Error fetching videos:", results[2].reason);
        newErrors.videos = "Failed to load videos";
      }

      // Ads
      if (results[3].status === "fulfilled") {
        setAds(results[3].value.data || []);
      } else {
        console.error("Error fetching ads:", results[3].reason);
        // Don't set error for ads as they are optional/secondary
      }

      setErrors(newErrors);
      setLoading(false);
    };

    fetchArticleData();
  }, [slug]);

  return {
    article,
    relatedNews,
    videos,
    ads,
    loading,
    errors,
  };
}
