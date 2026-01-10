/**
 * RadioGroup Component
 *
 * A custom wrapper around Radix UI's `RadioGroup` and `RadioGroupItem`
 * components with additional styling, error states, and disabled states.
 *
 * ## Example Usage:
 *
 * ```tsx
 * const dummyRadioBox = [
 *   { label: "Option 1", value: "option-1" },
 *   { label: "Option 2", value: "option-2", error: true },
 *   { label: "Option 3", value: "option-3", disabled: true }
 * ];
 *
 * <RadioGroup
 *   className="gap-y-1"
 *   defaultValue={dummyRadioBox[0].value}
 *   items={dummyRadioBox}
 *   onValueChange={(value) => console.log(value)}
 * />
 * ```
 *
 * - `error` prop will highlight the radio button and label in a destructive color.
 * - `disabled` prop will make the option unselectable and reduce opacity.
 */

import { Root, Item, Indicator } from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { cn } from "~/lib/utils";

/** Props for the main RadioGroup component */
interface RadioGroupProps {
  /** Array of radio items with optional label, error, and disabled states */
  items?: RadioGroupUI[];
}

/** Structure of a single radio option */
interface RadioGroupUI {
  /** Text label displayed next to the radio button */
  label?: string;
  /** Value associated with this radio option */
  value: string;
  /** If `true`, shows the radio in error state */
  error?: boolean;
  /** If `true`, disables the radio option */
  disabled?: boolean;
}

/**
 * Main RadioGroup component.
 *
 * Renders a list of styled radio buttons with optional error and disabled states.
 */
function RadioGroup({
  className,
  items,
  children,
  ...props
}: React.ComponentProps<typeof Root> & RadioGroupProps) {
  if (items) {
    return (
      <Root
        data-slot="radio-group"
        className={cn("grid", className)}
        {...props}
      >
        {items.map((item, key) => {
          return (
            <div className="flex space-x-sm" key={key}>
              {/* Individual Radio Button */}
              <RadioGroupItem
                error={item.error}
                value={item.value}
                disabled={item.disabled}
              />
  
              {/* Optional Label */}
              {item.label && (
                <Label
                  aria-disabled={item.disabled}
                  className={cn(
                    "font-caption leading-none aria-disabled:text-muted",
                    item.error ? "text-brand-destructive" : "text-foreground"
                  )}
                >
                  {item.label}
                </Label>
              )}
            </div>
          );
        })}
      </Root>
    );
  }
  return <Root {...props}>{children}</Root>
}

/**
 * RadioGroupItem
 *
 * A single radio button item with custom styles.
 *
 * Props:
 * - `error` (boolean): Shows a red border and destructive outline when true.
 */
function RadioGroupItem({
  className,
  error,
  ...props
}: React.ComponentProps<typeof Item> & { error?: boolean }) {
  return (
    <Item
      aria-invalid={error}
      data-slot="radio-group-item"
      className={cn(
        // Base styles
        "size-4 border-border-focus aspect-square shrink-0 rounded-full border transition-[color,box-shadow]",
        // Checked state
        "data-[state=checked]:border-2",
        // Error state (aria-invalid)
        "aria-invalid:border-brand-destructive aria-invalid:outline-[2px] aria-invalid:outline-brand-destructive/40",
        // Focus state
        "focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Inner indicator (circle) */}
      <Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon
          className={cn(
            "stroke-transparent absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2",
            error ? "fill-brand-destructive" : "fill-border-focus"
          )}
        />
      </Indicator>
    </Item>
  );
}

export { RadioGroup, RadioGroupItem };
