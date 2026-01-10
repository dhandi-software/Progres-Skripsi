import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

interface LatestNewsSectionMobileProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function LatestNewsSectionMobile({
    news,
    loading,
    error,
}: LatestNewsSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                    Latest News
                </h1>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                    Latest News
                </h1>
                <div className="border mb-xl" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                Latest News
            </h1>
            <div className="border mb-xl" />
            <div className="flex gap-xl overflow-x-auto pb-4 scrollbar-hide">
                {news.map((article) => (
                    <div key={article.id} className="shrink-0 w-[85%]">
                        <CardNews
                            slug={article.slug}
                            title={article.title}
                            imageSrc={
                                article.media?.path
                                    ? mediaApi.getFileUrl(article.media.path)
                                    : "/images/Picture.svg"
                            }
                            timeText={getRelativeTime(article.created_at)}
                            lineClamp={2}
                            tagLabel={article.categories.map((cat) => cat.name)}
                            className="w-full"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
