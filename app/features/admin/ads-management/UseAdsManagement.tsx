import { useState, useEffect, useCallback } from "react";
import { adsApi } from "~/api/adsApi";
import type { AdvertisementResponse } from "~/api/types";

export function useAdsManagement() {
  const [ads, setAds] = useState<AdvertisementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"Hero Banner" | "Spotlight Article" | null>(null);

  const fetchAds = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adsApi.getAds();
      setAds(response?.data || []);
    } catch (err: any) {
      console.error("Error fetching ads:", err);
      setError(err.response?.data?.message || "Failed to load advertisements");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const openModal = (type: "Hero Banner" | "Spotlight Article") => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const handleUploadSuccess = () => {
    closeModal();
    fetchAds();
  };

  return {
    ads,
    isLoading,
    error,
    activeModal,
    openModal,
    closeModal,
    handleUploadSuccess,
    fetchAds,
  };
}
