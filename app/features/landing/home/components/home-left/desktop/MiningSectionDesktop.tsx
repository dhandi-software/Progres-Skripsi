import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

interface MiningSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function MiningSectionDesktop({
    news,
    loading,
    error,
}: MiningSectionDesktopProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Kerja Praktek Teknik Informatika</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Kerja Praktek Teknik Informatika</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Kerja Praktek Teknik Informatika</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Belum ada informasi kerja praktek.</div>
            </section>
        );
    }

    // Split news for layout variety, but keep it all in one grid for consistency if preferred.
    // User asked for "Vertical" list or "Not truncated". A Grid is safest.
    // We'll use a main grid.
    
    return (
        <section className="w-full">
            {/* Header Section */}
            <div className="border-b border-border-subtle flex gap-sm items-center pb-lg mb-xl mt-xl">
                <p className="text-subheading-h5 text-[#d94f24] whitespace-nowrap">
                    Kerja Praktek Teknik Informatika
                </p>
            </div>

            {/* Content Grid - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((article) => (
                    <CardNews
                        key={article.id}
                        slug={article.slug}
                        className="w-full h-full"
                        title={article.title}
                        imageSrc={
                            article.media?.path
                                ? mediaApi.getFileUrl(article.media.path)
                                : "/images/Picture.svg"
                        }
                        timeText={getRelativeTime(article.created_at)}
                        lineClamp={2}
                        boldTitle={true}
                        tagLabel={article.categories.map((cat) => cat.name)}
                        tagPosition="top"
                        flow="vertical"
                    />
                ))}
            </div>
        </section>
    );
}
