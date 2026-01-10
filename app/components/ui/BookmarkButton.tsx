import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type Props = {
    defaultActive?: boolean;
    onChange?: (next: boolean) => void;
    className?: string;
    ariaLabel?: string;
};

export function BookmarkButton({
    defaultActive = false,
    onChange,
    className,
    ariaLabel = "Bookmark",
}: Props) {
    const [active, setActive] = useState(defaultActive);

    const toggle = () => {
        const next = !active;
        setActive(next);
        onChange?.(next);
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size="lg"
            aria-pressed={active}
            aria-label={ariaLabel}
            onClick={toggle}
            className={cn(
                "!w-[2.5rem] !h-[2.5rem] !p-sm rounded-md",
                "[&_svg]:!w-4 [&_svg]:!h-4",
                className
            )}
        >
            <Bookmark
                className={cn(
                    "text-secondary-foreground",
                    active && "fill-foreground"
                )}
            />
        </Button>
    );
}
