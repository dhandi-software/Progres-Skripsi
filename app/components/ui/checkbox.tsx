import { Root, Indicator } from "@radix-ui/react-checkbox";
import { CheckIcon, Minus } from "lucide-react";

import { cn } from "~/lib/utils";

interface CheckboxProps extends React.ComponentProps<typeof Root> {
    label: string;
    description: string;
}

/**
 * A customizable checkbox component built on top of Radix UI's `Checkbox` component.
 * Supports a "checked" state (true/false) and an "indeterminate" state (string 'indeterminate').
 * Supports a `className` prop for custom styling.
 *
 * @example
 * <Checkbox label="Label" description="Description" checked={true} />
 */
function Checkbox({
    className,
    checked,
    onCheckedChange,
    ...props
}: React.ComponentProps<typeof Root>) {
    return (
        <Root
            data-slot="checkbox"
            className={cn(
                "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-lg shrink-0 rounded-sm border shadow-xs transition-shadow outline-none focus-visible:ring-[0.188rem] disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            checked={checked}
            onCheckedChange={onCheckedChange}
            {...props}
        >
            <Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-background transition-none"
            >
                {checked == "indeterminate" ? (
                    <Minus className="size-3.5" />
                ) : (
                    <CheckIcon className="size-3.5" />
                )}
            </Indicator>
        </Root>
    );
}

/**
 * LabeledCheckbox
 *
 * A checkbox component with a label and optional description that can be used
 * as a single component.
 *
 * @example
 * <LabeledCheckbox label="This is the label" description="This is the description" />
 * <LabeledCheckbox label="This is the label" description="This is the description" disabled />
 * <LabeledCheckbox checked="indeterminate" label="This is the label" description="This is the description" disabled />
 *
 * @param label - The label for the checkbox.
 * @param description - The description for the checkbox.
 * @param disabled - Whether the checkbox is disabled or not. Defaults to false.
 * @param props - The props to pass to the `Checkbox` component.
 * @param checked - The checked state of the checkbox. Can be true, false, or 'indeterminate'.
 * @param onCheckedChange - The function to call when the checked state changes.
 */
function LabeledCheckbox({
    label,
    description,
    disabled,
    checked,
    onCheckedChange,
    ...props
}: CheckboxProps) {
    return (
        <div className="flex flex-row gap-x-sm">
            <Checkbox
                disabled={disabled}
                {...props}
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
            <div className="flex flex-col gap-y-xs">
                <span
                    className={cn(
                        "text-label leading-none",
                        disabled
                            ? "text-brand-secondary-muted-foreground"
                            : "text-foreground",
                    )}
                >
                    {label}
                </span>
                <span
                    className={cn(
                        "text-desc leading-none",
                        disabled
                            ? "text-brand-secondary-muted-foreground"
                            : "text-muted-foreground",
                    )}
                >
                    {description}
                </span>
            </div>
        </div>
    );
}

export { Checkbox, LabeledCheckbox };
