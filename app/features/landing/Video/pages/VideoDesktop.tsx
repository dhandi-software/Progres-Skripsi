import VideoNewsCard from "~/components/ui/Vidieonews";
import { useVideoPage } from "./UseVideoPage";
import { getRelativeTime } from "~/lib/timeUtils";

export function VideoDesktop() {
    const { videos, loading, error } = useVideoPage();

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
                <div>Loading...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
                <div className="text-red-500">{error}</div>
            </main>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
                <div className="text-gray-500 text-center py-10">No videos available at the moment.</div>
            </main>
        );
    }

    const featuredVideo = videos[0];
    const forYouVideos = videos.slice(1);

    return (
        <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem] flex gap-6">
            {/* Left Section */}
            <section className="flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-subtle">
                    <h1 className="text-subheading-h5 text-[#D94F24]">Video</h1>
                </div>

                {/* Featured Video */}
                {featuredVideo && (
                    <div className="w-full">
                        <VideoNewsCard
                            videoSrc={`https://www.youtube.com/embed/${featuredVideo.yt_video_id}`}
                            title={featuredVideo.title}
                            timeText={getRelativeTime(featuredVideo.created_at || "")}
                            className="w-full"
                            imageSize={{ width: "59rem", height: "30rem" }}
                            flow="vertical"
                        />
                    </div>
                )}

                {/* For You Section */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-subtle">
                        <h2 className="text-subheading-h5 text-foreground">For you</h2>
                    </div>

                    {/* Grid 3 columns */}
                    <div className="grid grid-cols-3 gap-6">
                        {forYouVideos.map((video) => (
                            <VideoNewsCard
                                key={video.id}
                                videoSrc={`https://www.youtube.com/embed/${video.yt_video_id}`}
                                title={video.title}
                                timeText={getRelativeTime(video.created_at || "")}
                                lineClamp={2}
                                flow="vertical"
                                imageSize={{ width: "18.667rem", height: "7.3125rem" }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Right Sidebar - Advertisement */}
            <aside className="w-[22rem] flex flex-col gap-6">
                <div className="w-full h-[26.188rem] rounded-md bg-destructive-foreground grid place-items-center">
                    <span className="text-paragraph text-[rgba(0,0,0,0.2)]">
                        Advertisement
                    </span>
                </div>

                <div className="w-full h-[26.188rem] rounded-md bg-destructive-foreground grid place-items-center">
                    <span className="text-paragraph text-[rgba(0,0,0,0.2)]">
                        Advertisement
                    </span>
                </div>
            </aside>
        </main>
    );
}
