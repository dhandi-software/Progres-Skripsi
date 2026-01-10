import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";

interface TrendingNewsSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function TrendingNewsSectionDesktop({
    news,
    loading,
    error,
}: TrendingNewsSectionDesktopProps) {
    if (loading) {
        return (
            <section className="pl-xl border-l">
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24]">
                    <h1 className="text-subheading-h5">Trending News</h1>
                </div>
                <div className="text-muted-foreground mt-[2rem]">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="pl-xl border-l">
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24]">
                    <h1 className="text-subheading-h5">Trending News</h1>
                </div>
                <div className="text-destructive mt-[2rem]">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section className="pl-xl border-l">
                <div className="flex gap-[0.5rem] justify-start text-[#D94F24]">
                    <h1 className="text-subheading-h5">Trending News</h1>
                </div>
                <div className="text-muted-foreground mt-[2rem]">No trending news available.</div>
            </section>
        );
    }

    return (
        <section className="pl-xl border-l">
            <div className="flex gap-[0.5rem] justify-start text-[#D94F24]">
                <h1 className="text-subheading-h5">Trending News</h1>
            </div>
            <div className="flex flex-col gap-[2rem] mt-[2rem]">
                {news.map((article, i) => (
                    <div key={article.id} className="flex gap-2xl items-center">
                        <h1 className="text-subheading-h1 text-[#D25026]">
                            {i + 1}.
                        </h1>
                        <CardNews
                            slug={article.slug}
                            title={article.title}
                            timeText={getRelativeTime(article.created_at)}
                            flow="horizontal"
                            lineClamp={2}
                            className="!w-full"
                            tagLabel={article.categories.map((cat) => cat.name)}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
