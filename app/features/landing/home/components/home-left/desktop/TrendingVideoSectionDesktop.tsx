import VideoNewsCard from "~/components/ui/Vidieonews";
import type { VideoListItem } from "~/api/types";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { getRelativeTime } from "~/lib/timeUtils";

interface TrendingVideoSectionDesktopProps {
    videos: VideoListItem[];
    loading?: boolean;
    error?: string;
}

export function TrendingVideoSectionDesktop({
    videos,
    loading,
    error,
}: TrendingVideoSectionDesktopProps) {
    if (loading) {
        return (
            <section className="w-[59rem]">
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
            <section className="w-[59rem]">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl justify-between">
                    <h1 className="text-subheading-h5">Latest Video</h1>
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
        <section className="w-[59rem]">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl justify-between">
                <h1 className="text-subheading-h5">Latest Video</h1>
                <Link to={"/video-index"} className="flex gap-sm items-center">
                    <h1 className="text-paragraph">View All</h1>
                    <ArrowRight className="size-lg" />
                </Link>
            </div>
            <div className="border mb-xl" />
            <div className="flex h-fit gap-6 justify-between items-start">
                {videos.slice(0, 4).map((video) => (
                    <VideoNewsCard
                        key={video.id}
                        videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
                        title={video.title}
                        duration="01:45"
                        timeText={getRelativeTime(video.created_at || "")}
                        lineClamp={3}
                        flow="vertical"
                        imageSize={{ width: "13.5rem", height: "8.25rem" }}
                    />
                ))}
            </div>
        </section>
    );
}
