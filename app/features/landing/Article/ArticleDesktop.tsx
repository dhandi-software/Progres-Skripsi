import { useArticle } from "./UseArticle";
import { ArticleBodySectionDesktop } from "~/features/landing/article/components/desktop/ArticleBodySectionDesktop";
import { ArticleHeaderSectionDesktop } from "~/features/landing/article/components/desktop/ArticleHeaderSectionDesktop";
import { ArticleRelatedNewsSectionDesktop } from "~/features/landing/article/components/desktop/ArticleRelatedNewsSectionDesktop";
import { ArticleSidebarDesktop } from "~/features/landing/article/components/desktop/ArticleSidebarDesktop";


export function ArticleDesktop() {
    const { article, relatedNews, videos, ads, loading, errors } = useArticle();

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
                <div className="text-muted-foreground">Loading article...</div>
            </main>
        );
    }

    if (errors.article || !article) {
        return (
            <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
                <div className="text-destructive">
                    {errors.article || "Article not found"}
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem] flex gap-6">
            {/* Article Left */}
            <section className="flex-1 max-w-[59rem] flex flex-col gap-6">
                <ArticleHeaderSectionDesktop article={article} loading={loading} />

                <ArticleBodySectionDesktop article={article} />

                <ArticleRelatedNewsSectionDesktop
                    news={relatedNews}
                    loading={loading}
                    error={errors.relatedNews}
                />
            </section>

            {/* Article Right */}
            <ArticleSidebarDesktop
                videos={videos}
                ads={ads}
                loading={loading}
                error={errors.videos}
            />
        </main>
    );
}
