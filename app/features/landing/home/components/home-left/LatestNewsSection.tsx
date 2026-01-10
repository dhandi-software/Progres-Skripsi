import CardNews from "~/components/ui/Cardnews";

export function LatestNewsSection() {
    return (
        <section className="w-[59rem]">
            <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                Latest News
            </h1>
            <div className="border mb-xl" />
            <div className="flex gap-xl flex-wrap">
                <CardNews
                    title="Breaking Ground: $2.9 Billion Lithium Mining Project Officially Launched, Promising to Boost Local Economy and Solidify the Nation's Role in the Global EV Supply Chain."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    trending={true}
                    lineClamp={2}
                    tagLabel="Nickel"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    tagLabel="Nickel"
                />
                <CardNews
                    title="National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    tagLabel="Mining"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    trending={true}
                    tagLabel={["Market & Invesment", "Mining"]}
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    tagLabel="Nickel"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    trending={true}
                    tagLabel={["Market & Invesment", "Mining"]}
                />
            </div>
        </section>
    );
}
