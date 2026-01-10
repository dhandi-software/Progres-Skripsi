import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import TabsCard from "~/components/ui/tab-card";
import StatusCard from "~/components/ui/StatusCard";
import { newsApi } from "~/api/news";
import { videoApi } from "~/api/video";
import { mediaApi } from "~/api/mediaApi";
import { formatDisplayDate } from "~/lib/timeUtils";
import type { NewsListItem, VideoListItem } from "~/api/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ArticlesDesktop() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");
    const [articles, setArticles] = useState<NewsListItem[]>([]);
    const [videos, setVideos] = useState<VideoListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8;

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (activeTab === "video") {
                    // Fetch Videos
                    const response = await videoApi.getVideoIndex({
                        limit: itemsPerPage,
                        page: currentPage,
                    });
                    const videoData = response.data?.rows || [];
                    const apiTotalPages = response.data?.total_pages || 1;

                    setVideos(videoData);
                    setTotalPages(apiTotalPages);
                    setArticles([]);
                } else {
                    const queryParams: import("~/api/types").NewsQuery = {
                        limit: itemsPerPage,
                        page: currentPage,
                        order: "desc",
                    };

                    if (activeTab === "published") queryParams.status = "published";
                    if (activeTab === "scheduled") queryParams.status = "scheduled";

                    const response = await newsApi.getNews(queryParams);

                    const newsData = response.data?.rows || [];
                    const apiTotalPages = response.data?.total_pages || 1;

                    setArticles(newsData);
                    setTotalPages(apiTotalPages);
                    setVideos([]);
                }
            } catch (err) {
                setError("Failed to fetch data");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, currentPage]); // Re-fetch on tab or page change

    // Filter Logic (Client-Side) - Only for videos now
    const filteredItems = activeTab === "video" ? videos : articles;

    // We do NOT paginate 'filteredItems' again because we likely fetched a page.
    // Dashboard does: `const paginatedArticles = filteredArticles.slice(...)` on the ALREADY paginated/limited filtered results?
    // Dashboard: 
    // const response = await newsApi.getNews({ limit: itemsPerPage... }) -> returns 8 items.
    // setArticles(8 items)
    // const filtered = articles.filter(...)
    // const paginated = filtered.slice(startIndex, ...) -> This slices the 8 items?
    // Start index uses `currentPage`. If currentPage is 2, startIndex is 8.
    // If we only fetched 8 items (rows), then slice(8, 16) is EMPTY.
    // THIS IS A CRITICAL BUG IN DASHBOARD DESKTOP.
    // If I "contek" (copy) it, I break the page.
    // BUT the user said "contek designnya from ... DashboardDesktop.tsx". "Design" usually implies UI/Visuals.
    // I should fix the logic.
    // Correct Logic: 
    // 1. Fetch data for the specific PAGE.
    // 2. Display that data.
    // 3. Do NOT slice client-side if server already paginated.

    // I will display `filteredItems` directly.

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setCurrentPage(1);
    };

    const handleEdit = (id: string, type: "news" | "video") => {
        if (type === "news") {
            navigate(`/admin/edit/${id}`);
        } else {
            // TODO: Handle video edit navigation when video edit page is implemented
            console.info(`Edit video:`, id);
        }
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
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

    return (
        <div className="w-full min-h-screen px-6 py-6 bg-white">
            {/* Header Section */}
            <div className="w-full h-fit flex flex-col gap-3 mb-8">
                <h1 className="w-full text-subheading-h2 text-foreground">
                    Article
                </h1>
                <p className="w-full text-label text-black/60">
                    Manage all your articles in one place.
                </p>
            </div>

            {/* Tabs Section */}
            <div className="mb-8">
                <TabsCard
                    tabs={[
                        { id: "all", label: "All Articles" },
                        { id: "published", label: "Published" },
                        { id: "scheduled", label: "Scheduled" },
                        { id: "video", label: "Video" },
                    ]}
                    defaultActiveTab="all"
                    onTabChange={handleTabChange}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="w-full h-48 flex items-center justify-center">
                    <p className="text-paragraph text-muted-foreground">
                        Loading...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="w-full h-48 flex items-center justify-center">
                    <p className="text-paragraph text-red-500">{error}</p>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && (
                <>
                    <div className="w-full">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-4 gap-6">
                                {activeTab === "video" ? (
                                    // Video Items
                                    (filteredItems as VideoListItem[]).map((video) => (
                                        <div key={video.id} className="flex flex-col h-full">
                                            <StatusCard
                                                title={video.title}
                                                status="published" // Videos effectively published
                                                hidePublishedLabel={true} // Clean look for videos
                                                isVideo={true}
                                                views={"0"} // API doesn't provide views yet
                                                timeText={video.created_at ? new Date(video.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                }) : "-"}
                                                imageSrc={`https://img.youtube.com/vi/${video.yt_video_id}/mqdefault.jpg`}
                                                onEdit={() => handleEdit(video.id.toString(), "video")}
                                                className="w-full h-full"
                                                lineClamp={4}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    // News Items
                                    (filteredItems as NewsListItem[]).map((article) => (
                                        <div key={article.id} className="flex flex-col h-full">
                                            <StatusCard
                                                status={article.status || "draft"}
                                                views={article.analytic?.count?.toString() || "0"}
                                                timeText={formatDisplayDate(article.created_at)}
                                                imageSrc={article.media?.path ? mediaApi.getFileUrl(article.media.path) : ""}
                                                onEdit={() => handleEdit(article.id, "news")}
                                                hidePublishedLabel={activeTab === "published"} // Hide if in specific tab
                                                title={article.title}
                                                className="w-full h-full"
                                                lineClamp={4}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-48 flex items-center justify-center">
                                <p className="text-paragraph text-muted-foreground">
                                    No {activeTab === "all" ? "" : activeTab} items found.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredItems.length > 0 && totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`px-4 py-2 rounded-md border transition-colors ${currentPage === page
                                        ? "bg-primary text-white border-primary"
                                        : "border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
