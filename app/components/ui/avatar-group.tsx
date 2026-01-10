import { Avatar, type AvatarProps } from "~/components/ui/avatar";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";

/**
 * AvatarGroup - Displays multiple avatars in a row with overlapping style.
 *
 * Props:
 * - `avatars` (AvatarProps[]): An array of avatar props. Each item should include at least `src` or `fallback`.
 * - Inherits props from `Avatar` for each item in the list.
 *
 * Styling:
 * - Uses `-space-x-4` to create an overlapping effect.
 * - Adds `outline-2 outline-white` to each avatar to visually separate them.
 *
 * Example usage:
 * ```tsx
 * const dummys = [
 *   { src: "https://picsum.photos/id/1011/200/200", fallback: "A" },
 *   { src: "https://picsum.photos/id/1012/200/200", fallback: "B" },
 *   { src: "https://picsum.photos/id/1013/200/200", fallback: "C" },
 * ];
 *
 * <AvatarGroup avatars={dummys} />
 * ```
 */
interface AvatarGroupProps {
    className?: React.HTMLAttributes<HTMLDivElement>["className"];
    avatars: AvatarProps[];
}
export function AvatarGroup({ className, avatars }: AvatarGroupProps) {
    return (
        <div className={cn("flex flex-row -space-x-4", className)}>
            {avatars.map((item, key) => (
                <Avatar
                    key={key}
                    {...item}
                    className="outline-2 outline-white"
                />
            ))}
        </div>
    );
}

/**
 * AvatarProfile - Displays a single avatar with a dropdown chevron icon.
 *
 * Props:
 * - Accepts all props from the `Avatar` component.
 * - Commonly used for profile menus or user selectors.
 *
 * Example usage:
 * ```tsx
 * <AvatarProfile
 *   src="https://picsum.photos/id/1025/200/200"
 *   fallback="JD"
 *   size="m"
 *   shape="round"
 *   name="John Doe"
 *   desc="Admin"
 * />
 * ```
 */
export function AvatarProfile({
    containerClassName,
    name,
    desc,
    labelOnly = true,
    ...props
}: React.ComponentProps<typeof Avatar> & {
    containerClassName?: string;
    name: string;
    desc: string;
    labelOnly?: boolean;
}) {
    return (
        <div
            className={cn(
                "group flex flex-row gap-x-sm items-center cursor-pointer",
                containerClassName
            )}
        >
            <Avatar
                className="group-hover:outline-2 hover:outline-foreground/20"
                {...props}
            />
            <div className="flex flex-col min-w-[4.625rem]">
                <span className="text-label text-foreground">{name}</span>
                <span className="text-desc text-muted-foreground">{desc}</span>
            </div>
            {!labelOnly && <ChevronsUpDown width={16} />}
        </div>
    );
}
