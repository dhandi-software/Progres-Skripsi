import { ArrowRight } from "lucide-react";
import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

interface VideoSidebarDesktopProps {
  videos?: VideoListItem[];
}

export function VideoSidebarDesktop({ videos = [] }: VideoSidebarDesktopProps) {
  return (
    <aside className="w-[22rem] flex flex-col gap-6">
      {/* Advertisement */}
      <div className="w-full h-[26.188rem] rounded-md bg-destructive-foreground grid place-items-center">
        <span className="text-paragraph text-[rgba(0,0,0,0.2)]">
          Advertisement
        </span>
      </div>

      {/* Video Section Header */}
      <div className="w-full pb-4 border-b border-subtle">
        <div className="group inline-flex items-center gap-sm h-7">
          <h3 className="text-subheading-h5 text-[#D94F24]">
            Video
          </h3>
          <ArrowRight className="w-5 h-5 text-[#D94F24] transition-transform duration-150 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Dynamic Video Cards Grid */}
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          {videos.slice(0, 4).map((video) => (
            <VideoNewsCard
              key={video.id}
              className="w-full h-full"
              videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
              title={video.title}
              timeText={getRelativeTime(video.created_at || "")}
            />
          ))}
        </div>

        {videos[4] && (
          <div className="w-full h-fit">
            <VideoNewsCard
              className="w-full h-fit"
              videoSrc={`https://www.youtube.com/embed/${videos[4].yt_video_id}`}
              title={videos[4].title}
              timeText={getRelativeTime(videos[4].created_at || "")}
            />
          </div>
        )}
      </div>

      {/* Advertisement */}
      <div className="w-full h-[26.188rem] rounded-md bg-destructive-foreground grid place-items-center">
        <span className="text-paragraph text-[rgba(0,0,0,0.2)]">
          Advertisement
        </span>
      </div>
    </aside>
  );
}
