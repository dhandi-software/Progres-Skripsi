import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md transition-all disabled:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "bg-brand-primary !text-brand-primary-foreground hover:bg-brand-primary-hover disabled:bg-brand-primary-muted disabled:text-brand-primary-muted-foreground focus-visible:ring-outline-focus-primary",
                secondary:
                    "bg-brand-secondary !text-brand-secondary-foreground hover:bg-brand-secondary-hover disabled:bg-brand-secondary-muted disabled:text-brand-secondary-muted-foreground focus-visible:ring-outline-focus-destructive",
                destructive:
                    "bg-brand-destructive !text-brand-destructive-foreground hover:bg-brand-destructive-hover disabled:bg-brand-destructive-muted disabled:text-brand-destructive-muted-foreground",
                ghost: "backdrop-blur-[5px] !text-brand-secondary-foreground hover:bg-brand-secondary-muted disabled:shadow-xs disabled:backdrop-blur-[5px] disabled:text-brand-secondary-muted-foreground",
                outline:
                    "border border hover:bg-brand-secondary-muted disabled:border-border-subtle disabled:text-brand-secondary-muted-foreground",
                link: "!text-link underline-offset-4 hover:underline hover:text-link-hover disabled:text-brand-secondary-muted-foreground",
            },
            size: {
                sm: "h-[2rem] text-label-sm py-lg px-md gap-sm [&_svg]:!size-[0.875rem]",
                md: "h-[2.25rem] py-sm px-lg gap-sm [&_svg]:!size-[1rem] text-label",
                lg: "h-[2.5rem] py-sm px-2xl gap-sm [&_svg]:!size-[1rem] text-label",
                icon: "size-9 [&_svg]:!size-[1rem]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    },
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
