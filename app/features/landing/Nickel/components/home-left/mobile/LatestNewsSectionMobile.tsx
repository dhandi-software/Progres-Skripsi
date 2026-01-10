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
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <section className="w-full">
            <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                Latest News
            </h1>
            <div className="flex flex-col gap-sm mb-lg">
                {news.slice(0, 4).map((article) => (
                    <CardNews
                        key={article.id}
                        title={article.title}
                        timeText={getRelativeTime(article.created_at)}
                        lineClamp={2}
                        flow="horizontal"
                        boldTitle={true}
                        trending={false}
                        className="w-full"
                        tagLabel={article.categories.map(c => c.name)}
                    />
                ))}
            </div>
            <div className="flex gap-xl overflow-x-auto pb-4 scrollbar-hide">
                {news.slice(4).map((article) => (
                    <div key={article.id} className="shrink-0 w-[85%]">
                        <CardNews
                            title={article.title}
                            imageSrc={
                                article?.media?.path || (article as any)?.media?.path
                                    ? mediaApi.getFileUrl(article?.media?.path || (article as any)?.media?.path)
                                    : "/images/Picture.svg"
                            }
                            timeText={getRelativeTime(article.created_at)}
                            lineClamp={2}
                            className="w-full"
                            tagLabel={article.categories.map(c => c.name)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
