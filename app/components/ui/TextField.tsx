/**
 * TextField Component
 *
 * A reusable input field component with optional label, error state, and variant layouts.
 * Styled with TailwindCSS, supports horizontal and vertical label alignment, and built-in
 * error display with icon.
 *
 * Components:
 * - TextField: The main component containing a label, input, and optional error message.
 *
 * Props:
 * - variant: Layout style for the label and input.
 *    - "vertical" → Label above the input.
 *    - "horizontal"   → Label aligned to the left of the input.
 * - type: Input type (e.g., "text", "password", "email", etc.).
 * - placeholder: Placeholder text for the input.
 * - size: Size of the label and input ("lg" or "sm").
 * - disabled: Disables the input and label when `true`.
 * - error: Shows the error state (border color changes to `border-brand-destructive`).
 * - errorMessage: Error message text displayed below the input (when `error` is `true`).
 * - label: Text for the label.
 * - onChange: Callback when the input value changes.
 * - onKeyDown: Callback when a key is pressed down in the input.
 * - multiline: Whether to render as textarea (for multi-line input).
 * - rows: Number of rows for textarea (when multiline is true).
 *
 * Example usage:
 * ```tsx
 * <TextField
 *   variant="horizontal"
 *   type="text"
 *   placeholder="Enter your name"
 *   size="lg"
 *   disabled={false}
 *   error={true}
 *   errorMessage="This field is required"
 *   label="Name"
 *   onChange={(e) => console.log(e.target.value)}
 *   onKeyDown={(e) => console.log('Key pressed:', e.key)}
 * />
 *
 *  Multi-line textarea
 * <TextField
 *   variant="vertical"
 *   placeholder="Enter your bio"
 *   size="sm"
 *   label="Bio"
 *   multiline={true}
 *   rows={4} Opsi
 *   onChange={(e) => console.log(e.target.value)}
 * />
 * ```
 */
import { useId } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

export type TextFieldProps = {
    variant?: "horizontal" | "vertical";
    size?: "lg" | "sm";
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    label?: string;
    id?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    multiline?: boolean;
    rows?: number;
};

export function TextField({
    variant = "horizontal",
    type = "text",
    placeholder = "Placeholder",
    size,
    disabled = false,
    error = false,
    errorMessage = "",
    label,
    id,
    value,
    onChange,
    onKeyDown,
    className,
    inputClassName,
    leftIcon,
    rightIcon,
    multiline = false,
    rows = 3,
}: TextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isVertical = variant === "vertical";

    // Base styles untuk kedua input dan textarea
    const baseStyles = cn(
        "w-full rounded-md border border-border-subtle bg-transparent px-3 py-2 text-paragraph shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground",
        // Focus state
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Error state
        error && "border-brand-destructive",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Selection styling
        "selection:bg-primary selection:text-background",
    );

    return (
        <div
            className={cn(
                isVertical
                    ? "flex flex-col gap-sm w-full"
                    : "flex items-start gap-lg w-full",
                className,
            )}
        >
            {label && (
                <Label
                    htmlFor={inputId}
                    size={size}
                    disabled={disabled}
                    className={cn(
                        "shrink-0",
                        variant === "horizontal" && size === "sm" && "pt-2.5",
                        variant === "horizontal" && size === "lg" && "pt-3.5",
                    )}
                >
                    {label}
                </Label>
            )}

            <div
                className={cn(
                    "flex flex-col gap-1",
                    isVertical ? "w-full" : "flex-1 min-w-0",
                )}
            >
                <div className="relative w-full flex items-center">
                    {leftIcon && !multiline && (
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    {multiline ? (
                        // Textarea untuk multi-line input
                        <textarea
                            id={inputId}
                            placeholder={placeholder}
                            disabled={disabled}
                            value={value}
                            onChange={onChange as any} // Tetap menggunakan onChange yang sama
                            onKeyDown={onKeyDown as any} // Tetap menggunakan onKeyDown yang sama
                            rows={rows}
                            className={cn(
                                baseStyles,
                                "resize-none text-left align-top", // Textarea specific styles
                                "min-h-[2.5rem]", // Minimum height
                                inputClassName,
                            )}
                            style={{
                                textAlign: "left",
                                verticalAlign: "top",
                            }}
                        />
                    ) : (
                        // Regular input untuk single-line
                        <Input
                            id={inputId}
                            type={type}
                            placeholder={placeholder}
                            disabled={disabled}
                            value={value}
                            size={size}
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            className={cn(
                                rightIcon ? "pr-10" : "", // space buat icon kanan
                                leftIcon ? "pl-10" : "", // space buat icon kiri
                                inputClassName,
                            )}
                        />
                    )}
                    {rightIcon && !multiline && (
                        <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && errorMessage && (
                    <div className="flex items-center gap-lg text-brand-destructive text-sm font-normal">
                        <AlertCircle size={16} />
                        <span>{errorMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
