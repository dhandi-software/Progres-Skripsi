import { Link } from "react-router";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { Tag } from "~/components/ui/tag";
import { mediaApi } from "~/api/mediaApi";

interface HeadlineSectionMobileProps {
  headlines: NewsListItem[];
  loading?: boolean;
  error?: string;
}

export function HeadlineSectionMobile({
  headlines,
  loading,
  error,
}: HeadlineSectionMobileProps) {
  // Don't render if no headline data
  if (headlines.length === 0 && !loading && !error) {
    return null;
  }

  if (loading) {
    return (
      <section className="w-full">
        <div className="flex flex-col gap-xl">
          <div className="w-full h-[18.75rem] flex items-center justify-center bg-muted rounded-lg">
            <div className="text-muted-foreground animate-pulse">Loading headlines...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Silently fail for better UX
  }

  const mainHeadline = headlines[0];
  const subHeadlines = headlines.slice(1, 4);

  return (
    <section className="w-full">
      <div className="flex flex-col gap-xl">
        {/* Main Headline */}
        {mainHeadline && (
          <Link
            to={`/article/${mainHeadline.slug}`}
            className="relative w-full h-[18.75rem] overflow-hidden rounded-lg group"
          >
            {/* Background Image */}
            <img
              src={
                mainHeadline.media?.path
                  ? mediaApi.getFileUrl(mainHeadline.media.path)
                  : "/images/Picture.svg"
              }
              alt={mainHeadline.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-48% to-black/30 rounded-lg" />

            {/* Headline Badge */}
            <div className="absolute top-0 left-0 p-2">
              <div className="bg-[#0054D4] text-white text-xs px-2 py-1 rounded-md font-normal w-[5.75rem] text-center">
                Headline
              </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-white leading-7 line-clamp-2">
                {mainHeadline.title}
              </h2>
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-xs font-normal">
                  {new Date(mainHeadline.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <div className="w-px h-3 bg-white/40" />
                <time className="text-xs font-normal">
                  {getRelativeTime(mainHeadline.created_at)}
                </time>
              </div>
            </div>
          </Link>
        )}

        {/* Sub Headlines List */}
        {subHeadlines.length > 0 && (
          <div className="flex flex-col">
            {subHeadlines.map((item, index) => (
              <Link
                key={item.id}
                to={`/article/${item.slug}`}
                className="flex flex-col gap-2 py-3 hover:bg-accent/5 transition-colors group cursor-pointer border-b border-border-subtle last:border-0"
              >
                <h4 className="text-base font-bold text-foreground leading-6 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2">
                  {item.categories && item.categories.length > 0 && (
                    <Tag
                      label={item.categories[0].name}
                      className="bg-secondary/50 border-subtle h-6"
                    />
                  )}
                  <time className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(item.created_at)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
