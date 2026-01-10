import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { newsApi } from "~/api/news";
import { mediaApi } from "~/api/mediaApi";
import type { NewsRequest } from "~/api/types";
import { useMedia } from "~/features/Editor/media/MediaContext";

interface UseEditArticleOptions {
  articleId: string;
}

export const useEditArticle = (options: UseEditArticleOptions) => {
  const { articleId } = options;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isHeadline, setIsHeadline] = useState(false);
  const [publishMethod, setPublishMethod] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isFetchingArticle, setIsFetchingArticle] = useState(true);

  // UI States
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState<{
    title: string;
    variant: "success" | "destructive" | "default";
  } | null>(null);

  // Error States
  const [errors, setErrors] = useState<{
    image: boolean;
    imageCaption: boolean;
    title: boolean;
    subHeading: boolean;
    category: boolean;
  }>({
    image: false,
    imageCaption: false,
    title: false,
    subHeading: false,
    category: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Fetch article data
  useEffect(() => {
    if (articleId) {
      const fetchArticle = async () => {
        setIsFetchingArticle(true);
        try {
          const response = await newsApi.getNewsById(articleId);
          const article: any = response.data || response;

          // Populate form fields
          setTitle(article.title || "");
          setSubHeading(article.sub_heading || "");
          setImageCaption(article.image_caption || "");
          setContent(article.body || "");
          setIsHeadline(article.set_headline === true);

          // Set categories
          if (article.categories && Array.isArray(article.categories)) {
            if (article.categories.length > 0) {
              if (typeof article.categories[0] === 'object') {
                const categoryIds = article.categories.map((c: any) => {
                  if (c.category?.id) return c.category.id;
                  if (c.id) return c.id;
                  return null;
                }).filter((id: any) => id !== null);
                setSelectedCategories(categoryIds);
              } else {
                setSelectedCategories(article.categories);
              }
            }
          }

          // Set topics
          if (article.topics && Array.isArray(article.topics)) {
            if (article.topics.length > 0) {
              if (typeof article.topics[0] === 'object') {
                const topicNames = article.topics.map((t: any) => t.topic?.name || t.name || "").filter(Boolean);
                setTopics(topicNames);
              } else if (typeof article.topics[0] === 'string') {
                setTopics(article.topics);
              }
            }
          }

          // Set image
          if (article.media) {
            const mediaPath = article.media.path || article.media.url || "";
            const mediaUrl = mediaPath ? mediaApi.getFileUrl(mediaPath) : "";
            const mediaName = article.media.name || "";
            const extension = mediaName.split(".").pop()?.toLowerCase() || "jpg";

            setSelectedImage({
              id: article.media.id || "",
              name: mediaName,
              url: mediaUrl,
              extension: extension,
            });
          }

          // Set scheduled date/time
          if (article.scheduled_at) {
            const scheduledDateTime = new Date(article.scheduled_at);
            setScheduledDate(scheduledDateTime.toISOString().split('T')[0]);
            setScheduledTime(scheduledDateTime.toTimeString().slice(0, 5));
            setPublishMethod("scheduled");
          }

          // Set editor content
          setTimeout(() => {
            if (editorRef.current && article.body) {
              editorRef.current.innerHTML = article.body;
            }
          }, 100);
        } catch (error) {
          console.error("Error fetching article:", error);
          showToast("Failed to fetch article data", "destructive");
        } finally {
          setIsFetchingArticle(false);
        }
      };
      fetchArticle();
    }
  }, [articleId]);

  const showToast = (
    title: string,
    variant: "success" | "destructive" | "default" = "success",
  ) => {
    setToastProps({ title, variant });
  };

  const handleImageSelect = (mediaItem: MediaItem) => {
    setSelectedImage(mediaItem);
    setShowMediaPopup(false);
    setErrors(prev => ({ ...prev, image: false }));
    showToast("Image successfully added");
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleAddTopic = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
    }

    if (topicInput.trim()) {
      if (!topics.includes(topicInput.trim())) {
        setTopics([...topics, topicInput.trim()]);
      }
      setTopicInput("");
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter((topic) => topic !== topicToRemove));
  };

  const handleCategoryChange = (categories: { id: string; label: string; checked: boolean }[]) => {
    const checkedIds = categories
      .filter((c) => c.checked)
      .map((c) => parseInt(c.id));
    setSelectedCategories(checkedIds);
  };

  const validateForm = () => {
    const newErrors = {
      image: !selectedImage,
      imageCaption: !imageCaption.trim(),
      title: !title.trim(),
      subHeading: !subHeading.trim(),
      category: selectedCategories.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      showToast("Please fill in all required fields", "destructive");
      return;
    }

    setIsLoading(true);
    try {
      const articleBody = editorRef.current?.innerHTML || content;

      const isScheduled = publishMethod === "scheduled";
      const scheduledAt = isScheduled && scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
        : null;

      const request: NewsRequest = {
        title: title.trim(),
        sub_heading: subHeading.trim(),
        set_headline: isHeadline,
        media_id: selectedImage?.id || "",
        image_caption: imageCaption.trim(),
        body: articleBody,
        status: (isScheduled && scheduledAt) ? "draft" : "published",
        categories: selectedCategories,
        topics: [],
        scheduled_at: (isScheduled && scheduledAt) ? scheduledAt : null,
      };

      await newsApi.updateNews(articleId, request);
      showToast("Article updated successfully!");
      setTimeout(() => navigate("/editor"), 1500);
    } catch (error) {
      console.error("Error publishing article:", error);
      showToast("Failed to update article", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) {
      showToast("Please fill in all required fields", "destructive");
      return;
    }

    setIsLoading(true);
    try {
      const articleBody = editorRef.current?.innerHTML || content;

      const request: NewsRequest = {
        title: title.trim() || "Untitled Draft",
        sub_heading: subHeading.trim(),
        set_headline: isHeadline,
        media_id: selectedImage?.id || "",
        image_caption: imageCaption.trim(),
        body: articleBody,
        status: "draft",
        categories: selectedCategories,
        topics: [],
        scheduled_at: null,
      };

      await newsApi.updateNews(articleId, request);
      showToast("Draft updated successfully!");
      setTimeout(() => navigate("/editor"), 1500);
    } catch (error) {
      console.error("Error saving draft:", error);
      showToast("Failed to save draft", "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackFromPreview = () => {
    setShowPreview(false);
  };

  const getPreviewData = () => {
    return {
      title,
      caption: imageCaption,
      topics,
      articleContent: editorRef.current?.innerHTML || content,
      image: selectedImage?.url || null,
    };
  };

  const handleCancel = () => {
    navigate("/editor");
  };

  return {
    states: {
      title,
      subHeading,
      imageCaption,
      content,
      errors,
      selectedCategories,
      topics,
      topicInput,
      selectedImage,
      isHeadline,
      showMediaPopup,
      showPreview,
      isLoading,
      toastProps,
      publishMethod,
      scheduledDate,
      scheduledTime,
      isFetchingArticle,
    },
    refs: {
      editorRef,
    },
    setters: {
      setTitle,
      setSubHeading,
      setImageCaption,
      setContent,
      setTopicInput,
      setIsHeadline,
      setShowMediaPopup,
      setPublishMethod,
      setScheduledDate,
      setScheduledTime,
    },
    handlers: {
      handleImageSelect,
      handleRemoveImage,
      handleAddTopic,
      handleRemoveTopic,
      handleCategoryChange,
      handlePublish,
      handleSaveDraft,
      handlePreview,
      handleBackFromPreview,
      getPreviewData,
      handleCancel,
      clearFieldError,
    }
  };
};
