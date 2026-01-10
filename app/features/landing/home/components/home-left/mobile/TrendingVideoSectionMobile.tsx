import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { getRelativeTime } from "~/lib/timeUtils";

interface TrendingVideoSectionMobileProps {
    videos: VideoListItem[];
    loading?: boolean;
    error?: string;
}

export function TrendingVideoSectionMobile({
    videos,
    loading,
    error,
}: TrendingVideoSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl justify-between">
                    <h1 className="text-subheading-h5">Latest Video</h1>
                    <Link to={"/video-index"} className="flex gap-sm items-center">
                        <h1 className="text-paragraph">View All</h1>
                        <ArrowRight className="size-lg" />
                    </Link>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl justify-between">
                    <h1 className="text-subheading-h5">Trending Video</h1>
                    <Link to={"/video-index"} className="flex gap-sm items-center">
                        <h1 className="text-paragraph">View All</h1>
                        <ArrowRight className="size-lg" />
                    </Link>
                </div>
                <div className="border mb-xl" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl justify-between">
                <h1 className="text-subheading-h5">Trending Video</h1>
                <Link to={"/video-index"} className="flex gap-sm items-center">
                    <h1 className="text-paragraph">View All</h1>
                    <ArrowRight className="size-lg" />
                </Link>
            </div>
            <div className="border mb-xl" />
            <div className="flex gap-xl overflow-x-auto pb-4 scrollbar-hide">
                {videos.map((video) => (
                    <div key={video.id} className="shrink-0 w-[85%]">
                        <VideoNewsCard
                            videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
                            title={video.title}
                            duration="01:45"
                            timeText={getRelativeTime(video.created_at || "")}
                            lineClamp={3}
                            flow="vertical"
                            imageSize={{ width: "13.5rem", height: "8.25rem" }}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
