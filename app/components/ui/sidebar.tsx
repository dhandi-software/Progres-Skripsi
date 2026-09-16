"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

// import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_STORAGE_KEY = "sidebar_width";
const SIDEBAR_WIDTH = "22rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "4.5rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 320;

type SidebarContextProps = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
    isResizing: boolean;
    startResizing: (e: React.MouseEvent) => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }

    return context;
}

function SidebarProvider({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    isMobile: isMobileProp,
    className,
    style,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    isMobile?: boolean;
}) {
    const isMobile = isMobileProp ?? false;
    const [openMobile, setOpenMobile] = React.useState(false);

    // Internal state of the sidebar.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === "function" ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [setOpenProp, open],
    );

    // Sidebar custom resizable width state
    const [sidebarWidth, setSidebarWidthState] = React.useState<number>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            if (saved) {
                const parsed = parseInt(saved, 10);
                if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
                    return parsed;
                }
            }
        }
        return DEFAULT_SIDEBAR_WIDTH;
    });
    const [isResizing, setIsResizing] = React.useState(false);

    const setSidebarWidth = React.useCallback((width: number) => {
        const clamped = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, width));
        setSidebarWidthState(clamped);
        if (typeof window !== "undefined") {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, clamped.toString());
        }
    }, []);

    const startResizing = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsResizing(true);
            const startX = e.clientX;
            const initialWidth = sidebarWidth;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const delta = moveEvent.clientX - startX;
                const newWidth = initialWidth + delta;

                if (newWidth < 140) {
                    setOpen(false);
                } else {
                    if (!open) {
                        setOpen(true);
                    }
                    const clamped = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));
                    setSidebarWidthState(clamped);
                }
            };

            const handleMouseUp = () => {
                setIsResizing(false);
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("mouseup", handleMouseUp);
                if (typeof window !== "undefined") {
                    setSidebarWidthState((current) => {
                        localStorage.setItem(SIDEBAR_STORAGE_KEY, current.toString());
                        return current;
                    });
                }
            };

            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        },
        [sidebarWidth, open, setOpen],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
        return isMobile
            ? setOpenMobile((open) => !open)
            : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Keyboard shortcut to toggle sidebar.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";
    const currentWidthCss = state === "collapsed" ? SIDEBAR_WIDTH_ICON : `${sidebarWidth}px`;

    const contextValue = React.useMemo<SidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            sidebarWidth,
            setSidebarWidth,
            isResizing,
            startResizing,
        }),
        [
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            sidebarWidth,
            setSidebarWidth,
            isResizing,
            startResizing,
        ],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    data-slot="sidebar-wrapper"
                    style={
                        {
                            "--sidebar-width": currentWidthCss,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
                        isResizing && "select-none cursor-col-resize",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
}

function Sidebar({
    side = "left",
    variant = "sidebar",
    collapsible = "icon",
    className,
    children,
    ...props
}: React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
}) {
    const { isMobile, state, openMobile, setOpenMobile, isResizing } = useSidebar();

    if (collapsible === "none") {
        return (
            <div
                data-slot="sidebar"
                className={cn(
                    "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    data-mobile="true"
                    className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>
                            Displays the mobile sidebar.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            className="group peer text-sidebar-foreground hidden md:block relative"
            data-state={state}
            data-collapsible={state === "collapsed" ? collapsible : ""}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            {/* This handles the sidebar gap on desktop */}
            <div
                data-slot="sidebar-gap"
                className={cn(
                    "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
                    isResizing && "transition-none!",
                    "group-data-[collapsible=offcanvas]:w-0",
                    "group-data-[side=right]:rotate-180",
                    variant === "floating" || variant === "inset"
                        ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
                )}
            />
            <div
                data-slot="sidebar-container"
                className={cn(
                    "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
                    isResizing && "transition-none!",
                    side === "left"
                        ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                        : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                    variant === "floating" || variant === "inset"
                        ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
                        : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=right]:border-l",
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                    className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm relative"
                >
                    {children}
                    <SidebarRail />
                </div>
            </div>
        </div>
    );
}

function SidebarTrigger({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { toggleSidebar } = useSidebar();

    return (
        <Button
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            variant="ghost"
            size="icon"
            className={cn("w-[42px] h-[42px]", className)}
            onClick={(event) => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            <Menu size={18} className="text-[#119DA4]" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"div">) {
    const { toggleSidebar, startResizing, isResizing, state } = useSidebar();

    return (
        <div
            data-sidebar="rail"
            data-slot="sidebar-rail"
            aria-label="Resize or Toggle Sidebar"
            onMouseDown={startResizing}
            title="Tarik untuk ubah ukuran, klik tombol untuk ciutkan/buka sidebar"
            className={cn(
                "absolute inset-y-0 -right-2 z-30 hidden w-4 cursor-col-resize select-none sm:flex items-center justify-center group/rail",
                className,
            )}
            {...props}
        >
            {/* Drag Handle Visual Line */}
            <div
                className={cn(
                    "h-full w-[3px] bg-transparent group-hover/rail:bg-[#119DA4]/40 transition-colors duration-150 rounded-full",
                    isResizing && "bg-[#119DA4] w-[4px]"
                )}
            />
            {/* Quick Toggle Collapse/Expand Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                }}
                className={cn(
                    "absolute top-12 -right-3.5 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-[#119DA4] hover:border-[#119DA4] transition-all opacity-0 group-hover/rail:opacity-100 z-40 cursor-pointer",
                    state === "collapsed" && "opacity-100 right-[-14px]"
                )}
                title={state === "collapsed" ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
                {state === "collapsed" ? (
                    <ChevronRight className="w-4 h-4 text-[#119DA4]" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                )}
            </button>
        </div>
    );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn(
                "bg-background relative flex w-full flex-1 flex-col",
                "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
                className,
            )}
            {...props}
        />
    );
}

function SidebarInput({
    className,
    ...props
}: React.ComponentProps<typeof Input>) {
    return (
        <Input
            data-slot="sidebar-input"
            data-sidebar="input"
            className={cn("bg-background h-8 w-full shadow-none", className)}
            {...props}
        />
    );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className={cn("flex flex-col pb-3xl", className)}
            {...props}
        >
            <div className="flex flex-row gap-x-sm items-center">
                <img
                    className="w-2xl h-[2.023rem]"
                    src="/icons/ic_logo_primary.png"
                    loading="lazy"
                    alt="logo"
                />
                <span className="text-[1.5rem] font-[850] text-foreground">
                    MDP
                </span>
            </div>
        </div>
    );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-footer"
            data-sidebar="footer"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    );
}

function SidebarSeparator({
    className,
    ...props
}: React.ComponentProps<typeof Separator>) {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn("bg-sidebar-border mx-2 w-auto", className)}
            {...props}
        />
    );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-content"
            data-sidebar="content"
            className={cn(
                "flex flex-col gap-lg min-h-0 flex-1 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn("relative flex w-full min-w-0 flex-col", className)}
            {...props}
        />
    );
}

function SidebarGroupLabel({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="sidebar-group-label"
            data-sidebar="group-label"
            className={cn(
                "text-foreground text-subheading-h4 font-bold pb-lg ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupAction({
    className,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-group-action"
            data-sidebar="group-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 md:after:hidden",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarGroupContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            className={cn("w-full text-sm", className)}
            {...props}
        />
    );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn("flex w-full min-w-0 flex-col gap-sm ", className)}
            {...props}
        />
    );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={cn("group/menu-item relative", className)}
            {...props}
        />
    );
}

const sidebarMenuButtonVariants = cva(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-label-lg outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-black/5 hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-[2.75rem] text-sm group-data-[collapsible=icon]:p-0!",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

function SidebarMenuButton({
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
}: React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button = (
        <Comp
            data-slot="sidebar-menu-button"
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                sidebarMenuButtonVariants({ variant, size }),
                className,
            )}
            {...props}
        />
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent
                side="right"
                align="center"
                hidden={state !== "collapsed" || isMobile}
                {...tooltip}
            />
        </Tooltip>
    );
}

function SidebarMenuAction({
    className,
    asChild = false,
    showOnHover = false,
    ...props
}: React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
}) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="sidebar-menu-action"
            data-sidebar="menu-action"
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 md:after:hidden",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuBadge({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
                "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<"div"> & {
    showIcon?: boolean;
}) {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2",
                className,
            )}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        "--skeleton-width": width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
    return (
        <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
                "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

function SidebarMenuSubItem({
    className,
    ...props
}: React.ComponentProps<"li">) {
    return (
        <li
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            className={cn("group/menu-sub-item relative", className)}
            {...props}
        />
    );
}

function SidebarMenuSubButton({
    asChild = false,
    size = "md",
    isActive = false,
    className,
    ...props
}: React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
}) {
    const Comp = asChild ? Slot : "a";

    return (
        <Comp
            data-slot="sidebar-menu-sub-button"
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                "group-data-[collapsible=icon]:hidden",
                className,
            )}
            {...props}
        />
    );
}

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
