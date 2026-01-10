import { Link } from "react-router";
import { useTechnologyPage } from "./UseTechnologyPage";
import { getRelativeTime } from "~/lib/timeUtils";
import { mediaApi } from "~/api/mediaApi";
import { FeaturedCardDesktop, RegularCardDesktop } from "../components/NewsCardDesktop";
import { SectionHeaderDesktop } from "../components/SectionHeader";
import { SidebarAdsSection } from "../components/SidebarAdsSection";

export function TechnologyDesktop() {
  const {
    news,
    loading,
    error
  } = useTechnologyPage();

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
        <div>Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
        <div className="text-red-500">{error}</div>
      </main>
    );
  }

  if (!news || news.length === 0) {
    return (
      <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem]">
        <div className="text-gray-500 text-center py-10">No news available at the moment.</div>
      </main>
    );
  }

  // Featured news is the first item from general news
  const featuredNews = news[0];

  // Get section data - using existing section names
  const innovationsData = news.slice(1, 5);  // Innovations
  const moreFromTechnologyData = news.slice(5, 9);  // More From Technology
  const latestUpdatesData = news.slice(9, 13);  // Latest Updates

  // Latest news for sidebar (5 items)
  const latestNewsSidebar = news.slice(0, 5);

  return (
    <main className="mx-auto w-full max-w-[90rem] px-[3.75rem] pt-6 pb-[3.75rem] flex gap-6">
      {/* Left Container - Main Content */}
      <section className="flex-1 flex flex-col gap-6">
        {/* Technology Header */}
        <div className="flex items-center pb-4 border-b border-[#e5e5e5]">
          <h2 className="text-2xl font-bold leading-8 text-[#D94F24]">
            Technology
          </h2>
        </div>

        {/* Featured News Section - 480px height image with overlay */}
        {featuredNews && (
          <Link to={`/article/${featuredNews.slug}`} className="w-full relative block group">
            <div className="relative w-full h-[30rem] rounded-lg overflow-hidden">
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
              <div className="absolute bottom-0 left-0 bg-black/40 px-10 py-6 rounded-tr-lg flex flex-col gap-2 max-w-[70%]">
                <p className="text-sm font-medium text-white leading-5">
                  {new Date(featuredNews.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <h3 className="text-2xl font-semibold text-white leading-8 line-clamp-3">
                  {featuredNews.title}
                </h3>
              </div>
            </div>
          </Link>
        )}

        {/* Innovations Section */}
        <div className="w-full">
          <SectionHeaderDesktop title="Innovations" />
          <div className="flex flex-col gap-6">
            {innovationsData[0] && <FeaturedCardDesktop article={innovationsData[0]} />}
            {innovationsData.slice(1).map((article) => (
              <RegularCardDesktop key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* More From Technology Section */}
        <div className="w-full">
          <SectionHeaderDesktop title="More From Technology" />
          <div className="flex flex-col gap-6">
            {moreFromTechnologyData[0] && <FeaturedCardDesktop article={moreFromTechnologyData[0]} />}
            {moreFromTechnologyData.slice(1).map((article) => (
              <RegularCardDesktop key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Latest Updates Section */}
        <div className="w-full">
          <SectionHeaderDesktop title="Latest Updates" />
          <div className="flex flex-col gap-6">
            {latestUpdatesData[0] && <FeaturedCardDesktop article={latestUpdatesData[0]} />}
            {latestUpdatesData.slice(1).map((article) => (
              <RegularCardDesktop key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Right Sidebar */}
      <aside className="w-[22rem] flex flex-col gap-[1.625rem]">
        {/* Latest News Section */}
        <div className="w-full bg-white flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-[#e5e5e5]">
            <h2 className="text-lg font-semibold leading-7 text-[#D94F24] whitespace-nowrap">
              Latest News
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {latestNewsSidebar.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="flex flex-col gap-3 group"
              >
                <h4 className="text-base font-normal text-foreground leading-6 line-clamp-3 h-[4.25rem] overflow-hidden group-hover:text-[#D94F24] transition-colors">
                  {article.title}
                </h4>
                <time className="text-xs font-medium text-muted-foreground leading-4">
                  {getRelativeTime(article.created_at)}
                </time>
              </Link>
            ))}
          </div>
        </div>

        {/* 4 Advertisement Sections */}
        <SidebarAdsSection />
      </aside>
    </main>
  );
}
