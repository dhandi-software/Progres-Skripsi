import { FilteringVideoSectionMobile } from "~/features/landing/video-index/components/mobile/FilteringVideoSectionMobile";
import VideoNewsCard from "~/components/ui/Vidieonews";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { useVideoIndex } from "./useVideoIndex";
import { getRelativeTime } from "~/lib/timeUtils";

export function VideoIndexMobile() {
  const { videos, loading, error, pagination, setPage, setFilters } = useVideoIndex(10);

  const handleSearch = (filters: { date?: number }) => {
    setFilters({
      date: filters.date,
    });
    setPage(1);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex flex-col gap-6 pb-8 px-4 pt-4">
        <FilteringVideoSectionMobile onSearch={handleSearch} />
        <div className="text-muted-foreground body-paragraph-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 pb-8 px-4 pt-4">
        {/* Filtering Section */}
        <FilteringVideoSectionMobile onSearch={handleSearch} />

        {!loading && !error && videos.length === 0 && (
          <div className="text-muted-foreground body-paragraph-sm text-center py-8">No videos found.</div>
        )}

        {error && <div className="text-destructive body-paragraph-sm">{error}</div>}

        {/* Video List */}
        <div className="flex flex-col gap-4">
          {videos.map((video) => (
            <VideoNewsCard
              key={video.id}
              title={video.title}
              videoSrc={`https://www.youtube.com/watch?v=${video.yt_video_id}`}
              timeText={getRelativeTime(video.created_at)}
              flow="horizontal"
              imageSize={{ width: "8.125rem", height: "7.5rem" }}
            />
          ))}
        </div>

        {/* Pagination */}
        <Pagination>
          <PaginationContent className="justify-center">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage(pagination.currentPage - 1)}
                className={`cursor-pointer ${pagination.currentPage === 1
                  ? "opacity-50 pointer-events-none"
                  : ""
                  }`}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const active = pagination.currentPage === pageNum;
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={active}
                    onClick={() => setPage(pageNum)}
                    className={`cursor-pointer w-[2.56rem] h-[2.25rem] flex items-center justify-center !text-white bg-brand-primary-muted-foreground`}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setPage(pagination.currentPage + 1)}
                className={`cursor-pointer ${pagination.currentPage === pagination.totalPages
                  ? "opacity-50 pointer-events-none"
                  : ""
                  }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

