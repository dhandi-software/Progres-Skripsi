import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";

interface ArticleRelatedNewsSectionMobileProps {
  news: NewsListItem[];
  loading?: boolean;
  error?: string;
}

export function ArticleRelatedNewsSectionMobile({
  news,
  loading,
  error,
}: ArticleRelatedNewsSectionMobileProps) {
  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-bold text-[#D94F24]">
          Related News
        </h2>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-bold text-[#D94F24]">
          Related News
        </h2>
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const grid1 = news.slice(0, 2);
  const grid2 = news.slice(2, 4);
  const grid3 = news.slice(4, 6);

  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <h2 className="text-lg font-bold text-[#D94F24]">Related News</h2>

      {grid1.length > 0 && (
        <div className="w-full flex gap-3">
          {grid1.map((article) => (
            <CardNews
              key={article.id}
              title={article.title}
              imageSrc={
                article.media?.path
                  ? mediaApi.getFileUrl(article.media.path)
                  : "/images/Picture2.svg"
              }
              timeText={getRelativeTime(article.created_at)}
              trending={false}
              description=""
              flow="vertical"
              tagLabel={article.categories.map((cat) => cat.name)}
              boldTitle={true}
              lineClamp={2}
              imageSize={{ width: "full", height: "6rem" }}
            />
          ))}
        </div>
      )}

      {grid2.length > 0 && (
        <div className="w-full flex gap-3">
          {grid2.map((article) => (
            <CardNews
              key={article.id}
              title={article.title}
              imageSrc={
                article.media?.path
                  ? mediaApi.getFileUrl(article.media.path)
                  : "/images/Picture2.svg"
              }
              timeText={getRelativeTime(article.created_at)}
              trending={false}
              description=""
              flow="vertical"
              tagLabel={article.categories.map((cat) => cat.name)}
              boldTitle={true}
              lineClamp={2}
              imageSize={{ width: "full", height: "6rem" }}
            />
          ))}
        </div>
      )}

      {grid3.length > 0 && (
        <div className="w-full flex gap-3">
          {grid3.map((article) => (
            <CardNews
              key={article.id}
              title={article.title}
              imageSrc={
                article.media?.path
                  ? mediaApi.getFileUrl(article.media.path)
                  : "/images/Picture2.svg"
              }
              timeText={getRelativeTime(article.created_at)}
              trending={false}
              description=""
              flow="vertical"
              tagLabel={article.categories.map((cat) => cat.name)}
              boldTitle={true}
              lineClamp={2}
              imageSize={{ width: "full", height: "6rem" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
