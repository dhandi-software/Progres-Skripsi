import { ArrowRight } from "lucide-react";
import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem, AdvertisementResponse } from "~/api/types";
import { AdvertisementDesktop } from "~/components/ui/AdvertisementDesktop";

interface ArticleSidebarDesktopProps {
  videos: VideoListItem[];
  ads?: AdvertisementResponse[];
  loading?: boolean;
  error?: string;
}

export function ArticleSidebarDesktop({
  videos,
  ads,
  loading,
  error,
}: ArticleSidebarDesktopProps) {
  const safeAds = ads || [];

  if (loading) {
    return (
      <aside className="w-[352px] flex flex-col gap-6">
        <AdvertisementDesktop ad={safeAds[0]} />
        <div className="text-muted-foreground">Loading videos...</div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-[352px] flex flex-col gap-6">
        <AdvertisementDesktop ad={safeAds[0]} />
        <div className="text-destructive">{error}</div>
      </aside>
    );
  }

  return (
    <aside className="w-[352px] flex flex-col gap-6">
      {/* Advertisement */}
      <AdvertisementDesktop ad={safeAds[0]} />

      <div className="w-full flex flex-col gap-4">
        <div className="w-full pb-4 border-b border-subtle">
          <div className="group inline-flex items-center gap-sm h-7">
            <h3 className="text-subheading-h5 text-[#D94F24]">Video</h3>
            <ArrowRight className="w-5 h-5 text-[#D94F24] transition-transform duration-150 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Video List */}
        <div className="w-full flex flex-col gap-4">
          {videos.slice(0, 5).map((video) => (
            <VideoNewsCard
              key={video.id}
              videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
              title={video.title}
              className="w-full"
              imageSize={{ width: "100%", height: "12rem" }}
              flow="vertical"
              lineClamp={2}
            />
          ))}
        </div>
      </div>

      {/* Bottom Advertisement */}
      <AdvertisementDesktop ad={safeAds[1]} />
    </aside>
  );
}
