import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

interface VideoForYouSectionMobileProps {
  videos: VideoListItem[];
}

export function VideoForYouSectionMobile({
  videos,
}: VideoForYouSectionMobileProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-1 pb-3 border-b border-[#e5e5e5]">
        <h2 className="text-lg font-semibold leading-7 text-[#D94F24] whitespace-nowrap">
          For you
        </h2>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {videos.map((video) => (
          <div key={video.id} className="shrink-0 w-[85%]">
            <VideoNewsCard
              videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
              title={video.title}
              duration="01:45"
              timeText={getRelativeTime(video.created_at || "")}
              lineClamp={3}
              flow="vertical"
              imageSize={{ width: "15.625rem", height: "7.3125rem" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
