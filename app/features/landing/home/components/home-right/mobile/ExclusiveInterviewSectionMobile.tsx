import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";

interface ExclusiveInterviewSectionMobileProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function ExclusiveInterviewSectionMobile({
    news,
    loading,
    error,
}: ExclusiveInterviewSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 bg-[#262626] text-white p-[0.75rem] rounded-[0.5rem]">Exclusive Interview</h1>
                <div className="border mt-[1rem] mb-[2rem]" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 bg-[#262626] text-white p-[0.75rem] rounded-[0.5rem]">Exclusive Interview</h1>
                <div className="border mt-[1rem] mb-[2rem]" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <h1 className="text-subheading-h5 bg-[#262626] text-white p-[0.75rem] rounded-[0.5rem]">Exclusive Interview</h1>
            <div className="border mt-[1rem] mb-[2rem]" />

            <div className="flex gap-xl overflow-x-auto pb-4 scrollbar-hide px-4 -mx-4">
                {news.map((item) => (
                    <div key={item.id} className="shrink-0 w-[85%]">
                        <CardNews
                            slug={item.slug}
                            title={item.title}
                            imageSrc={
                                item.media?.path
                                    ? mediaApi.getFileUrl(item.media.path)
                                    : "/images/Picture.svg"
                            }
                            timeText={getRelativeTime(item.created_at)}
                            flow="vertical"
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
