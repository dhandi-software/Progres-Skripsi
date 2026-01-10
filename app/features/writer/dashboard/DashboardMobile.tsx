import { useDashboard } from "./UseDashboard";
import { Search, Menu, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";
import { mediaApi } from "~/api/mediaApi";
import { formatDisplayDate } from "~/lib/timeUtils";
import type { NewsListItem, VideoListItem } from "~/api/types";
import StatusCard from "~/components/ui/StatusCard";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState } from "react";

export default function DashboardMobile() {
    const { setOpenMobile } = useSidebar();
    const {
        activeTab: logicTab,
        setActiveTab: setLogicTab,
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

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Map logic values back to display labels for Mobile dropdown
    const getDisplayLabel = (value: string) => {
        switch (value) {
            case "all": return "All Articles";
            case "published": return "Published";
            case "scheduled": return "Scheduled";
            case "video": return "Video";
            default: return "All Articles";
        }
    };

    const activeDisplayLabel = getDisplayLabel(logicTab);

    return (
        <div className="w-full min-h-screen bg-white lowercase-pagination">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-[1rem] py-[1rem] flex flex-col gap-[1rem]">
                <div className="flex items-center gap-[0.75rem]">
                    <button
                        onClick={() => setOpenMobile(true)}
                        className="p-[0.25rem] -ml-[0.25rem]"
                    >
                        <Menu className="w-[1.5rem] h-[1.5rem] text-gray-900" />
                    </button>
                    <h1 className="text-[1.125rem] font-bold text-gray-900">Dashboard</h1>
                </div>

                {/* Dropdown Filter */}
                <div className="w-full">
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <div
                                className="w-full bg-white border border-[#E5E5E5] rounded-[0.5rem] px-[0.75rem] py-[0.5rem] flex items-center justify-between shadow-[0rem_0.0625rem_0.125rem_0rem_rgba(0,0,0,0.05)] cursor-pointer"
                            >
                                <div className="flex flex-col gap-[0.125rem]">
                                    <span className="text-[0.875rem] font-medium text-[#737373]">
                                        {activeDisplayLabel === "All Articles" ? "Select Category" : activeDisplayLabel}
                                    </span>
                                </div>
                                <ChevronsUpDown className="w-[1rem] h-[1rem] text-[#737373]" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[calc(100vw-2rem)] bg-white border border-[#E5E5E5] rounded-[0.5rem] shadow-[0rem_0.125rem_0.25rem_-0.125rem_rgba(0,0,0,0.1),0rem_0.25rem_0.375rem_-0.0625rem_rgba(0,0,0,0.1)] p-[0.5rem] gap-[0.5rem] flex flex-col"
                            align="center"
                            sideOffset={4}
                        >
                            {[
                                { label: "All Articles", val: "all" },
                                { label: "Published", val: "published" },
                                { label: "Scheduled", val: "scheduled" },
                                { label: "Video", val: "video" }
                            ].map((option) => (
                                <DropdownMenuItem
                                    key={option.val}
                                    onClick={() => {
                                        setLogicTab(option.val);
                                    }}
                                    className={`text-[0.875rem] py-[0.375rem] px-[0.5rem] rounded-[0.375rem] cursor-pointer ${logicTab === option.val
                                        ? "bg-[#0000000D] text-[#0A0A0A]"
                                        : "text-[#0A0A0A] hover:bg-gray-100"
                                        }`}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* List */}
            <div className="p-[1rem] flex flex-col gap-[1rem]">
                {loading ? (
                    <div className="w-full h-[8rem] flex items-center justify-center text-[0.875rem] text-gray-500">Loading...</div>
                ) : error ? (
                    <div className="w-full h-[8rem] flex items-center justify-center text-[0.875rem] text-red-500">{error}</div>
                ) : filteredItems.length === 0 ? (
                    <div className="w-full h-[8rem] flex items-center justify-center text-[0.875rem] text-gray-500">No items found.</div>
                ) : (
                    <>
                        {logicTab === "video" ? (
                            (filteredItems as VideoListItem[]).map((video) => (
                                <StatusCard
                                    key={video.id}
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
                                    className="w-full bg-white border border-[#E5E5E5] shadow-sm"
                                    lineClamp={2}
                                />
                            ))
                        ) : (
                            (filteredItems as NewsListItem[]).map((article) => (
                                <StatusCard
                                    key={article.id}
                                    status={article.status || "draft"}
                                    views={article.analytic?.count?.toString() || "0"}
                                    timeText={formatDisplayDate(article.created_at)}
                                    imageSrc={article.media?.path ? mediaApi.getFileUrl(article.media.path) : ""}
                                    onEdit={() => handleEdit(article.id, "news")}
                                    hidePublishedLabel={logicTab === "published"}
                                    title={article.title}
                                    className="w-full bg-white border border-[#E5E5E5] shadow-sm"
                                    lineClamp={2}
                                />
                            ))
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {!loading && !error && filteredItems.length > 0 && totalPages > 1 && (
                <div className="mt-[2rem] flex items-center justify-center gap-[0.5rem] pb-[2.5rem] px-[1rem]">
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
                                ? "bg-primary text-white border-primary focus:outline-none"
                                : "border-gray-300 hover:bg-gray-50 bg-white"
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
        </div>
    );
}
