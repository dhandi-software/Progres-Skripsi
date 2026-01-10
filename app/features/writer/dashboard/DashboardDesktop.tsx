import { useDashboard } from "./UseDashboard";
import TabsCard from "~/components/ui/tab-card";
import StatusCard from "~/components/ui/StatusCard";
import { mediaApi } from "~/api/mediaApi";
import { formatDisplayDate } from "~/lib/timeUtils";
import type { NewsListItem, VideoListItem } from "~/api/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardDesktop() {
    const {
        activeTab,
        setActiveTab,
        loading,
        error,
        currentPage,
        totalPages,
        handleEdit,
        handlePrevPage,
        handleNextPage,
        handlePageClick,
        getPageNumbers,
        filteredItems,
    } = useDashboard(8);

    return (
        <div className="w-full min-h-screen px-[1.5rem] py-[1.5rem] bg-white">
            {/* Header Section */}
            <div className="w-full h-fit flex flex-col gap-[0.75rem] mb-[2rem]">
                <h1 className="w-full text-subheading-h2 text-foreground">
                    Dashboard
                </h1>
                <p className="w-full text-label text-black/60">
                    Manage all your articles in one place.
                </p>
            </div>

            {/* Tabs Section */}
            <div className="mb-[2rem]">
                <TabsCard
                    tabs={[
                        { id: "all", label: "All Articles" },
                        { id: "published", label: "Published" },
                        { id: "scheduled", label: "Scheduled" },
                        { id: "video", label: "Video" },
                    ]}
                    defaultActiveTab="all"
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="w-full h-[12rem] flex items-center justify-center">
                    <p className="text-paragraph text-muted-foreground">
                        Loading...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="w-full h-[12rem] flex items-center justify-center">
                    <p className="text-paragraph text-red-500">{error}</p>
                </div>
            )}

            {/* Grid */}
            {!loading && !error && (
                <>
                    <div className="w-full">
                        {filteredItems.length > 0 ? (
                            <div className="grid grid-cols-4 gap-[1.5rem]">
                                {activeTab === "video" ? (
                                    (filteredItems as VideoListItem[]).map((video) => (
                                        <div key={video.id} className="flex flex-col h-full">
                                            <StatusCard
                                                title={video.title}
                                                status="published"
                                                hidePublishedLabel={true}
                                                isVideo={true}
                                                views={"0"}
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
                                    (filteredItems as NewsListItem[]).map((article) => (
                                        <div key={article.id} className="flex flex-col h-full">
                                            <StatusCard
                                                status={article.status || "draft"}
                                                views={article.analytic?.count?.toString() || "0"}
                                                timeText={formatDisplayDate(article.created_at)}
                                                imageSrc={article.media?.path ? mediaApi.getFileUrl(article.media.path) : ""}
                                                onEdit={() => handleEdit(article.id, "news")}
                                                hidePublishedLabel={activeTab === "published"}
                                                title={article.title}
                                                className="w-full h-full"
                                                lineClamp={4}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-[12rem] flex items-center justify-center">
                                <p className="text-paragraph text-muted-foreground">
                                    No {activeTab === "all" ? "" : activeTab} items found.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {filteredItems.length > 0 && totalPages > 1 && (
                        <div className="mt-[2rem] flex items-center justify-center gap-[0.5rem]">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-[0.75rem] py-[0.5rem] rounded-[0.375rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft className="w-[1.25rem] h-[1.25rem]" />
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageClick(page)}
                                    className={`px-[1rem] py-[0.5rem] rounded-[0.375rem] border transition-colors ${currentPage === page
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
                                className="px-[0.75rem] py-[0.5rem] rounded-[0.375rem] border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight className="w-[1.25rem] h-[1.25rem]" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
