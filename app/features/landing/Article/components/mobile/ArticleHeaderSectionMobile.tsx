import { Share2 } from "lucide-react";
import Breadcrumb from "~/components/template/breadcrumb";
import type { ArticleDetail } from "~/api/types";

interface ArticleHeaderSectionMobileProps {
  article: ArticleDetail;
}

export function ArticleHeaderSectionMobile({
  article,
}: ArticleHeaderSectionMobileProps) {
  // Format date
  const date = new Date(article.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }) + " WIB";

  return (
    <>
      {/* Breadcrumb */}
      <div className="w-full">
        <Breadcrumb />
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground leading-tight">
        {article.title}
      </h1>

      {/* Meta Info & Share */}
      <div className="w-full flex items-center justify-between gap-2">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>Created by {article.user.name}</span>
          <div className="flex items-center gap-2">
            <time>{formattedDate}</time>
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Icon Share */}
        <button
          aria-label="Share article"
          className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </>
  );
}
