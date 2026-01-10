/**
 * CardNews Component
 *
 * A flexible and reusable news card component that can display
 * an image, title, tags, timestamp, and description — designed
 * to support both vertical and horizontal layouts.
 *
 * Props:
 * - `title` — main heading of the card (string)
 * - `imageSrc` — URL of the image displayed on the card (string)
 * - `timeText` — text for the publication time (string)
 * - `description` — optional short description (string)
 * - `tagLabel` — single tag or array of tags (string | string[])
 * - `trending` — highlights the card as "Trending" (boolean)
 * - `boldTitle` — makes the title font bold (boolean)
 * - `lineClamp` — limits how many lines of the title are shown (number)
 * - `flow` — layout direction, either `"vertical"` (default) or `"horizontal"`
 * - `imageSize` — optional `{ width, height }` override for image dimensions
 * - `className` — additional custom class for the wrapper
 * - `tagPosition` — position of tags: "top" (above title), "bottom" (below title), "both"
 * - `videoPlay` — show play button overlay on image for videos
 * - `views` — view count text (e.g., "10K views")
 * - `showMore` — show "More" button next to tags
 * - `onMoreClick` — callback when More button is clicked
 *
 * Usage:
 *
 * ```tsx
 * import CardNews from "@/components/ui/card-news";
 *
 * export default function Example() {
 *   return (
 *     <div className="grid gap-6 md:grid-cols-2">
 *       <CardNews
 *         title="AI Revolution: How Developers Are Adapting"
 *         imageSrc="/images/ai-news.jpg"
 *         timeText="2 hours ago"
 *         description="Developers are quickly adapting to AI-driven workflows with new tools and frameworks emerging every month."
 *         tagLabel={["AI", "Tech News"]}
 *         trending
 *         boldTitle
 *         lineClamp={2}
 *         flow="horizontal"
 *         tagPosition="bottom"
 *       />
 *
 *       <CardNews
 *         title="React 19 Released with Exciting Features"
 *         imageSrc="/images/react19.png"
 *         timeText="Yesterday"
 *         tagLabel="JavaScript"
 *         flow="vertical"
 *         tagPosition="top"
 *         showMore
 *       />
 *
 *       <CardNews
 *         title="Latest Tech Video"
 *         imageSrc="/images/video-thumb.jpg"
 *         timeText="2 hours ago"
 *         videoPlay
 *         views="10K views"
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Notes:
 * - When `flow="horizontal"`, the image appears on the left and the description is shown.
 * - When `flow="vertical"`, the card stacks naturally.
 * - `tagPosition` controls where tags appear relative to the title.
 * - If `trending` is true, a red "Trending" badge appears on the image corner.
 * - If `videoPlay` is true, a play button overlay appears centered on the image.
 * - Use `lineClamp` to prevent overly long titles from breaking the layout.
 */

import { cn } from "~/lib/utils";
import { Tag } from "~/components/ui/tag";
import { Link } from "react-router";
import { CirclePlay, MoreHorizontal } from "lucide-react";

type CardNewsProps = {
    className?: string;
    title?: string;
    imageSrc?: string;
    timeText?: string;
    lineClamp?: number;
    trending?: boolean;
    flow?: "vertical" | "horizontal";
    description?: string;
    boldTitle?: boolean;
    imageSize?: { width?: string; height?: string };
    tagLabel?: string | string[];
    slug?: string;
    tagPosition?: "top" | "bottom" | "both";
    videoPlay?: boolean;
    views?: string;
    showMore?: boolean;
    onMoreClick?: () => void;
};

