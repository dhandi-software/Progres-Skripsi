import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

interface LatestNewsSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function LatestNewsSectionDesktop({
    news,
    loading,
    error,
}: LatestNewsSectionDesktopProps) {
    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <section className="w-[59rem]">
            <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                Latest News
            </h1>
            <div className="border mb-xl" />
            <div className="flex gap-xl flex-wrap">
                {news.map((article) => (
                    <CardNews
                        key={article.id}
                        title={article.title}
                        imageSrc={article.media?.path || "/images/Picture.svg"}
                        timeText={getRelativeTime(article.created_at)}
                        lineClamp={2}
                        tagLabel={article.categories.map(c => c.name)}
                    />
                ))}
            </div>
        </section>
    );
}
