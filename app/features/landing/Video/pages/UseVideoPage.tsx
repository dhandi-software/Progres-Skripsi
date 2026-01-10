import { useEffect, useState } from "react";
import { videoApi } from "~/api/video";
import type { VideoListItem } from "~/api/types";

interface UseVideoPageReturn {
  videos: VideoListItem[];
  loading: boolean;
  error: string | null;
}

export function useVideoPage(): UseVideoPageReturn {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Fetch videos with default params (adjust limit as needed)
        const response = await videoApi.getVideos({ order: "desc", limit: 20 });
        setVideos(response.data);
      } catch (err: any) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return { videos, loading, error };
}
