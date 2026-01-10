import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";

interface ArticleVideoSectionMobileProps {
  videos: VideoListItem[];
  loading?: boolean;
  error?: string;
}

export function ArticleVideoSectionMobile({
  videos,
  loading,
  error,
}: ArticleVideoSectionMobileProps) {
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-bold text-[#D94F24]">Video</h2>
        <div className="text-muted-foreground">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-bold text-[#D94F24]">Video</h2>
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const featured = videos[0];
  const grid1 = videos.slice(1, 3);
  const grid2 = videos.slice(3, 5);

  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <h2 className="text-lg font-bold text-[#D94F24]">Video</h2>

      {featured && (
        <VideoNewsCard
          videoSrc={`https://www.youtube.com/embed/${featured.yt_video_id}`}
          title={featured.title}
          flow="vertical"
          boldTitle={true}
          lineClamp={2}
        />
      )}

      {grid1.length > 0 && (
        <div className="w-full flex gap-3">
          {grid1.map((video) => (
            <VideoNewsCard
              key={video.id}
              videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
              title={video.title}
              flow="vertical"
              boldTitle={true}
              lineClamp={2}
            />
          ))}
        </div>
      )}

      {grid2.length > 0 && (
        <div className="w-full flex gap-3">
          {grid2.map((video) => (
            <VideoNewsCard
              key={video.id}
              videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
              title={video.title}
              flow="vertical"
              boldTitle={true}
              lineClamp={2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
