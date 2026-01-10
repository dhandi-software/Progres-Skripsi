import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Tag } from "~/components/ui/tag";
import { mediaApi } from "~/api/mediaApi";

interface ForYourPageSectionMobileProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function ForYourPageSectionMobile({
    news,
    loading,
    error,
}: ForYourPageSectionMobileProps) {
    if (loading) {
        return (
            <section className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#D94F24]">
                        Nickel
                    </h2>
                    <Link to="/index" className="flex gap-1 items-center text-[#D94F24]">
                        <span className="text-sm">View All</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
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
            {/* Main Section Header - For you */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">
                    For you
                </h2>
                <Link to="/index" className="flex gap-2 items-center text-[#D94F24]">
                    <span className="text-base">View All</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Sub-header - Nickel */}
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-[#D94F24]">
                    Nickel
                </h3>
            </div>

            {/* News Cards List */}
            <div className="flex flex-col gap-4">
                {news.map((article, index) => (
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
        </section>
    );
}

