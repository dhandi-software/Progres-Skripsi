import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { Link } from "react-router";
import { Tag } from "~/components/ui/tag";
import { mediaApi } from "~/api/mediaApi";

interface MarketInvesmentSectionMobileProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function MarketInvesmentSectionMobile({
    news,
    loading,
    error,
}: MarketInvesmentSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
                    <h2 className="text-lg font-semibold text-[#D94F24]">Market & Invesment</h2>
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

    return (
        <section className="w-full">
            {/* Section Header */}
            <div className="flex items-center gap-2 pb-4 border-b border-border-subtle mb-4">
                <h2 className="text-lg font-semibold text-[#D94F24]">Market & Invesment</h2>
            </div>

            {/* First Item - Elevated Card */}
            {news.length > 0 && (
                <Link
                    to={`/article/${news[0].slug}`}
                    className="flex gap-6 items-center p-3 bg-muted rounded-lg group mb-4"
                >
                    <div className="relative w-[9.375rem] h-[7rem] shrink-0 overflow-hidden rounded-lg">
                        <img
                            src={
                                news[0].media?.path
                                    ? mediaApi.getFileUrl(news[0].media.path)
                                    : "/images/Picture.svg"
                            }
                            alt={news[0].title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="eager"
                        />
                    </div>
                    <div className="flex flex-col gap-3 flex-1 min-w-0 justify-center">
                        <p className="text-base font-bold text-foreground leading-6 line-clamp-3 group-hover:text-primary transition-colors">
                            {news[0].title}
                        </p>
                        <div className="flex items-center gap-2">
                            {news[0].categories && news[0].categories.length > 0 && (
                                <Tag
                                    label={news[0].categories[0].name}
                                    className="bg-secondary/50 border-secondary h-6"
                                />
                            )}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            {getRelativeTime(news[0].created_at)}
                        </span>
                    </div>
                </Link>
            )}

            {/* Remaining Items - Horizontal Cards */}
            {news.length > 1 && (
                <div className="flex flex-col gap-4">
                    {news.slice(1).map((article) => (
                        <Link
                            key={article.id}
                            to={`/article/${article.slug}`}
                            className="flex gap-4 items-center group"
                        >
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

