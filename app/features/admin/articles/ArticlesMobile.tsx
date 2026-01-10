import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Menu, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";
import { newsApi } from "~/api/news";
import { videoApi } from "~/api/video";
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

export function ArticlesMobile() {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const [activeTab, setActiveTab] = useState("All Articles");
  const [articles, setArticles] = useState<NewsListItem[]>([]);
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Map display labels to logic values
  const getTabValue = (label: string) => {
    switch (label) {
      case "All Articles": return "all";
      case "Published": return "published";
      case "Scheduled": return "scheduled";
      case "Video": return "video";
      default: return "all";
    }
  };

  const tabValue = getTabValue(activeTab);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tabValue === "video") {
          const response = await videoApi.getVideoIndex({
            limit: itemsPerPage,
            page: currentPage,
            // search: searchQuery, // Assuming API supports search if needed
          });
          const videoData = response.data?.rows || [];
          const apiTotalPages = response.data?.total_pages || 1;

          setVideos(videoData);
          setTotalPages(apiTotalPages);
          setArticles([]);
        } else {
          // For generic news with status filtering
          const queryParams: import("~/api/types").NewsQuery = {
            limit: itemsPerPage,
            order: "desc",
            page: currentPage,
          };

          if (tabValue === "published") queryParams.status = "published";
          if (tabValue === "scheduled") queryParams.status = "scheduled";

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

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [tabValue, currentPage]);

  // Client-side filtering logic: Only for VIDEOS now. Articles are filtered on server.
  const filteredItems = tabValue === "video" ? videos : articles;

  const handleEdit = (id: string, type: "news" | "video") => {
    if (type === "news") {
      navigate(`/admin/edit/${id}`);
    } else {
      // TODO: Handle video edit navigation when video edit page is implemented
      console.info(`Edit video:`, id);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
    <div className="w-full min-h-screen bg-white lowercase-pagination">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1"
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Article</h1>
        </div>

        {/* Dropdown Filter (Figma Node 2013-47488 & 2013-47511) */}
        <div className="w-full">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <div
                className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2 flex items-center justify-between shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] cursor-pointer"
                data-node-id="2013-47488"
              >
                <div className="flex flex-col gap-[0.125rem]">
                  <span className="text-sm font-medium text-[#737373]">
                    {activeTab === "All Articles" ? "Select Category" : activeTab}
                  </span>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-[#737373]" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[calc(100vw-2rem)] bg-white border border-[#E5E5E5] rounded-lg shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1),0px_4px_6px_-1px_rgba(0,0,0,0.1)] p-2 gap-2 flex flex-col"
              align="center"
              sideOffset={4}
              data-node-id="2013-47511"
            >
              {["All Articles", "Published", "Scheduled", "Video"].map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => {
                    setActiveTab(option);
                    setCurrentPage(1);
                  }}
                  className={`text-sm py-1.5 px-2 rounded-md cursor-pointer ${activeTab === option
                    ? "bg-[#0000000D] text-[#0A0A0A]"
                    : "text-[#0A0A0A] hover:bg-gray-100"
                    }`}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      <div className="p-4 flex flex-col gap-4">
        {loading ? (
          <div className="w-full h-32 flex items-center justify-center text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="w-full h-32 flex items-center justify-center text-sm text-red-500">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="w-full h-32 flex items-center justify-center text-sm text-gray-500">No items found.</div>
        ) : (
          <>
            {tabValue === "video" ? (
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
                  hidePublishedLabel={tabValue === "published"}
                  title={article.title}
                  className="w-full bg-white border border-[#E5E5E5] shadow-sm"
                  lineClamp={2}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Pagination (Synced with Desktop) */}
      {!loading && !error && filteredItems.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 pb-10 px-4">
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
            className="px-3 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
