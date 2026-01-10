import CardNews from "~/components/ui/Cardnews";
import { Tag } from "~/components/ui/tag";

export function MarketInvesmentSection() {
    return (
        <section className="w-[59rem]">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Market & Invesment</h1>
            </div>
            <div className="border mb-xl" />
            <div className="flex gap-xl w-full h-fit">
                <div className="relative overflow-hidden rounded-md !w-[46rem] !h-[14rem]">
                    <img
                        src="/images/Picture.svg"
                        alt="Sumbawa Copper Mine"
                        className="object-cover w-full h-full rounded-md"
                    />
                </div>

                <div className="flex flex-col justify-center gap-md w-full">
                    <h4 className="font-bold text-foreground text-paragraph-lg">
                        Rescue Efforts Enter Third Day for Dozens of Miners
                        Trapped Underground After a Devastating Tunnel Collapse
                        at Sumbawa Copper Mine.
                    </h4>
                    <Tag label="Market & Invesment" className="w-fit" />
                    <time className="text-label-sm text-muted-foreground">
                        3 minutes ago
                    </time>
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
                    tagLabel="Market & Invesment"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel={["Nickel", "Market & Invesment"]}
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Market & Invesment"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Market & Invesment"
                />
            </div>
        </section>
    );
}
