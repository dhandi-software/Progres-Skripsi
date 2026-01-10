/**
 * LabeledSwitch & SwitchCard Components
 *
 * @example
 * <LabeledSwitch label="This is label" description="This is description" />
 * <LabeledSwitch label="This is label" description="This is description" switchPosition="right"/>
 * <SwitchCard label="This is label" description="This is description" />
 * <SwitchCard label="This is label" description="This is description" switchPosition="right"/>
 */

import { Root, Thumb } from "@radix-ui/react-switch"
import { Card } from "~/components/ui/card"
import { cn } from "~/lib/utils"

/**
 * Base Switch component.
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof Root>) {
  return (
    <Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          "bg-background",
          "data-[state=checked]:translate-x-[calc(100%)] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </Root>
  )
}

interface SwitchPropsWithLabel extends React.ComponentProps<typeof Root> {
  label: string
  description: string
  switchPosition?: "left" | "right"
}

/**
 * LabeledSwitch
 */
function LabeledSwitch({ label, description, switchPosition = "left", ...props }: SwitchPropsWithLabel) {
  return (
    <div className="flex flex-row w-fit gap-x-md">
      {switchPosition === "left" && <Switch {...props} />}
      <div className="flex flex-col">
        <span className="text-label text-foreground">{label}</span>
        <span className="text-paragraph-sm text-muted-foreground">{description}</span>
      </div>
      {switchPosition === "right" && <Switch {...props} />}
    </div>
  )
}

/**
 * SwitchCard
 */
function SwitchCard({ ...props }: SwitchPropsWithLabel) {
  return (
    <Card className="p-4 shadow-xs rounded-md bg-background border border-subtle">
      <LabeledSwitch {...props} />
    </Card>
  )
}

export { Switch, LabeledSwitch, SwitchCard }
