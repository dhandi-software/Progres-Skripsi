import { Link } from "react-router";
import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

interface TechnologySectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function TechnologySectionDesktop({
    news,
    loading,
    error,
}: TechnologySectionDesktopProps) {
    if (loading) {
        return (
            <section className="w-[59rem]">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Technology</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-[59rem]">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Technology</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-destructive">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section className="w-[59rem]">
                <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
                    <h1 className="text-subheading-h5">Technology</h1>
                </div>
                <div className="border mb-xl" />
                <div className="text-muted-foreground">No technology news available.</div>
            </section>
        );
    }

    const heroArticle = news[0];
    const otherArticles = news.slice(1, 5);

    return (
        <section className="w-full max-w-[59rem]">
            {/* Header */}
            <div className="border-b border-subtle flex gap-2 items-center pb-4 pt-0 px-0 mb-6">
                <h2 className="font-semibold leading-7 text-[#D94F24] text-lg">
                    Technology
                </h2>
            </div>

            {/* Hero Article */}
            {heroArticle && (
                <Link to={`/article/${heroArticle.slug}`} className="block">
                    <div className="relative w-full h-[21.9375rem] overflow-hidden rounded-lg group">
                        <img
                            src={
                                heroArticle.media?.path
                                    ? mediaApi.getFileUrl(heroArticle.media.path)
                                    : "/images/Picture.svg"
                            }
                            alt={heroArticle.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-48% to-black/40 rounded-lg" />

                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col gap-1 text-white">
                            <h1 className="text-2xl font-semibold leading-8 line-clamp-2">
                                {heroArticle.title}
                            </h1>
                            <p className="text-sm font-normal leading-5">
                                {getRelativeTime(heroArticle.created_at)}
                            </p>
                        </div>
                    </div>
                </Link>
            )}

            {/* News List Divider */}
            <div className="h-px bg-subtle my-6" />

            {/* News List */}
            <div className="flex flex-col gap-6">
                {otherArticles.map((article) => (
                    <CardNews
                        key={article.id}
                        slug={article.slug}
                        title={article.title}
                        description={article.body?.substring(0, 280)}
                        imageSrc={
                            article.media?.path
                                ? mediaApi.getFileUrl(article.media.path)
                                : "/images/Picture.svg"
                        }
                        timeText={getRelativeTime(article.created_at)}
                        flow="horizontal"
                        tagLabel={article.categories.map((cat) => cat.name)}
                        tagPosition="bottom"
                        lineClamp={2}
                        imageSize={{ width: "25rem", height: "14rem" }}
                        className="w-full !gap-6"
                    />
                ))}
            </div>
        </section>
    );
}
