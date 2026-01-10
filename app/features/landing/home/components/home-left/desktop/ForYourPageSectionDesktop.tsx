import CardNews from "~/components/ui/Cardnews";
import { Tag } from "~/components/ui/tag";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { mediaApi } from "~/api/mediaApi";

interface ForYourPageSectionDesktopProps {
    news: NewsListItem[];
    loading?: boolean;
    error?: string;
}

export function ForYourPageSectionDesktop({
    news,
    loading,
    error,
}: ForYourPageSectionDesktopProps) {
    if (loading) {
        return (
            <section className="w-full md:w-[59rem]">
                <div className="flex justify-between items-center mb-xl px-4 md:px-0">
                    <h1 className="text-heading-h4 font-bold text-foreground leading-normal">
                        For you
                    </h1>
                    <Link to={"/index"} className="flex gap-sm items-center text-[#D94F24] hover:opacity-80 transition-opacity">
                        <span className="text-paragraph">View All </span>
                        <ArrowRight className="size-lg" />
                    </Link>
                </div>
                <div className="border-b border-border-subtle flex gap-sm items-center pb-lg mb-xl px-4 md:px-0">
                    <p className="text-subheading-h5 text-[#d94f24] whitespace-nowrap">Nickel</p>
                </div>
                <div className="text-muted-foreground px-4">Loading...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="w-full md:w-[59rem]">
                <div className="flex justify-between items-center mb-xl px-4 md:px-0">
                    <h1 className="text-heading-h4 font-bold text-foreground leading-normal">
                        For you
                    </h1>
                    <Link to={"/index"} className="flex gap-sm items-center text-[#D94F24] hover:opacity-80 transition-opacity">
                        <span className="text-paragraph">View All </span>
                        <ArrowRight className="size-lg" />
                    </Link>
                </div>
                <div className="border-b border-border-subtle flex gap-sm items-center pb-lg mb-xl px-4 md:px-0">
                    <p className="text-subheading-h5 text-[#d94f24] whitespace-nowrap">Nickel</p>
                </div>
                <div className="text-destructive px-4">{error}</div>
            </section>
        );
    }

    if (!news || news.length === 0) {
        return (
            <section className="w-full md:w-[59rem]">
                <div className="flex justify-between items-center mb-xl px-4 md:px-0">
                    <h1 className="text-heading-h4 font-bold text-foreground leading-normal">
                        For you
                    </h1>
                    <Link to={"/index"} className="flex gap-sm items-center text-[#D94F24] hover:opacity-80 transition-opacity">
                        <span className="text-paragraph">View All </span>
                        <ArrowRight className="size-lg" />
                    </Link>
                </div>
                <div className="border-b border-border-subtle flex gap-sm items-center pb-lg mb-xl px-4 md:px-0">
                    <p className="text-subheading-h5 text-[#d94f24] whitespace-nowrap">Nickel</p>
                </div>
                <div className="text-muted-foreground px-4">No nickel news available.</div>
            </section>
        );
    }

    const topArticles = news.slice(0, 4);
    const bottomArticles = news.slice(4, 7);
    const featuredArticle = topArticles[0];
    const regularTopArticles = topArticles.slice(1);

    return (
        <section className="w-full md:w-[59rem]">
            {/* For You Header with View All */}
            <div className="flex justify-between items-center mb-xl px-4 md:px-0">
                <h1 className="text-heading-h4 font-bold text-foreground leading-normal">
                    For you
                </h1>
                <Link to={"/index"} className="flex gap-sm items-center text-[#D94F24] hover:opacity-80 transition-opacity">
                    <span className="text-paragraph">View All </span>
                    <ArrowRight className="size-lg" />
                </Link>
            </div>

            {/* Nickel Sub-header */}
            <div className="border-b border-border-subtle flex gap-sm items-center pb-lg mb-xl px-4 md:px-0">
                <p className="text-subheading-h5 text-[#d94f24] whitespace-nowrap">
                    Nickel
                </p>
            </div>

            {/* Mobile Layout - Top Section */}
            <div className="flex md:hidden gap-xl overflow-x-auto pb-4 px-4 scrollbar-hide">
                {topArticles.map((article, idx) => (
                    <div key={article.id} className="shrink-0 w-[85%]">
                        {idx === 0 ? (
                            <Link to={`/article/${article.slug}`} className="block">
                                <div className="flex flex-col gap-sm">
                                    <div className="group relative overflow-hidden h-[10rem] w-full">
                                        <img
                                            src={
                                                article.media?.path
                                                    ? mediaApi.getFileUrl(article.media.path)
                                                    : "/images/Picture.svg"
                                            }
                                            alt=""
                                            className="rounded-md object-cover h-[10rem] w-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <Tag
                                        label={article.categories[0]?.name || "Nickel"}
                                        className="max-w-fit"
                                    />
                                    <div className="w-full flex flex-col gap-md">
                                        <h4 className="w-full text-foreground text-paragraph line-clamp-2 font-bold hover:text-brand-primary transition-colors">
                                            {article.title}
                                        </h4>
                                        <time className="text-paragraph-sm text-muted-foreground">
                                            {getRelativeTime(article.created_at)}
                                        </time>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <CardNews
                                className="w-full"
                                slug={article.slug}
                                title={article.title}
                                timeText={getRelativeTime(article.created_at)}
                                tagLabel={article.categories.map((cat) => cat.name)}
                                tagPosition="top"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Layout - Top Section */}
            <div className="hidden md:flex flex-col gap-xl">
                <div className="flex gap-xl border-b border-border-subtle pb-md">
                    {featuredArticle && (
                        <div className="w-[17.5rem] flex flex-col gap-sm shrink-0">
                            <Link to={`/article/${featuredArticle.slug}`} className="group relative overflow-hidden h-[10rem] w-full block">
                                <img
                                    src={
                                        featuredArticle.media?.path
                                            ? mediaApi.getFileUrl(featuredArticle.media.path)
                                            : "/images/Picture.svg"
                                    }
                                    alt=""
                                    className="rounded-md object-cover h-[10rem] w-full"
                                />
                            </Link>
                            <Tag
                                label={featuredArticle.categories[0]?.name || "Nickel"}
                                className="max-w-fit"
                            />
                            <div className="w-full flex flex-col gap-md">
                                <Link to={`/article/${featuredArticle.slug}`}>
                                    <h4 className="w-full text-foreground text-paragraph line-clamp-2 font-bold hover:text-brand-primary transition-colors">
                                        {featuredArticle.title}
                                    </h4>
                                </Link>
                                <time className="text-label-sm text-muted-foreground">
                                    {getRelativeTime(featuredArticle.created_at)}
                                </time>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-xl flex-1">
                        {regularTopArticles.map((article) => (
                            <CardNews
                                key={article.id}
                                className="w-full"
                                slug={article.slug}
                                title={article.title}
                                timeText={getRelativeTime(article.created_at)}
                                tagLabel={article.categories.map((cat) => cat.name)}
                                tagPosition="top"
                                boldTitle={false}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Section - Desktop */}
                <div className="flex flex-col gap-xl">
                    {bottomArticles.map((article) => (
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
                            tagPosition="top"
                            boldTitle={false}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Horizontal Scroll - Bottom Section */}
            <div className="flex md:hidden gap-xl overflow-x-auto pb-4 px-4 scrollbar-hide">
                {bottomArticles.map((article) => (
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
                        flow="vertical"
                        tagLabel={article.categories.map((cat) => cat.name)}
                        className="shrink-0 w-[85%]"
                    />
                ))}
            </div>
        </section>
    );
}
