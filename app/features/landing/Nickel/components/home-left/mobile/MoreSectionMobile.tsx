import { AdvertisementMobile } from "~/components/ui/AdvertisementMobile";
import CardNews from "~/components/ui/Cardnews";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";

interface MoreSectionMobileProps {
  news: NewsListItem[];
}

export function MoreSectionMobile({ news }: MoreSectionMobileProps) {
  const featuredNews = news[0];
  const listNews = news.slice(1, 5);

  return (
    <section className="w-full">
      <div className="flex gap-sm mb-lg text-[#D94F24] mt-xl">
        <h1 className="text-subheading-h5">More From Nickel</h1>
      </div>
      <div className="border mb-xl" />

      <div className="flex flex-col gap-xl">
        {/* Featured Article */}
        {featuredNews && (
          <CardNews
            title={featuredNews.title}
            imageSrc={
              featuredNews.media?.path
                ? mediaApi.getFileUrl(featuredNews.media.path)
                : "/images/Picture.svg"
            }
            timeText={getRelativeTime(featuredNews.created_at)}
            flow="vertical"
            lineClamp={2}
            className="w-full"
            slug={featuredNews.slug}
          />
        )}
        <AdvertisementMobile />
        {/* Vertical List */}
        <div className="flex flex-col gap-xl">
          {listNews.map((article) => (
            <CardNews
              key={article.id}
              title={article.title}
              imageSrc={
                article?.media?.path || (article as any)?.media?.path
                  ? mediaApi.getFileUrl(article?.media?.path || (article as any)?.media?.path)
                  : "/images/Picture.svg"
              }
              timeText={getRelativeTime(article.created_at)}
              flow="horizontal"
              lineClamp={2}
              slug={article.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
