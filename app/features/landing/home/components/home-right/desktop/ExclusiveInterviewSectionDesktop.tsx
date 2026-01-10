import CardNews from "~/components/ui/Cardnews";
import { AdvertisementDesktop } from "~/components/ui/AdvertisementDesktop";
import type { NewsListItem } from "~/api/types";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";

interface ExclusiveInterviewSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function ExclusiveInterviewSectionDesktop({
    news,
    loading,
    error,
}: ExclusiveInterviewSectionDesktopProps) {
    if (loading) {
        return (
            <section>
                <AdvertisementDesktop />
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Exclusive Interview</h1>
                </div>
                <div className="border mt-[1rem] mb-[2rem]" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <AdvertisementDesktop />
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Exclusive Interview</h1>
                </div>
                <div className="border mt-[1rem] mb-[2rem]" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section>
                <AdvertisementDesktop />
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Exclusive Interview</h1>
                </div>
                <div className="border mt-[1rem] mb-[2rem]" />
                <div className="text-muted-foreground">No exclusive interviews available.</div>
            </section>
        );
    }

    return (
        <section>
            <AdvertisementDesktop />
            <div className="flex gap-[0.5rem] justify-start text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Exclusive Interview</h1>
            </div>
            <div className="border border-subtle mt-[1rem] mb-[2rem]" />

            <div className="flex flex-col gap-6">
                {news.map((item, i) => (
                    <div key={item.id} className="border-b border-subtle last:border-0 pb-6 last:pb-0">
                        <CardNews
                            slug={item.slug}
                            title={item.title}
                            imageSrc={
                                i === 0
                                    ? (item.media?.path ? mediaApi.getFileUrl(item.media.path) : "/images/Picture.svg")
                                    : undefined
                            }
                            timeText={getRelativeTime(item.created_at)}
                            flow={i === 0 ? "vertical" : "horizontal"}
                            lineClamp={2}
                            className="!w-full"
                            tagLabel={item.categories.map(c => c.name)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
