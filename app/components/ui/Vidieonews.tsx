{
    /* Using Component Video News
    
    Input Class Name
     <VideoNewsCard className="w-full h-fit" /> (Opsi)

    No Input Class Name
     <VideoNewsCard />
    */
}

import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { Tag } from "./tag";

type VideoNewsCardProps = {
    className?: string;
    videoSrc: string;
    title: string;
    duration?: string;
    timeText?: string;
    flow?: "horizontal" | "vertical";
    boldTitle?: boolean;
    imageSize?: { width: string; height: string };
    showMore?: boolean;
    lineClamp?: number;
    tagLabel?: string | string[];
};

export default function VideoNewsCard({
    className,
    videoSrc,
    duration = "00:00",
    timeText = "",
    flow = "horizontal",
    boldTitle = false,
    imageSize = { width: "", height: "" },
    showMore = false,
    lineClamp = 2,
    title,
    tagLabel,
}: VideoNewsCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const v = videoRef.current;
        if (v) {
            v.muted = true;
            v.volume = 0;
        }
    }, []);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = true;
        v.volume = 0;
        if (v.paused) {
            v.play();
            setIsPlaying(true);
        } else {
            v.pause();
            setIsPlaying(false);
        }
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = getYoutubeId(videoSrc);
    const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : "/images/Picture.svg";
    const youtubeUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : videoSrc;

    const redirectToYouTube = () => {
        window.open(youtubeUrl, "_blank");
    };

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

    const isHorizontal = flow === "horizontal";
    // Vertical Layout (Original)
    if (!isHorizontal) {
        return (
            <div className={cn("w-full flex flex-col gap-sm", className)}>
                <div className="group relative w-full h-[7.313rem] overflow-hidden rounded-lg">
                    <img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full block object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        onClick={redirectToYouTube}
                    />

                    <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none"
                    >
                        <div className="bg-black/40 rounded-full p-3 group-hover:bg-[#D94F24] transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5V19L19 12L8 5Z" />
                            </svg>
                        </div>
                    </div>

                    {duration && (
                        <span
                            aria-label="duration"
                            className="absolute -bottom-1 -right-1 inline-flex h-fit w-fit items-center rounded-tl-md rounded-br-md bg-[rgba(0,0,0,0.4)] px-1 py-1 text-background text-number-sm"
                        >
                            {duration}
                        </span>
                    )}
                </div>
                {renderTags()}

                <div className="w-full flex flex-col gap-3">
                    <div>
                        <h4
                            className={`w-full h-fit text-paragraph text-foreground font-bold leading-5 ${expanded ? "" : `line-clamp-${lineClamp}`} cursor-pointer`}
                            onClick={redirectToYouTube}
                        >
                            {title}
                        </h4>

                        {showMore && (
                            <div
                                onClick={() => setExpanded((s) => !s)}
                                className="mt-1 cursor-pointer text-link hover:text-link-hover text-paragraph-sm"
                            >
                                {expanded ? "Less" : "More"}
                            </div>
                        )}
                    </div>

                    {timeText && (
                        <time className="text-paragraph-sm text-muted-foreground">
                            {timeText}
                        </time>
                    )}
                </div>
            </div>
        );
    }

    // Horizontal Layout (New)
    const wrapperClass = cn(
        "w-full flex flex-row gap-4 items-start",
        className
    );

    const imageWrapperClass = cn(
        "group relative overflow-hidden rounded-lg shrink-0"
    );

    return (
        <div className={wrapperClass}>
            <div
                className={imageWrapperClass}
                style={imageSize.width ? { width: imageSize.width, height: imageSize.height } : undefined}
            >
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className=" w-full h-full  block object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={redirectToYouTube}
                />

                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-none"
                    onClick={redirectToYouTube}
                >
                    <div className="bg-black/40 rounded-full p-3 group-hover:bg-[#D94F24] transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 5V19L19 12L8 5Z" />
                        </svg>
                    </div>
                </div>

                {duration && (
                    <span
                        aria-label="duration"
                        className="absolute -bottom-1 -right-1 inline-flex h-fit w-fit items-center rounded-tl-md rounded-br-md bg-[rgba(0,0,0,0.4)] px-1 py-1 text-background text-number-sm"
                    >
                        {duration}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3 w-full">
                {renderTags()}

                <div className="w-full flex flex-col gap-1">
                    <div>
                        <h4
                            className={`w-full h-fit text-paragraph text-foreground font-bold leading-5 ${expanded ? "" : `line-clamp-${lineClamp}`} cursor-pointer`}
                            onClick={redirectToYouTube}
                        >
                            {title}
                        </h4>

                        {showMore && (
                            <div
                                onClick={() => setExpanded((s) => !s)}
                                className="mt-1 cursor-pointer text-link hover:text-link-hover text-paragraph-sm"
                            >
                                {expanded ? "Less" : "More"}
                            </div>
                        )}
                    </div>

                    {timeText && (
                        <time className="text-paragraph-sm text-muted-foreground">
                            {timeText}
                        </time>
                    )}
                </div>
            </div>
        </div>
    );
}
