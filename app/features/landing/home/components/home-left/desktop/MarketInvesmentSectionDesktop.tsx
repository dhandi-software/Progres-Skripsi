import { Link } from "react-router";
import CardNews from "~/components/ui/Cardnews";
import { Tag } from "~/components/ui/tag";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

interface MarketInvesmentSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function MarketInvesmentSectionDesktop({
    news,
    loading,
    error,
}: MarketInvesmentSectionDesktopProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Informasi Lowongan Kerja Praktek</h1>
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
                    <h1 className="text-subheading-h5">Informasi Lowongan Kerja Praktek</h1>
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
                    <h1 className="text-subheading-h5">Informasi Lowongan Kerja Praktek</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Belum ada informasi lowongan.</div>
            </section>
        );
    }

    const featuredArticle = news[0];
    const otherArticles = news.slice(1, 5);

    return (
        <section className="w-full">
            <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                <h1 className="text-subheading-h5">Informasi Lowongan Kerja Praktek</h1>
            </div>
            <div className="border mb-xl" />
            
            {/* Featured Article */}
            {featuredArticle && (
                <Link to={`/article/${featuredArticle.slug}`} className="block mb-8">
                    <div className="group flex flex-col md:flex-row gap-6 w-full">
                        <div className="relative overflow-hidden rounded-md w-full md:w-2/3 aspect-video md:aspect-[16/9] lg:h-[14rem]">
                            <img
                                src={
                                    featuredArticle.media?.path
                                        ? mediaApi.getFileUrl(featuredArticle.media.path)
                                        : "/images/Picture.svg"
                                }
                                alt={featuredArticle.title}
                                className="object-cover w-full h-full rounded-md transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-2 w-full md:w-1/3">
                            <h4 className="font-bold text-foreground text-xl leading-snug group-hover:text-brand-primary transition-colors line-clamp-3">
                                {featuredArticle.title}
                            </h4>
                            <Tag
                                label={featuredArticle.categories[0]?.name || "Lowongan"}
                                className="w-fit"
                            />
                            <time className="text-sm text-muted-foreground">
                                {getRelativeTime(featuredArticle.created_at)}
                            </time>
                        </div>
                    </div>
                </Link>
            )}

            <div className="border my-xl" />
            
            {/* Other Articles List */}
            <div className="flex flex-col gap-6">
                {otherArticles.map((article) => (
                    <CardNews
                        key={article.id}
                        slug={article.slug}
                        title={article.title}
                        description={article.body?.substring(0, 200)}
                        imageSrc={
                            article.media?.path
                                ? mediaApi.getFileUrl(article.media.path)
                                : "/images/Picture.svg"
                        }
                        timeText={getRelativeTime(article.created_at)}
                        flow="horizontal"
                        tagLabel={article.categories.map((cat) => cat.name)}
                    />
                ))}
            </div>
        </section>
    );
}
