import CardNews from "~/components/ui/Cardnews";

export function TechnologySection() {
    return (
        <section className="w-[59rem]">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Technology</h1>
            </div>
            <div className="border mb-xl" />
            <div className="relative w-[59rem] h-[21.938rem] overflow-hidden rounded-md">
                <img
                    src="/images/Picture.svg"
                    alt="Mining landscape with clouds in a valley"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                <div className="absolute bottom-0 left-0 w-full h-full p-6 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent">
                    <h1 className="text-subheading-h3 text-background leading-tight">
                        New Law Mandates Mining Companies to Allocate Shares for
                        Local Communities
                    </h1>
                    <p className="text-paragraph-sm text-background mt-1">
                        3 minutes ago
                    </p>
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
                    tagLabel="Technology"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Technology"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Technology"
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
