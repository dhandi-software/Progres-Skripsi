import type { VideoListItem } from "~/api/types";

interface VideoHeroSectionMobileProps {
  video: VideoListItem;
}

export function VideoHeroSectionMobile({ video }: VideoHeroSectionMobileProps) {
  const ytId = video.yt_video_id;
  const thumbnailUrl = ytId
    ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
    : "/images/Picture.svg";
  const youtubeUrl = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : "#";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClick = () => {
    window.open(youtubeUrl, "_blank");
  };

  return (
    <div
      className="w-full relative block group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full h-[18.75rem] rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/40 rounded-full p-4 group-hover:bg-[#D94F24] transition-colors">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5V19L19 12L8 5Z" />
            </svg>
          </div>
        </div>

        {/* Overlay Text */}
        <div className="absolute bottom-0 left-0 bg-black/40 px-6 py-4 rounded-tr-lg flex flex-col gap-1 max-w-[90%]">
          <p className="text-xs font-medium text-white leading-4">
            {formatDate(video.created_at || "")}
          </p>
          <h3 className="text-base font-semibold text-white leading-6 line-clamp-3">
            {video.title}
          </h3>
        </div>
      </div>
    </div>
  );
}
