import CardNews from "~/components/ui/Cardnews";
import { Tag } from "~/components/ui/tag";
import { cn } from "~/lib/utils";

export function ForYourPageSection() {
    return (
        <section className="w-[59rem]">
            <h1 className="text-heading-h4 text-foreground mb-xl">For You</h1>
            <div className="flex gap-sm mb-lg text-[#D94F24]">
                <h1 className="text-subheading-h5">Nickel</h1>
            </div>
            <div className="border mb-xl" />
            <div className="flex gap-xl">
                <div className={cn("w-[17.5rem] flex flex-col gap-sm")}>
                    <div
                        className={cn(
                            "group relative overflow-hidden h-[10rem] w-[17.5rem]",
                        )}
                    >
                        <img
                            src="/images/Picture.svg"
                            alt=""
                            className={cn(
                                "rounded-md object-cover h-[10rem] w-[17.5rem]",
                            )}
                        />
                    </div>
                    <Tag label="Nickel" className="max-w-fit" />
                    <div className="w-full flex flex-col gap-md">
                        <h4
                            className={cn(
                                "w-full text-foreground text-paragraph line-clamp-2 font-bold",
                            )}
                        >
                            Rescue Efforts Enter Third Day for Dozens of Miners
                            Trapped Underground After a Devastating Tunnel
                            Collapse at Sumbawa Copper Mine.
                        </h4>
                        <time className="text-paragraph-sm text-muted-foreground">
                            3 minutes ago
                        </time>
                    </div>
                </div>
                <div className="flex flex-col gap-xl">
                    <CardNews
                        className="w-full"
                        title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                        timeText="3 minutes ago"
                        tagLabel="Nickel"
                    />
                    <CardNews
                        className="w-full"
                        title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                        timeText="3 minutes ago"
                        tagLabel="Nickel"
                    />
                    <CardNews
                        className="w-full"
                        title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                        timeText="3 minutes ago"
                        tagLabel="Technology"
                    />
                </div>
            </div>
            <div className="border my-xl" />
            <div className="flex flex-col gap-xl">
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Nickel"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Nickel"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Technology"
                />
            </div>
        </section>
    );
}
