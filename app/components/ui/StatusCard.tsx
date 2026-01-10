/**
 * StatusCard Component
 *
 * Admin panel card for displaying and managing news articles and videos.
 * Supports both vertical (card) and horizontal (row) layouts.
 *
 * Based on Figma: https://www.figma.com/design/KhHHyCEaFdKStkKo13Gy9T/Intern-Project?node-id=314-2232
 */

import { Eye, Pencil, ImageOff, Timer, Play } from "lucide-react";
import { cn } from "~/lib/utils";

type StatusType = "no-image" | "draft" | "scheduled" | "published";

type StatusCardProps = {
    className?: string;
    title?: string;
    imageSrc?: string;
    timeText?: string;
    status?: StatusType;
    views?: string;
    lineClamp?: number;
    onEdit?: () => void;
    scheduleDate?: string;
    hidePublishedLabel?: boolean;
    isVideo?: boolean;
    flow?: "vertical" | "horizontal";
};

export default function StatusCard({
    className,
    title = "Rescue Efforts Enter Third Day for Dozens of Miners Trapped Underground After a Devastating Tunnel Collapse at Sumbawa Copper Mine.",
    imageSrc,
    timeText = "2 hours ago",
    status = "draft",
    views = "0",
    lineClamp = 0,
    onEdit,
    scheduleDate,
    hidePublishedLabel = false,
    isVideo = false,
    flow = "vertical",
}: StatusCardProps) {
    const isHorizontal = flow === "horizontal";

    const renderImageContent = () => {
        if (status === "no-image") {
            return (
                <div className="w-full h-full bg-muted flex flex-col items-center justify-center gap-2">
                    <div className="flex flex-col items-center gap-[0.438rem] w-[7.625rem]">
                        <ImageOff className="w-8 h-8 text-muted-foreground" />
                        <span className="text-label text-muted-foreground text-center w-full">
                            There is no image.
                        </span>
                    </div>
                </div>
            );
        }

        if (isVideo) {
            return (
                <div className="w-full h-full bg-muted relative">
                    {imageSrc ? (
                        <>
                            <img
                                src={imageSrc}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[2.125rem] h-[2.125rem] bg-black/40 rounded-[0.938rem] flex items-center justify-center">
                                    <Play
                                        className="w-4 h-4 text-neutral-200"
                                        fill="currentColor"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <div className="w-[2.125rem] h-[2.125rem] bg-background rounded-[0.938rem] border border-border-subtle flex items-center justify-center">
                                <Play
                                    className="w-4 h-4 text-foreground"
                                    fill="currentColor"
                                />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <>
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-muted" />
                )}
            </>
        );
    };

    const renderStatusBadge = () => {
        if (hidePublishedLabel && status === "published") {
            return null;
        }

        switch (status) {
            case "scheduled":
                return (
                    <div className="h-fit gap-1.5 flex items-center">
                        <Timer className="w-3.5 h-3.5 text-brand-primary-pressed" />
                        <span className="text-label-sm text-brand-primary-pressed">
                            {scheduleDate || "Scheduled"}
                        </span>
                    </div>
                );
            case "published":
                return (
                    <div className="h-fit">
                        <span className="text-label-sm text-[#0054D4]">
                            Published
                        </span>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit();
        }
    };

    // Horizontal (Row) Layout - based on Figma 314-2232
    if (isHorizontal) {
        return (
            <div
                className={cn(
                    "w-full flex flex-row gap-xl items-start",
                    className,
                )}
            >
                {/* Image Section */}
                <div
                    className="relative shrink-0 rounded-md overflow-hidden bg-muted"
                    style={{ width: "14.75rem", height: "8.25rem" }}
                >
                    {renderImageContent()}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col gap-md min-w-0">
                    {/* Status Badge */}
                    {renderStatusBadge()}

                    {/* Title */}
                    <h3
                        className={cn(
                            "w-full text-paragraph text-foreground break-words",
                            lineClamp > 0 && getLineClampClass(lineClamp),
                        )}
                        style={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {title}
                    </h3>

                    {/* Footer */}
                    <div className="flex items-center gap-md mt-auto">
                        <span className="text-label-sm text-muted-foreground">
                            {timeText}
                        </span>
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            <span className="text-label-sm text-muted-foreground">
                                {views} views
                            </span>
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <div
                    className="w-7 h-7 bg-background rounded-full border border-border-subtle flex items-center justify-center transition-colors cursor-pointer hover:bg-accent shrink-0"
                    onClick={handleEditClick}
                >
                    <Pencil className="w-4 h-4" />
                </div>
            </div>
        );
    }

    // Vertical (Card) Layout - default
    return (
        <div
            className={cn(
                "w-[17.5rem] h-full rounded-md overflow-hidden border border-border shadow-sm bg-card flex flex-col",
                className,
            )}
        >
            {/* Image Section - Fixed Height */}
            <div className="relative w-full h-[10rem] bg-muted flex-shrink-0 overflow-hidden rounded-t-md">
                {renderImageContent()}

                <div className="absolute bottom-2 right-2">
                    <div
                        className="w-7 h-7 bg-background rounded-full border border-border-subtle flex items-center justify-center transition-colors cursor-pointer hover:bg-accent"
                        onClick={handleEditClick}
                    >
                        <Pencil className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Content Section - Flexible but consistent */}
            <div className="flex flex-col p-3 gap-3 bg-card flex-1 min-h-0">
                {renderStatusBadge()}

                {/* Title with proper line clamp */}
                <h3
                    className={cn(
                        "w-full !text-paragraph text-foreground break-words",
                        lineClamp > 0 && getLineClampClass(lineClamp),
                    )}
                    style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {title}
                </h3>

                {/* Footer - pushed to bottom */}
                <div className="w-full h-fit flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-label-sm text-muted-foreground">
                            {timeText}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-label-sm text-muted-foreground">
                            {views} views
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function untuk line clamp classes
function getLineClampClass(lineClamp: number): string {
    const lineClampClasses: Record<number, string> = {
        1: "line-clamp-1",
        2: "line-clamp-2",
        3: "line-clamp-3",
        4: "line-clamp-4",
        5: "line-clamp-5",
        6: "line-clamp-6",
    };

    return lineClampClasses[lineClamp] || "";
}
