import { useState, useCallback } from "react";
import { videoApi } from "~/api/video";
import { useNavigate } from "react-router";

interface NewsVideoFormData {
  title: string;
  youtubeLink: string;
}

interface ToastState {
  title: string;
  variant: "success" | "destructive" | "default";
}

export const useNewsVideo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NewsVideoFormData>({
    title: "",
    youtubeLink: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState<ToastState | null>(null);

  const setTitle = useCallback((title: string) => {
    setFormData((prev) => ({ ...prev, title }));
  }, []);

  const setYoutubeLink = useCallback((youtubeLink: string) => {
    setFormData((prev) => ({ ...prev, youtubeLink }));
  }, []);

  const showToast = useCallback(
    (title: string, variant: ToastState["variant"] = "success") => {
      setToastProps({ title, variant });
    },
    []
  );

  const clearToast = useCallback(() => {
    setToastProps(null);
  }, []);

  const extractYoutubeId = useCallback((url: string): string | null => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }, []);

  const isFormValid = Boolean(
    formData.title.trim() &&
    formData.youtubeLink.trim() &&
    extractYoutubeId(formData.youtubeLink)
  );

  const handlePublish = useCallback(async () => {
    if (!isFormValid) {
      showToast("Please fill in all required fields", "destructive");
      return;
    }

    setIsLoading(true);
    try {
      await videoApi.createVideo({
        title: formData.title,
        link: formData.youtubeLink,
      });
      showToast("News video published successfully!");
      setTimeout(() => navigate("/writer"), 1500);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to publish news video";
      showToast(errorMessage, "destructive");
    } finally {
      setIsLoading(false);
    }
  }, [formData, isFormValid, showToast, navigate]);

  const handleCancel = useCallback(() => {
    navigate("/writer");
  }, [navigate]);

  return {
    states: {
      formData,
      toastProps,
      isFormValid,
      isLoading,
    },
    setters: {
      setTitle,
      setYoutubeLink,
      setToastProps,
      clearToast,
    },
    handlers: {
      handlePublish,
      handleCancel,
      extractYoutubeId,
    }
  };
}
