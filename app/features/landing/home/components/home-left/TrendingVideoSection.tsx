import VideoNewsCard from "~/components/ui/Vidieonews";

export function TrendingVideoSection() {
    return (
        <section className="w-[59rem]">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Trending Video</h1>
            </div>
            <div className="border mb-xl" />
            <div className="flex h-fit gap-6 justify-between items-start">
                <VideoNewsCard
                    videoSrc="/images/vidieonews.mp4"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    duration="01:45"
                    timeText="30 minutes ago"
                    lineClamp={3}
                />
                <VideoNewsCard
                    videoSrc="/images/vidieonews.mp4"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    duration="01:45"
                    timeText="30 minutes ago"
                    lineClamp={3}
                />
                <VideoNewsCard
                    videoSrc="/images/vidieonews.mp4"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    duration="01:45"
                    timeText="30 minutes ago"
                    lineClamp={3}
                />
                <VideoNewsCard
                    videoSrc="/images/vidieonews.mp4"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    duration="01:45"
                    timeText="30 minutes ago"
                    lineClamp={3}
                />
            </div>
        </section>
    );
}
