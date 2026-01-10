import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { newsApi } from "~/api/news";
import { mediaApi } from "~/api/mediaApi";
import type { NewsRequest } from "~/api/types";
import type { MediaItem } from "../media/MediaContext";

interface UseCreateArticleOptions {
    articleId?: string;
}

export const useCreateArticle = (options: UseCreateArticleOptions = {}) => {
    const { articleId } = options;
    const navigate = useNavigate();
    const isEditMode = Boolean(articleId);

    const [title, setTitle] = useState("");
    const [subHeading, setSubHeading] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [content, setContent] = useState("Write an article here...");
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [topicInput, setTopicInput] = useState("");
    const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
    const [isHeadline, setIsHeadline] = useState(false);
    const [publishMethod, setPublishMethod] = useState<"now" | "scheduled">(
        "now",
    );
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [isFetchingArticle, setIsFetchingArticle] = useState(false);

    // UI States
    const [showMediaPopup, setShowMediaPopup] = useState(false);
    const [showAdvertisementPopup, setShowAdvertisementPopup] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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

    // Fetch article data for edit mode
    useEffect(() => {
        if (articleId && isEditMode) {
            const fetchArticle = async () => {
                setIsFetchingArticle(true);
                try {
                    const response = await newsApi.getNewsById(articleId);
                    const article: any = response.data || response;

                    // Debug: Log the full article response
                    console.log("=== EDIT ARTICLE DEBUG ===");
                    console.log("Full article object:", article);
                    console.log("article.media:", article.media);
                    console.log("article.categories:", article.categories);
                    console.log("article.topics:", article.topics);
                    console.log("article.set_headline:", article.set_headline);
                    console.log("=========================");

                    // Populate form fields
                    setTitle(article.title || "");
                    setSubHeading(article.sub_heading || "");
                    setImageCaption(article.image_caption || "");
                    setContent(article.body || "");

                    // Set headline - check both snake_case and camelCase
                    setIsHeadline(
                        article.set_headline === true ||
                            article.setHeadline === true,
                    );

                    // Set categories - handle both array of numbers and array of objects
                    if (
                        article.categories &&
                        Array.isArray(article.categories)
                    ) {
                        if (article.categories.length > 0) {
                            if (typeof article.categories[0] === "object") {
                                // If categories is array of objects with id or category.id
                                const categoryIds = article.categories
                                    .map((c: any) => {
                                        if (c.category?.id)
                                            return c.category.id;
                                        if (c.id) return c.id;
                                        return null;
                                    })
                                    .filter((id: any) => id !== null);
                                console.log(
                                    "Mapped category IDs:",
                                    categoryIds,
                                );
                                setSelectedCategories(categoryIds);
                            } else {
                                // Already array of numbers
                                setSelectedCategories(article.categories);
                            }
                        }
                    }

                    // Set topics
                    if (article.topics && Array.isArray(article.topics)) {
                        if (article.topics.length > 0) {
                            if (typeof article.topics[0] === "object") {
                                const topicNames = article.topics
                                    .map(
                                        (t: any) =>
                                            t.topic?.name || t.name || "",
                                    )
                                    .filter(Boolean);
                                console.log("Mapped topic names:", topicNames);
                                setTopics(topicNames);
                            } else if (typeof article.topics[0] === "string") {
                                setTopics(article.topics);
                            }
                        }
                    }

                    // Set image if media exists in response
                    if (article.media) {
                        const mediaPath =
                            article.media.path || article.media.url || "";
                        // Use mediaApi.getFileUrl to properly build the URL (extracts filename from path)
                        const mediaUrl = mediaPath
                            ? mediaApi.getFileUrl(mediaPath)
                            : "";

                        const mediaName = article.media.name || "";
                        const extension =
                            mediaName.split(".").pop()?.toLowerCase() || "jpg";

                        console.log("Setting selected image:", {
                            id: article.media.id,
                            name: mediaName,
                            url: mediaUrl,
                        });

                        setSelectedImage({
                            id: article.media.id || "",
                            name: mediaName,
                            url: mediaUrl,
                            extension: extension,
                        });
                    }

                    // Set scheduled date/time if scheduled
                    if (article.scheduled_at) {
                        const scheduledDateTime = new Date(
                            article.scheduled_at,
                        );
                        setScheduledDate(
                            scheduledDateTime.toISOString().split("T")[0],
                        );
                        setScheduledTime(
                            scheduledDateTime.toTimeString().slice(0, 5),
                        );
                        setPublishMethod("scheduled");
                    }

                    // Set editor content after a small delay
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
    }, [articleId, isEditMode]);

    // Check if there are any unsaved changes
    const hasUnsavedChanges = () => {
        return (
            title.trim() !== "" ||
            subHeading.trim() !== "" ||
            imageCaption.trim() !== "" ||
            (content !== "Write an article here..." && content.trim() !== "") ||
            selectedCategories.length > 0 ||
            topics.length > 0 ||
            selectedImage !== null
        );
    };

    // Warn user before leaving page with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                // Chrome requires returnValue to be set
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [
        title,
        subHeading,
        imageCaption,
        content,
        selectedCategories,
        topics,
        selectedImage,
    ]);

    const showToast = (
        title: string,
        variant: "success" | "destructive" | "default" = "success",
    ) => {
        setToastProps({ title, variant });
    };

    const handleImageSelect = (mediaItem: MediaItem) => {
        setSelectedImage(mediaItem);
        setShowMediaPopup(false);
        setErrors((prev) => ({ ...prev, image: false }));
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

    const handleCategoryChange = (
        categories: { id: string; label: string; checked: boolean }[],
    ) => {
        const checkedIds = categories
            .filter((c) => c.checked)
            .map((c) => parseInt(c.id));
        setSelectedCategories(checkedIds);
    };

    const validateForm = () => {
        // In edit mode, image validation is less strict if we already have image from server
        const newErrors = {
            image: !selectedImage && !isEditMode,
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
            setErrors((prev) => ({ ...prev, [field]: false }));
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
            let scheduledAt = null;

            // Konversi scheduledDate dan scheduledTime ke format ISO dengan Z
            if (isScheduled && scheduledDate && scheduledTime) {
                // Format: "2025-12-23T13:00:00Z"
                scheduledAt = `${scheduledDate}T${scheduledTime}:00Z`;
            }

            const request: NewsRequest = {
                title: title.trim(),
                sub_heading: subHeading.trim(),
                set_headline: isHeadline,
                media_id: selectedImage?.id || "",
                image_caption: imageCaption.trim(),
                body: articleBody,
                status: isScheduled && scheduledAt ? "draft" : "published",
                categories: selectedCategories,
                topics: [],
                scheduled_at: isScheduled && scheduledAt ? scheduledAt : null,
            };

            if (isEditMode && articleId) {
                await newsApi.updateNews(articleId, request);
                showToast("Article updated successfully!");
            } else {
                await newsApi.createNews(request);
                showToast("Article published successfully!");
            }
            setTimeout(() => navigate("/admin/article"), 1500);
        } catch (error) {
            console.error("Error publishing article:", error);
            showToast("Failed to publish article", "destructive");
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

            if (isEditMode && articleId) {
                await newsApi.updateNews(articleId, request);
                showToast("Draft updated successfully!");
            } else {
                await newsApi.createNews(request);
                showToast("Draft saved successfully!");
            }
            setTimeout(() => navigate("/admin/draft"), 1500);
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
        navigate("/admin/article");
    };

    const handleDeleteArticle = async () => {
        if (!articleId) return;

        setIsDeleting(true);
        try {
            await newsApi.deleteNews(articleId);
            // Set success flag in localStorage for toast on draft page
            localStorage.setItem("draftDeleteSuccess", "true");
            navigate("/admin/draft");
        } catch (error) {
            console.error("Error deleting article:", error);
            showToast("Failed to delete article", "destructive");
            setIsDeleting(false);
        }
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
            showAdvertisementPopup,
            showPreview,
            isLoading,
            toastProps,
            publishMethod,
            scheduledDate,
            scheduledTime,
            isEditMode,
            isFetchingArticle,
            showDeletePopup,
            isDeleting,
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
            setShowAdvertisementPopup,
            setPublishMethod,
            setScheduledDate,
            setScheduledTime,
            setShowDeletePopup,
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
            handleDeleteArticle,
        },
    };
};
