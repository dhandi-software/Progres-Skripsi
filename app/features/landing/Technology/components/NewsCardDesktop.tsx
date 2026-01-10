import { Link } from "react-router";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";
import type { NewsListItem } from "~/api/types";

interface FeaturedCardProps {
  article: NewsListItem;
}

/**
 * Featured Card Component - Large horizontal card for desktop
 * Image: 340px × 224px, bg-#fafafa, bold title
 */
export function FeaturedCardDesktop({ article }: FeaturedCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-6 items-start bg-[#fafafa] rounded-lg group w-full"
    >
      {/* Image - 340px × 224px */}
      <div className="relative w-[21.25rem] h-[14rem] rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={
            article.media?.path
              ? mediaApi.getFileUrl(article.media.path)
              : "/images/Picture.svg"
          }
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Article Content */}
      <div className="flex flex-col gap-3 flex-1 px-3 justify-center self-stretch">
        <h4 className="text-lg font-bold text-foreground leading-7 line-clamp-3 group-hover:text-[#D94F24] transition-colors">
          {article.title}
        </h4>
        <time className="text-xs font-medium text-muted-foreground leading-4">
          {getRelativeTime(article.created_at)}
        </time>
      </div>
    </Link>
  );
}

/**
 * Regular Card Component - Smaller horizontal card for desktop
 * Uses CardNews component pattern
 */
export function RegularCardDesktop({ article }: FeaturedCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-6 items-start group"
    >
      {/* Image */}
      <div className="relative w-[21.25rem] h-[8.25rem] rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={
            article.media?.path
              ? mediaApi.getFileUrl(article.media.path)
              : "/images/Picture.svg"
          }
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      {/* Article Content */}
      <div className="flex flex-col gap-3 flex-1 justify-center">
        <h4 className="text-base font-normal text-foreground leading-6 line-clamp-2 group-hover:text-[#D94F24] transition-colors">
          {article.title}
        </h4>
        <time className="text-xs font-medium text-muted-foreground leading-4">
          {getRelativeTime(article.created_at)}
        </time>
      </div>
    </Link>
  );
}