export default function CardNews({
    className,
    title = "",
    imageSrc = "",
    timeText = "",
    lineClamp = 0,
    trending = false,
    flow = "vertical",
    description = "",
    boldTitle = false,
    imageSize,
    tagLabel,
    slug,
    tagPosition,
    videoPlay = false,
    views,
    showMore = false,
    onMoreClick,
}: CardNewsProps) {
    const isHorizontal = flow === "horizontal";

    // Default tag position based on flow if not specified
    const effectiveTagPosition = tagPosition ?? (isHorizontal ? "bottom" : "top");

    const defaultWidth = isHorizontal ? "20.313rem" : "100%";
    const defaultHeight = isHorizontal ? "8.25rem" : "10rem";

    const imgWidth = imageSize?.width || defaultWidth;
    const imgHeight = imageSize?.height || defaultHeight;

    const renderTags = () =>
        tagLabel && (
            <div className="flex flex-wrap gap-2">
                {Array.isArray(tagLabel) ? (
                    tagLabel.map((label, idx) => (
                        <Tag key={idx} label={label} className="max-w-fit" />
                    ))
                ) : (
                    <Tag label={tagLabel} className="max-w-fit" />
                )}
            </div>
        );

    const renderTagRow = () => (
        <div className="flex items-center w-full">
            <div className="flex-1 flex gap-2 items-start">
                {renderTags()}
            </div>
            {showMore && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoreClick?.();
                    }}
                    className="text-muted-foreground hover:text-foreground p-1"
                    aria-label="More options"
                >
                    <MoreHorizontal className="size-4" />
                </button>
            )}
        </div>
    );

    const shouldShowTagTop = effectiveTagPosition === "top" || effectiveTagPosition === "both";
    const shouldShowTagBottom = effectiveTagPosition === "bottom" || effectiveTagPosition === "both";

    const cardContent = (
        <div
            className={cn(
                "w-[18.625rem] h-fit flex",
                isHorizontal
                    ? "w-full flex-row gap-xl items-start"
                    : "flex-col gap-sm",
                slug ? "cursor-pointer hover:opacity-80 transition-opacity" : "",
                className,
            )}
        >
            {imageSrc && (
                <div
                    className={cn(
                        "group relative overflow-hidden rounded-md",
                        isHorizontal ? `h-[${imgHeight}] w-[${imgWidth}]` : "",
                    )}
                    style={{
                        height: imgHeight,
                        width: isHorizontal ? imgWidth : "100%",
                        flexShrink: 0,
                    }}
                >
                    <img
                        src={imageSrc}
                        alt=""
                        className="rounded-md object-cover size-full"
                    />
                    {trending && (
                        <div className="absolute top-0 left-0 w-[4.375rem] h-[2.25rem] bg-[#E92F1C] p-[0.625rem] text-xs font-semibold text-primary-foreground rounded-tl-[0.5rem] rounded-br-[0.5rem] flex items-center justify-center">
                            Trending
                        </div>
                    )}
                    {videoPlay && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 rounded-full p-xs size-[34px] flex items-center justify-center">
                            <CirclePlay className="text-neutral-200 size-full" />
                        </div>
                    )}
                </div>
            )}

            <div className="w-full flex flex-col gap-md">
                {/* Render tag di atas title kalau top atau both */}
                {shouldShowTagTop && tagLabel && renderTagRow()}

                <h4
                    className={cn(
                        "w-full text-foreground text-paragraph",
                        boldTitle ? "font-bold" : "font-normal",
                        lineClamp > 0 && `line-clamp-${lineClamp}`,
                    )}
                >
                    {title}
                </h4>

                {/* Render tag di bawah title kalau bottom atau both */}
                {shouldShowTagBottom && tagLabel && renderTagRow()}

                {isHorizontal && description && (
                    <h3 className="text-paragraph text-muted-foreground line-clamp-1">
                        {description}
                    </h3>
                )}

                <div className="flex items-center gap-md">
                    <time className="text-label-sm text-muted-foreground">
                        {timeText}
                    </time>
                    {views && (
                        <span className="text-label-sm text-muted-foreground">
                            {views}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    // Wrap with Link if slug is provided
    if (slug) {
        return (
            <Link to={`/article/${slug}`} className="no-underline">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
