import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { Link } from "react-router";
import { Tag } from "~/components/ui/tag";
import { mediaApi } from "~/api/mediaApi";

interface MiningSectionMobileProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function MiningSectionMobile({
    news,
    loading,
    error,
}: MiningSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
                    <h2 className="text-lg font-semibold text-[#D94F24]">Mining</h2>
                </div>
                <div className="text-muted-foreground animate-pulse">Loading...</div>
            </section>
        );
    }

    if (error) {
        return null;
    }

    if (news.length === 0) {
        return null;
    }

    const topItems = news.slice(0, 2);
    const bottomItems = news.slice(2);

    return (
        <section className="w-full">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
                <h2 className="text-lg font-semibold text-[#D94F24]">Mining</h2>
            </div>

            {/* Top Row - 2 Vertical Cards */}
            {topItems.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {topItems.map((article) => (
                        <Link
                            key={article.id}
                            to={`/article/${article.slug}`}
                            className="flex flex-col gap-2 group"
                        >
                            {/* Image */}
                            <div className="relative w-full h-[7.5rem] overflow-hidden rounded-lg">
                                <img
                                    src={
                                        article.media?.path
                                            ? mediaApi.getFileUrl(article.media.path)
                                            : "/images/Picture.svg"
                                    }
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Tag */}
                            <div className="flex items-center gap-2">
                                {article.categories && article.categories.length > 0 && (
                                    <Tag
                                        label={article.categories[0].name}
                                        className="bg-secondary/50 border-secondary h-6"
                                    />
                                )}
                            </div>

                            {/* Content */}
                            <p className="text-base font-normal text-foreground leading-6 line-clamp-2 group-hover:text-primary transition-colors">
                                {article.title}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                                {getRelativeTime(article.created_at)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}

            {/* Bottom Section - Horizontal Cards */}
            {bottomItems.length > 0 && (
                <div className="flex flex-col gap-4">
                    {bottomItems.map((article) => (
                        <Link
                            key={article.id}
                            to={`/article/${article.slug}`}
                            className="flex gap-4 items-center group"
                        >
                            {/* Image */}
                            <div className="relative w-[8.125rem] h-[7.5rem] shrink-0 overflow-hidden rounded-lg">
                                <img
                                    src={
                                        article.media?.path
                                            ? mediaApi.getFileUrl(article.media.path)
                                            : "/images/Picture.svg"
                                    }
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-3 flex-1 min-w-0 justify-center h-[7.5rem]">
                                <p className="text-base font-normal text-foreground leading-6 line-clamp-3 group-hover:text-primary transition-colors">
                                    {article.title}
                                </p>
                                <div className="flex items-center gap-2">
                                    {article.categories && article.categories.length > 0 && (
                                        <Tag
                                            label={article.categories[0].name}
                                            className="bg-secondary/50 border-secondary h-6"
                                        />
                                    )}
                                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                        {getRelativeTime(article.created_at)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
