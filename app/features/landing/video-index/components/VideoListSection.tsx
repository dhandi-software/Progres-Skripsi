"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import VideoNewsCard from "~/components/ui/Vidieonews";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useVideoIndex } from "../pages/useVideoIndex";
import { getRelativeTime } from "~/lib/timeUtils";

export function VideoListSection() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  // Pass filters to useVideoIndex. 
  // We haven't updated useVideoIndex to accept filters in the hook call arguments yet 
  // but we updated it to return setFilters.
  // Wait, I updated useVideoIndex to Accept initialLimit, and Return setFilters.
  // But I didn't verify if useVideoIndex actually uses the filters state in fetching.
  // Yes, Step 311 showed I added `filters` state and used it in `fetchVideos`.

  const { videos, loading, error, pagination, setPage, setFilters } = useVideoIndex(10);

  const day = date ? format(date, "dd") : "DD";
  const month = date ? format(date, "MMMM") : "Month";
  const year = date ? format(date, "yyyy") : "YYYY";

  const handleSearch = () => {
    const timestamp = date ? Math.floor(date.getTime() / 1000) : undefined;
    setFilters({
      date: timestamp,
    });
    setPage(1);
  };

  if (loading && videos.length === 0) {
    return (
      <div className="max-w-[60rem] mx-auto">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!loading && !error && videos.length === 0) {
    return (
      <div className="max-w-[60rem] mx-auto text-center py-10">
        <div className="text-muted-foreground">No videos found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-[60rem] mx-auto flex flex-col gap-[2rem]">
      <div className="flex gap-[2rem] items-end">
        <div className="flex flex-col gap-[0.25rem]">
          <h2 className="text-paragraph-sm">Filter by Date</h2>
          <Popover>
            <PopoverTrigger
              asChild
              variant="ghost"
              className="!p-0"
            >
              <div className="flex items-center gap-2 justify-between">
                <div className="w-[2.06rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm">
                  {day}
                </div>
                <div className="w-[7.81rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-label">
                  {month}
                </div>
                <div className="w-[2.75rem] h-[2.25rem] flex items-center justify-center rounded-sm border border-border-subtle bg-background px-[0.25rem] text-sm ring-offset-background">
                  {year}
                </div>
                <CalendarIcon />
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          size="md"
          onClick={handleSearch}
          className="bg-[#D94F24] text-white h-[2.25rem] px-[1rem]"
        >
          <span className="text-label-sm">Search</span>
        </Button>
      </div>

      {error && <div className="text-destructive">{error}</div>}

      <div className="flex flex-col gap-4">
        {videos.map((video) => (
          <VideoNewsCard
            key={video.id}
            title={video.title}
            videoSrc={`https://www.youtube.com/watch?v=${video.yt_video_id}`}
            timeText={getRelativeTime(video.created_at)}
            flow="horizontal"
            imageSize={{ width: "8.125rem", height: "7.5rem" }}
            className="flex-row"
          />
        ))}
      </div>

      {/* === PAGINATION === */}
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
  );
}
