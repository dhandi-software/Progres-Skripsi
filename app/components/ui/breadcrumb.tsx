/*
DEFAULT (label & separator pakai text-foreground)
<BreadcrumbLink size="s" state="default">Home</BreadcrumbLink>
<BreadcrumbSeparator tone="default" />
<BreadcrumbEllipsis state="default" />

 MUTED / INACTIVE (label abu, separator abu)
<BreadcrumbLink size="s" state="inactive">Home</BreadcrumbLink>
<BreadcrumbSeparator tone="muted" />
<BreadcrumbEllipsis state="inactive" />

*/

import { Slot } from "@radix-ui/react-slot";
import { cn } from "~/lib/utils";

/* ===== helpers ===== */
type Size = "s" | "md";
type State = "default" | "inactive";
type Tone = "default" | "muted";

const sizeCls = (size: Size) =>
    size === "md"
        ? "text-label-lg font-medium"
        : "text-sm leading-5 font-medium";
const stateCls = (state: State) =>
    state === "inactive" ? "text-muted-foreground" : "text-foreground";

/* ===== containers ===== */
function Breadcrumb(props: React.ComponentProps<"nav">) {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
    return (
        <ol
            data-slot="breadcrumb-list"
            className={cn(
                "flex flex-wrap items-center break-words gap-md",
                className,
            )}
            {...props}
        />
    );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="breadcrumb-item"
            className={cn("inline-flex items-center gap-md", className)}
            {...props}
        />
    );
}

/* ===== atoms ===== */
function BreadcrumbLink({
    asChild,
    className,
    size = "s",
    state = "default",
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: Size;
    state?: State;
}) {
    const Comp = asChild ? Slot : "a";
    return (
        <Comp
            data-slot="breadcrumb-link"
            className={cn(
                "inline-flex items-center gap-md tracking-[0.0025em]",
                sizeCls(size),
                stateCls(state),
                className,
            )}
            {...props}
        />
    );
}

function BreadcrumbPage({
    className,
    size = "s",
    state = "default",
    ...props
}: React.ComponentProps<"span"> & { size?: Size; state?: State }) {
    return (
        <span
            data-slot="breadcrumb-page"
            role="link"
            aria-disabled="true"
            aria-current="page"
            className={cn(
                "inline-flex items-center tracking-[0.0025em]",
                sizeCls(size),
                stateCls(state),
                className,
            )}
            {...props}
        />
    );
}

function BreadcrumbSeparator({
    className,
    tone = "muted",
    ...props
}: React.ComponentProps<"li"> & { tone?: "default" | "muted" }) {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn("inline-flex items-center justify-center", className)}
            {...props}
        >
            <span
                className={cn(
                    "inline-flex items-center justify-center w-md h-md",
                    tone === "muted"
                        ? "text-muted-foreground"
                        : "text-foreground",
                )}
            >
                <svg
                    viewBox="0 0 12 12"
                    width="12"
                    height="12"
                    className="block"
                    shapeRendering="geometricPrecision"
                >
                    {/* x1=7.88,y1=1.12 → x2=4.12,y2=10.87 = arah “/” */}
                    <line
                        x1="7.88"
                        y1="1.12"
                        x2="4.12"
                        y2="10.87"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="square"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </span>
        </li>
    );
}

function BreadcrumbEllipsis({
    className,
    state = "default",
    ...props
}: React.ComponentProps<"span"> & { state?: "default" | "inactive" }) {
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            aria-hidden="true"
            className={cn(
                "inline-flex w-md h-5 items-center justify-center",

                "text-label-lg leading-5 font-label [letter-spacing:0.0025em]",
                state === "inactive"
                    ? "text-muted-foreground"
                    : "text-foreground",
                className,
            )}
            {...props}
        >
            {/* Ellipsis vector, mengikuti currentColor */}
            <svg
                viewBox="0 0 14 20"
                className="block w-3.5 h-5"
                aria-hidden="true"
            >
                {/* tiga dot di tengah secara horizontal */}
                <circle cx="3" cy="10" r="1" fill="currentColor" />
                <circle cx="7" cy="10" r="1" fill="currentColor" />
                <circle cx="11" cy="10" r="1" fill="currentColor" />
            </svg>
        </span>
    );
}

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
};
