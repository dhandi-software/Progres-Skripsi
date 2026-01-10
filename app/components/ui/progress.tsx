import { Root, Indicator } from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils"

const progressVariants = cva(
  "bg-black/10 relative w-full overflow-hidden rounded-full",
  {
    variants: {
      size: {
        s: "h-sm",
        m: "h-md",
        l: "h-lg",
      },
    },
    defaultVariants: {
      size: "m",
    },
  },
);

function Progress({
  className,
  value,
  size,
  ...props
}: React.ComponentProps<typeof Root> & VariantProps<typeof progressVariants>) {
  return (
    <Root
      data-slot="progress"
      className={cn(
        progressVariants({ size }),
        className
      )}
      {...props}
    >
      <Indicator
        data-slot="progress-indicator"
        className="bg-brand-primary rounded-full h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </Root>
  )
}

export { Progress }
