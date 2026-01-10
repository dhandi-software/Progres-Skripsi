import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

interface VideoListSectionMobileProps {
  videos: VideoListItem[];
  title?: string;
}

export function VideoListSectionMobile({
  videos,
  title,
}: VideoListSectionMobileProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Optional Section Header */}
      {title && (
        <div className="flex items-center gap-1 pb-3 border-b border-[#e5e5e5]">
          <h2 className="text-lg font-semibold leading-7 text-[#D94F24] whitespace-nowrap">
            {title}
          </h2>
        </div>
      )}

      {/* Video Cards */}
      <div className="flex flex-col gap-6">
        {videos.map((video) => (
          <VideoNewsCard
            key={video.id}
            videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
            title={video.title}
            tagLabel="Video"
            duration="01:45"
            timeText={getRelativeTime(video.created_at || "")}
            lineClamp={2}
            flow="vertical"
            imageSize={{ width: "15.625rem", height: "7.3125rem" }}
          />
        ))}
      </div>
    </div>
  );
}
