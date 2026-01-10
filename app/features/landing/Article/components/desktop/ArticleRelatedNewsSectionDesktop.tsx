import type { NewsListItem } from "~/api/types";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";
import Topics from "~/components/ui/Topics";
import CardNews from "~/components/ui/Cardnews";

interface ArticleRelatedNewsSectionDesktopProps {
  news: NewsListItem[];
  loading?: boolean;
  error?: string;
}

export function ArticleRelatedNewsSectionDesktop({
  news,
  loading,
  error,
}: ArticleRelatedNewsSectionDesktopProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-subheading-h5 text-[#D94F24]">
          Related News
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-subheading-h5 text-[#D94F24]">
          Related News
        </div>
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-subheading-h5 text-[#D94F24]">
          Related News
        </div>
        <div className="text-muted-foreground">No related news found.</div>
      </div>
    );
  }

  /* 6 cards, 3 di atas, 3 di bawah...dengan flow/variant vertical */
  const displayNews = news.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <Topics
        title="Topics"
        topics={[
          "Nickel Mining",
          "PT_SDM",
          "Halmahera Mining",
          "Lithium",
          "Copper",
          "Mine Waste Management",
        ]}
      />

      <div className="flex flex-col gap-6">
        <div className="text-subheading-h5 text-[#D94F24]">
          Related News
        </div>

        {/* Grid News (3 cols x 2 rows = 6 items) */}
        <div className="w-full grid grid-cols-3 gap-6">
          {displayNews.map((article) => (
            <div key={article.id} className="w-full">
              <CardNews
                title={article.title}
                imageSrc={
                  article.media?.path
                    ? mediaApi.getFileUrl(article.media.path)
                    : "/images/Picture2.svg"
                }
                timeText={getRelativeTime(article.created_at)}
                tagLabel={article.categories[0]?.name}
                slug={article.slug}
                flow="vertical"
                tagPosition="bottom"
                boldTitle
                lineClamp={2}
                className="w-full h-full"
                imageSize={{ height: "10rem", width: "100%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}