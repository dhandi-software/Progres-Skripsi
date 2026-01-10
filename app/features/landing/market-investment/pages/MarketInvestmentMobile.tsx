import { Link } from "react-router";
import { AdvertisementMobile } from "~/components/ui/AdvertisementMobile";
import { useMarketInvestmentPage } from "./UseMarketInvestmentPage";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";
import { FeaturedCardMobile, RegularCardMobile, LatestNewsCardMobile } from "../components/NewsCardMobile";
import { SectionHeaderMobile } from "../components/SectionHeader";

export function MarketInvestmentMobile() {
  const {
    news,
    loading,
    error
  } = useMarketInvestmentPage();

  if (loading) {
    return (
      <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  if (!news || news.length === 0) {
    return (
      <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
        <div className="text-gray-500 text-center py-10">No news available at the moment.</div>
      </main>
    );
  }

  // Featured news is the first item from general news
  const featuredNews = news[0];

  // Latest news for horizontal scroll (5 items after featured)
  const latestNewsList = news.slice(1, 6);

  // Get section data - using existing section names
  const marketAnalysisData = news.slice(1, 5);  // Market Analysis
  const moreFromMarketData = news.slice(5, 9);  // More From Market & Investment
  const latestUpdatesData = news.slice(9, 13);  // Latest Updates

  return (
    <main className="flex flex-col gap-6 pb-[3.75rem] pt-4 px-4">
      {/* Market & Investment Header */}
      <div className="flex items-center pb-4 border-b border-[#e5e5e5]">
        <h1 className="text-lg font-semibold leading-7 text-[#D94F24]">
          Market & Investment
        </h1>
      </div>

      {/* Featured News Section - 300px height image with overlay */}
      {featuredNews && (
        <Link to={`/article/${featuredNews.slug}`} className="w-full relative block group">
          <div className="relative w-full h-[18.75rem] rounded-lg overflow-hidden">
            <img
              src={
                featuredNews.media?.path
                  ? mediaApi.getFileUrl(featuredNews.media.path)
                  : "/images/Picture.svg"
              }
              alt={featuredNews.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay Text */}
            <div className="absolute bottom-0 left-0 bg-black/40 px-6 py-4 rounded-tr-lg flex flex-col gap-1 max-w-[90%]">
              <p className="text-xs font-medium text-white leading-4">
                {new Date(featuredNews.created_at).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <h3 className="text-base font-semibold text-white leading-6 line-clamp-3">
                {featuredNews.title}
              </h3>
            </div>
          </div>
        </Link>
      )}

      {/* Latest News Section */}
      <div className="w-full flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center gap-1 pb-3 border-b border-[#e5e5e5]">
          <h2 className="text-lg font-semibold leading-7 text-[#D94F24] whitespace-nowrap">
            Latest News
          </h2>
        </div>

        {/* Text List - First 3 items */}
        <div className="flex flex-col gap-2">
          {latestNewsList.slice(0, 3).map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="flex flex-col gap-3 group"
            >
              <h4 className="text-base font-bold text-foreground leading-6 line-clamp-3 h-[4.25rem] overflow-hidden group-hover:text-[#D94F24] transition-colors">
                {article.title}
              </h4>
              <time className="text-xs font-medium text-muted-foreground leading-4">
                {getRelativeTime(article.created_at)}
              </time>
            </Link>
          ))}
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {latestNewsList.map((article) => (
            <LatestNewsCardMobile key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Advertisement */}
      <AdvertisementMobile />

      {/* Market Analysis Section */}
      <div className="w-full">
        <SectionHeaderMobile title="Market Analysis" />
        <div className="flex flex-col gap-6">
          {marketAnalysisData[0] && <FeaturedCardMobile article={marketAnalysisData[0]} />}
          {marketAnalysisData.slice(1).map((article) => (
            <RegularCardMobile key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Advertisement */}
      <AdvertisementMobile />

      {/* More From Market & Investment Section */}
      <div className="w-full">
        <SectionHeaderMobile title="More From Market & Investment" />
        <div className="flex flex-col gap-6">
          {moreFromMarketData[0] && <FeaturedCardMobile article={moreFromMarketData[0]} />}
          {moreFromMarketData.slice(1).map((article) => (
            <RegularCardMobile key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Advertisement */}
      <AdvertisementMobile />

      {/* Latest Updates Section */}
      <div className="w-full">
        <SectionHeaderMobile title="Latest Updates" />
        <div className="flex flex-col gap-6">
          {latestUpdatesData[0] && <FeaturedCardMobile article={latestUpdatesData[0]} />}
          <AdvertisementMobile />
          {latestUpdatesData.slice(1).map((article) => (
            <RegularCardMobile key={article.id} article={article} />
          ))}
        </div>
      </div>
    </main>
  );
}
