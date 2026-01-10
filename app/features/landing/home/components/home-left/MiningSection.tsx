import CardNews from "~/components/ui/Cardnews";

export function MiningSection() {
    return (
        <section className="w-[59rem]">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Mining</h1>
            </div>
            <div className="border mb-xl" />
            <div className="flex flex-wrap gap-xl">
                <CardNews
                    className="font-bold"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    trending={true}
                    boldTitle={true}
                    tagLabel="Mining"
                />
                <CardNews
                    className="font-bold"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    boldTitle={true}
                    tagLabel="Mining"
                />
                <CardNews
                    className="font-bold"
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    lineClamp={2}
                    boldTitle={true}
                    tagLabel="Mining"
                />
            </div>
            <div className="border my-xl" />
            <div className="flex flex-col gap-xl">
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Mining"
                />
                <CardNews
                    title="Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine."
                    description="PT Sumber Daya Mineral's (SDM) massive expansion plans in the Halmahera nickel mining block in North Maluku are facing serious obstacles. The Rp 5 trillion project, which was touted as a source of foreign exchange and 2,000 jobs, is now facing fierce protests from indigenous peoples and environmental NGOs."
                    imageSrc="/images/Picture.svg"
                    timeText="3 minutes ago"
                    flow="horizontal"
                    tagLabel="Mining"
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
