import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

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
    if (loading) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                    Berita Terbaru
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
                    Berita Terbaru
                </h1>
                <div className="border mb-xl" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section className="w-full">
                <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                    Berita Terbaru
                </h1>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Belum ada berita terbaru.</div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <h1 className="text-subheading-h5 text-[#D94F24] mb-lg">
                Berita Terbaru
            </h1>
            <div className="border mb-xl" />
            <div className="flex gap-xl flex-wrap">
                {news.map((article) => (
                    <CardNews
                        key={article.id}
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
                    />
                ))}
            </div>
        </section>
    );
}
