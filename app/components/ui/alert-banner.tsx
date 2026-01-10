/**
 * AlertBanner Component
 *
 * A flexible alert/banner component that supports:
 * - Optional image on the left side (via `src`)
 * - Optional custom icon (via `icon`)
 * - Customizable title and description
 * - Custom actions/buttons on the right (pass as `actions`)
 * - A close (X) icon with a click handler
 *
 * Example Usage:
 *
 * ```tsx
 * <AlertBanner
 *   title="This is title"
 *   description="This is description"
 *   src="https://picsum.photos/200"
 *   icon={<InfoIcon size={16} />}
 *   actions={
 *     <>
 *       <Button size="sm" variant="outline">Cancel</Button>
 *       <Button size="sm">Confirm</Button>
 *     </>
 *   }
 *   onCloseClick={() => {
 *     console.log("Banner closed")
 *   }}
 * />
 * ```
 */

import { X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { cn } from "~/lib/utils";

interface AlertBannerProps {
    className?: string;
    /** Heading text of the alert */
    title?: string;
    /** Description underneath the title */
    description?: string;
    /** Optional left-side icon (ReactNode) */
    icon?: React.ReactNode;
    /** Optional image URL to show on the very left */
    src?: string;
    /** Custom action buttons (will appear on the right) */
    actions?: React.ReactNode;
    /** Handler called when user clicks on the close (X) icon */
    onCloseClick?: () => void;
}

export default function AlertBanner({
    className,
    title,
    description,
    icon,
    actions,
    src,
    onCloseClick,
}: AlertBannerProps) {
    return (
        <Alert
            className={cn(
                "flex flex-row gap-md justify-between items-center !rounded-md",
                className
            )}
        >
            <div className="flex flex-row items-center justify-center">
                {src && (
                    <img
                        src={src}
                        className="w-[5rem] rounded-l-sm"
                        loading="lazy"
                        alt=""
                    />
                )}

                <div className="flex gap-md pl-lg py-md">
                    {icon}
                    <div className="flex flex-col w-full">
                        {title && <AlertTitle>{title}</AlertTitle>}
                        <AlertDescription
                            className={cn(!title && "!text-foreground")}
                        >
                            {description}
                        </AlertDescription>
                    </div>
                </div>
            </div>

            <div className="flex flex-row gap-sm items-center pr-lg py-md">
                {actions}
                {onCloseClick && (
                    <X
                        size={14}
                        className="cursor-pointer"
                        onClick={onCloseClick}
                    />
                )}
            </div>
        </Alert>
    );
}
