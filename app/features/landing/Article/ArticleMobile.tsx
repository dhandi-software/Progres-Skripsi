import { useArticle } from "./UseArticle";
import { AdvertisementMobile } from "~/components/ui/AdvertisementMobile";
import { ArticleHeaderSectionMobile } from "~/features/landing/article/components/mobile/ArticleHeaderSectionMobile";
import { ArticleHeroSectionMobile } from "~/features/landing/article/components/mobile/ArticleHeroSectionMobile";
import { ArticleBodySectionMobile } from "~/features/landing/article/components/mobile/ArticleBodySectionMobile";
import { ArticleTopicsSectionMobile } from "~/features/landing/article/components/mobile/ArticleTopicsSectionMobile";
import { ArticleRelatedNewsSectionMobile } from "~/features/landing/article/components/mobile/ArticleRelatedNewsSectionMobile";
import { ArticleVideoSectionMobile } from "~/features/landing/article/components/mobile/ArticleVideoSectionMobile";

export function ArticleMobile() {
    const { article, relatedNews, videos, ads, loading, errors } = useArticle();

    if (loading) {
        return (
            <div className="w-full px-4 pt-4 pb-8">
                <div className="text-muted-foreground body-paragraph-sm">Loading article...</div>
            </div>
        );
    }

    if (errors.article || !article) {
        return (
            <div className="w-full px-4 pt-4 pb-8">
                <div className="text-destructive body-paragraph-sm">
                    {errors.article || "Article not found"}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="w-full px-4 pt-4 pb-8 flex flex-col gap-4">
                {/* Header Section */}
                <ArticleHeaderSectionMobile article={article} />

                {/* Hero Picture */}
                <ArticleHeroSectionMobile article={article} />

                {/* Article Body */}
                <ArticleBodySectionMobile article={article} />

                {/* Topics */}
                <ArticleTopicsSectionMobile article={article} />

                <AdvertisementMobile ad={ads[0]} />

                {/* Related News Section */}
                <ArticleRelatedNewsSectionMobile
                    news={relatedNews}
                    loading={loading}
                    error={errors.relatedNews}
                />

                <AdvertisementMobile ad={ads[1]} />
                <AdvertisementMobile ad={ads[2]} />

                {/* Video Section */}
                <ArticleVideoSectionMobile
                    videos={videos}
                    loading={loading}
                    error={errors.videos}
                />
            </div>
        </div>
    );
}

