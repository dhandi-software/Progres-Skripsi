import { Link } from "react-router";
import { mediaApi } from "~/api/mediaApi";
import { getRelativeTime } from "~/lib/timeUtils";
import type { NewsListItem } from "~/api/types";

interface NewsCardProps {
  article: NewsListItem;
}

/**
 * Featured Card Component - Large vertical card for mobile
 * Image: full width × 224px height, bg-#fafafa, bold title with padding
 */
export function FeaturedCardMobile({ article }: NewsCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex flex-col gap-6 w-full bg-[#fafafa] rounded-lg group"
    >
      {/* Image - 224px height */}
      <div className="relative w-full h-[14rem] rounded-lg overflow-hidden">
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
      <div className="flex flex-col gap-3 px-3 pb-3">
        <h4 className="text-base font-bold text-foreground leading-6 line-clamp-3 group-hover:text-[#D94F24] transition-colors">
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
 * Regular Card Component - Horizontal card with 130px × 120px image for mobile
 */
export function RegularCardMobile({ article }: NewsCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex gap-4 items-center w-full group"
    >
      {/* Image - 130px × 120px */}
      <div className="relative w-[8.125rem] h-[7.5rem] rounded-lg overflow-hidden flex-shrink-0">
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
      <div className="flex flex-col gap-3 flex-1 self-stretch justify-center">
        <h4 className="text-base font-normal text-foreground leading-6 line-clamp-4 group-hover:text-[#D94F24] transition-colors">
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
 * Latest News Card - For horizontal scroll section
 * Image: 250px width × 117px height
 */
export function LatestNewsCardMobile({ article }: NewsCardProps) {
  return (
    <Link
      to={`/article/${article.slug}`}
      className="flex flex-col gap-2 w-[15.625rem] flex-shrink-0 group"
    >
      {/* Image - 117px height */}
      <div className="relative w-full h-[7.3125rem] rounded-lg overflow-hidden">
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
      <div className="flex flex-col gap-3">
        <h4 className="text-base font-bold text-foreground leading-6 line-clamp-3 h-[4.1875rem] overflow-hidden group-hover:text-[#D94F24] transition-colors">
          {article.title}
        </h4>
        <time className="text-xs font-medium text-muted-foreground leading-4">
          {getRelativeTime(article.created_at)}
        </time>
      </div>
    </Link>
  );
}
