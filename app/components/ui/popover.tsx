import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import {
    Root,
    Trigger,
    Content,
    Anchor,
    Portal,
} from "@radix-ui/react-popover";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

function Popover({ ...props }: React.ComponentProps<typeof Root>) {
    return <Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
    children,
    variant = "outline",
    size = "lg",
    ...props
}: React.ComponentProps<typeof Trigger> & {
    variant?:
        | "default"
        | "secondary"
        | "destructive"
        | "ghost"
        | "outline"
        | "link";
    size?: "sm" | "md" | "lg" | "icon";
}) {
    return (
        <Trigger asChild data-slot="popover-trigger">
            <Button variant={variant} size={size} {...props}>
                {children ?? "Buy Ticket"}
            </Button>
        </Trigger>
    );
}

function PopoverContent({
    className,
    align = "center",
    sideOffset = 4,
    ...props
}: React.ComponentProps<typeof Content>) {
    return (
        <Portal>
            <Content
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-popover-content-transform-origin) rounded-md border shadow-md outline-hidden",
                    className,
                )}
                {...props}
            />
        </Portal>
    );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof Anchor>) {
    return <Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
