import { Share2 } from "lucide-react";
import BreadcrumbArticle from "~/components/template/breadcrumb";

interface VideoArticleHeaderDesktopProps {
  title: string;
  author?: string;
  date?: string;
  time?: string;
}

export function VideoArticleHeaderDesktop({
  title,
  author = "MNI",
  date = "Wednesday, 17 September 2025",
  time = "12.45 WIB"
}: VideoArticleHeaderDesktopProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="w-full pb-6 border-subtle">
        <BreadcrumbArticle />
      </div>

      {/* Title & Meta */}
      <div className="w-full flex flex-col gap-3">
        <h1 className="text-subheading-h4 text-foreground">
          {title}
        </h1>

        <div className="w-full flex items-center justify-between">
          {/* Date & Time */}
          <div className="flex items-center h-6 gap-3">
            <span className="text-paragraph-sm text-muted-foreground">
              Created by {author}
            </span>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-muted-foreground/60" />
            <time className="text-paragraph-sm text-muted-foreground">
              {date}
            </time>
            <span className="inline-block w-[0.125rem] h-[0.125rem] rounded-full bg-muted-foreground/60" />
            <span className="text-paragraph-sm text-muted-foreground">
              {time}
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
