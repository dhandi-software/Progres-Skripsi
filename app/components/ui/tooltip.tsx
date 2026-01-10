/*

 TOP 
 <TooltipAtom side="top">
 Inform every data, form, and interaction using this tooltip.
</TooltipAtom>

 LEFT 
<TooltipAtom side="left">
 Inform every data, form, and interaction using this tooltip.
</TooltipAtom>

 RIGHT 
<TooltipAtom side="right">
 Inform every data, form, and interaction using this tooltip.
</TooltipAtom>

 BOTTOM 
<TooltipAtom side="bottom">
 Inform every data, form, and interaction using this tooltip.
</TooltipAtom>

<Tooltip>
  <TooltipTrigger className="inline-flex items-center px-md py-sm rounded-md bg-muted">
    Hover / focus saya
  </TooltipTrigger>

  <TooltipContent side="top">
    Inform every data, form, and interaction using this tooltip.
  </TooltipContent>
</Tooltip>

*/

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "~/lib/utils";

const TOOLTIP_BOX =
  "w-[12.625rem] min-h-[3.4375rem] rounded-base shadow-md pt-sm pr-md pb-sm pl-md text-xs leading-4 tracking-[0.0025em]";
const TOOLTIP_COLOR = "bg-zinc-900 text-zinc-100";
const TOOLTIP_TEXT = "block max-w-[11.125rem] min-h-8 font-normal";
const TOOLTIP_GROUP = "group z-50";
const ARROW_BASE = "fill-current";
const ARROW_SIDE_FILL = "text-zinc-900";

/* ========================= Provider (template shadcn) ======================= */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger(
  props: React.ComponentProps<typeof TooltipPrimitive.Trigger>
) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          TOOLTIP_GROUP,
          TOOLTIP_BOX,
          TOOLTIP_COLOR,
          "text-balance",
          className
        )}
        {...props}
      >
        <span className={TOOLTIP_TEXT}>{children}</span>

        <TooltipPrimitive.Arrow
          width={12}
          height={8}
          className={cn(ARROW_BASE, ARROW_SIDE_FILL)}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

type Side = "top" | "bottom" | "left" | "right";

function TooltipAtom({
  side = "bottom",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { side?: Side }) {
  return (
    <div
      data-slot="tooltip-atom"
      data-side={side}
      className={cn("relative", TOOLTIP_BOX, TOOLTIP_COLOR, className)}
      {...props}
    >
      <span className={TOOLTIP_TEXT}>{children}</span>

      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        aria-hidden="true"
        className={cn(
          "absolute",
          // bottom: 0deg
          side === "bottom" && "left-1/2 -translate-x-1/2 -bottom-sm rotate-0",
          // top: -180deg
          side === "top" && "left-1/2 -translate-x-1/2 -top-sm -rotate-180",
          // right: 90deg
          side === "right" && "top-1/2 -translate-y-1/2 -right-sm rotate-90",
          // left: -90deg
          side === "left" && "top-1/2 -translate-y-1/2 -left-sm  -rotate-90"
        )}
      >
        <polygon points="0,0 12,0 6,8" fill="currentColor" />
      </svg>
    </div>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipAtom,
};
