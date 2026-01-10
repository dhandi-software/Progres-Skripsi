import CardNews from "~/components/ui/Cardnews";

export function ExclusiveInterviewSectionMobile() {
    return (
        <section className="w-full">
            <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Exclusive Interview</h1>
            </div>
            <div className="border mt-[1rem] mb-[2rem]" />

            <div className="flex gap-xl overflow-x-auto pb-4 scrollbar-hide">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="shrink-0 w-[85%]">
                        <CardNews
                            title="National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers."
                            imageSrc="/images/Picture.svg"
                            timeText="48 minutes ago"
                            flow="vertical"
                            lineClamp={2}
                            className="!w-full"
                            tagLabel={["Market & Investment", "Nickel"]}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
