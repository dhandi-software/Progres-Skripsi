import { Link } from "react-router";
import type { NewsListItem } from "~/api/types";
import { getRelativeTime } from "~/lib/timeUtils";
import { Tag } from "~/components/ui/tag";
import { mediaApi } from "~/api/mediaApi";

interface HeadlineNewsSectionDesktopProps {
  headlines: NewsListItem[];
  loading?: boolean;
  error?: string;
}

export function HeadlineNewsSectionDesktop({
  headlines,
  loading,
  error,
}: HeadlineNewsSectionDesktopProps) {
  // Don't render if no headline data
  if (headlines.length === 0 && !loading && !error) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full h-[22.5rem] flex items-center justify-center bg-muted rounded-lg">
        <div className="text-muted-foreground animate-pulse">Loading headlines...</div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail for better UX
  }

  const mainHeadline = headlines[0];
  const subHeadlines = headlines.slice(1, 4);

  return (
    <div className="flex w-full gap-6 h-[22.5rem]">
      {/* Left Section - Main Headline */}
      {mainHeadline && (
        <Link
          to={`/article/${mainHeadline.slug}`}
          className="relative w-[37.5rem] h-full overflow-hidden rounded-lg group cursor-pointer"
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
          <div className="absolute top-0 right-0 p-2">
            <div className="bg-[#0054D4] text-white text-xs px-2 py-1 rounded-md font-normal w-[6.25rem] text-center">
              Headline
            </div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col gap-1">
            <h2 className="text-2xl font-semibold text-white leading-8 line-clamp-2">
              {mainHeadline.title}
            </h2>
            <div className="flex items-center gap-2 text-white/90">
              <span className="text-sm font-normal">
                {new Date(mainHeadline.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <div className="w-px h-4 bg-white/40 mx-2" />
              <time className="text-sm font-normal">
                {getRelativeTime(mainHeadline.created_at)}
              </time>
            </div>
          </div>
        </Link>
      )}

      {/* Right Section - Smaller Headlines */}
      <div className="flex flex-col gap-[0.75rem] flex-1">
        {subHeadlines.map((item) => (
          <Link
            key={item.id}
            to={`/article/${item.slug}`}
            className="flex flex-col gap-3 p-0 hover:bg-accent/5 transition-colors group cursor-pointer border-b border-subtle last:border-0 pb-3 last:pb-0 h-[7rem] justify-center"
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
    </div>
  );
}
