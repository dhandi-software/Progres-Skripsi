import { AdvertisementMobile } from "~/components/ui/AdvertisementMobile";
import { VideoHeaderSectionMobile } from "~/features/landing/video/components/mobile/VideoHeaderSectionMobile";
import { VideoHeroSectionMobile } from "~/features/landing/video/components/mobile/VideoHeroSectionMobile";
import { VideoForYouSectionMobile } from "~/features/landing/video/components/mobile/VideoForYouSectionMobile";
import { VideoListSectionMobile } from "~/features/landing/video/components/mobile/VideoListSectionMobile";
import { useVideoPage } from "./UseVideoPage";

export function VideoMobile() {
    const { videos, loading, error } = useVideoPage();

    if (loading) {
        return (
            <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
                <div>Loading...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
                <div className="text-red-500">{error}</div>
            </main>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
                <div className="text-gray-500 text-center py-10">No videos available at the moment.</div>
            </main>
        );
    }

    // Featured video (first item)
    const featuredVideo = videos[0];

    // For you videos (next 4 items)
    const forYouVideos = videos.slice(1, 5);

    // First video list section (4 items)
    const listVideos1 = videos.slice(5, 9);

    // Second video list section (remaining items)
    const listVideos2 = videos.slice(9, 13);

    return (
        <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
            {/* Video Header */}
            <VideoHeaderSectionMobile />

            {/* Featured Video Section */}
            {featuredVideo && <VideoHeroSectionMobile video={featuredVideo} />}

            {/* For You Section */}
            {forYouVideos.length > 0 && (
                <VideoForYouSectionMobile videos={forYouVideos} />
            )}

            {/* Advertisement */}
            <AdvertisementMobile />

            {/* First Video List Section */}
            {listVideos1.length > 0 && (
                <VideoListSectionMobile videos={listVideos1} />
            )}

            {/* Advertisement */}
            <AdvertisementMobile />

            {/* Advertisement */}
            <AdvertisementMobile />

            {/* Second Video List Section */}
            {listVideos2.length > 0 && (
                <VideoListSectionMobile videos={listVideos2} />
            )}
        </main>
    );
}
