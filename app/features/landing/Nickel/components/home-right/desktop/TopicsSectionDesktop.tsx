import Topics from "~/components/ui/Topics";

export function TopicsSectionDesktop() {
    return (
        <section>
            <div className="flex justify-start text-[#D94F24]">
                <h1 className="text-subheading-h5">Popular Topics</h1>
            </div>
            <div className="border mt-[0.75rem] mb-xl" />

            <Topics
                topics={[
                    "Nickel Mining",
                    "PT_SDM",
                    "Halmahera Mining",
                    "Mine Waste Management",
                    "Lithium",
                    "Copper",
                ]}
            />
        </section>
    );
}
