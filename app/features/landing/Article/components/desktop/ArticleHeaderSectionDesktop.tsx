import { Share2 } from "lucide-react";
import Breadcrumb from "~/components/template/breadcrumb";
import type { ArticleDetail } from "~/api/types";

interface ArticleHeaderSectionDesktopProps {
  article: ArticleDetail;
  loading?: boolean;
}

export function ArticleHeaderSectionDesktop({
  article,
  loading,
}: ArticleHeaderSectionDesktopProps) {
  if (loading) {
    return (
      <>
        <div className="w-full pb-6 border-subtle">
          <Breadcrumb />
        </div>
        <div className="text-muted-foreground">Loading...</div>
      </>
    );
  }

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
      <div className="w-full pb-6 border-subtle">
        <Breadcrumb />
      </div>

      {/* Title & Meta */}
      <div className="w-full flex flex-col gap-3">
        <h1 className="text-subheading-h4 text-foreground">
          {article.title}
        </h1>

        <div className="w-full flex items-center justify-between">
          {/* Date & Time */}
          <div className="flex items-center h-6 gap-3">
            <span className="text-paragraph-sm text-muted-foreground">
              Created by {article.user.name}
            </span>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-muted-foreground/60" />
            <time className="text-paragraph-sm text-muted-foreground">
              {formattedDate}
            </time>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-muted-foreground/60" />
            <span className="text-paragraph-sm text-muted-foreground">
              {formattedTime}
            </span>
          </div>

          {/* Icon Share */}
          <button
            aria-label="Share article"
            className="inline-flex items-center justify-center w-6 h-6"
          >
            <Share2 className="w-6 h-6 text-foreground cursor-pointer" />
          </button>
        </div>
      </div>
    </>
  );
}
