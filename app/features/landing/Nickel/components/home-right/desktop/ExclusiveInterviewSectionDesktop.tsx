import { AdvertisementDesktop } from "~/components/ui/AdvertisementDesktop";
import CardNews from "~/components/ui/Cardnews";

export function ExclusiveInterviewSectionDesktop() {
    return (
        <section>
            <AdvertisementDesktop />
            <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Exclusive Interview</h1>
            </div>
            <div className="border mt-[1rem] mb-[2rem]" />

            <div className="flex flex-col gap-xl">
                {[...Array(3)].map((_, i) => (
                    <div key={i}>
                        <CardNews
                            title="National Safety Agency Launches a Full-Scale Investigation into the Fatal Blast at the Rocky Point Coal Mine, Which Claimed the Lives of 5 Workers."
                            imageSrc={
                                i === 0 ? "/images/Picture.svg" : undefined
                            }
                            timeText="48 minutes ago"
                            flow={i === 0 ? "vertical" : "horizontal"}
                            lineClamp={2}
                            className="!w-full"
                            tagLabel={
                                i === 0
                                    ? ["Market & Investment", "Nickel"]
                                    : "Mining"
                            }
                        />
                        <div className="border mt-[1rem]" />
                    </div>
                ))}
            </div>
        </section>
    );
}
