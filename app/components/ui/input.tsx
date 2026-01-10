import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
    "peer flex min-w-0 gap-[6px] rounded-md border border-border-subtle bg-transparent px-md py-sm text-paragraph shadow-xs outline-none transition-[color,box-shadow] text-left align-top selection:bg-primary selection:text-background placeholder:text-muted-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground dark:bg-subtle/30",
    {
        variants: {
            size: {
                sm: "w-full h-[2.5rem]",
                lg: "w-full h-[3rem]",
            },
        },
        defaultVariants: {
            size: "sm",
        },
    },
);

type InputProps = Omit<React.ComponentProps<"input">, "size"> &
    VariantProps<typeof inputVariants>;

function Input({ className, size, type, ...props }: InputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                inputVariants({ size: size }),
                // Focus state
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                // Error state (aria-invalid)
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                // Disabled state
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                // Text alignment and selection
                "text-left",
                className,
            )}
            {...props}
        />
    );
}

export { Input };
