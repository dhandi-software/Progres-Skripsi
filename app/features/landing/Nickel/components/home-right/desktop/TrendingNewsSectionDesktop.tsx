import CardNews from "~/components/ui/Cardnews";

export function TrendingNewsSectionDesktop() {
    return (
        <section className="pl-xl border-l">
            <div className="flex gap-[0.5rem] justify-start text-[#D94F24]">
                <h1 className="text-subheading-h5">Trending News</h1>
            </div>
            <div className="flex flex-col gap-[2rem] mt-[2rem]">
                {[...Array(5)].map((_, i) => (
                    <div className="flex gap-2xl items-center">
                        <h1
                            className="text-subheading-h1 text-[#D25026]"
                            key={i}
                        >
                            {i + 1}.
                        </h1>
                        <CardNews
                            key={i}
                            title="National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers."
                            timeText="48 minutes ago"
                            flow="horizontal"
                            lineClamp={2}
                            className="!w-full"
                            tagLabel={["Nickel", "Technology"]}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
