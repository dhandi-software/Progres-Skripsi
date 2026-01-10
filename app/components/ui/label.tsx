import { Root as LabelRoot } from "@radix-ui/react-label";
import { cn } from "~/lib/utils";

type LabelProps = React.ComponentProps<typeof LabelRoot> & {
    size?: "lg" | "sm";
    disabled?: boolean;
};

function Label({
    className,
    size = "sm",
    disabled = false,
    ...props
}: LabelProps) {
    return (
        <LabelRoot
            data-slot="label"
            className={cn(
                "flex align-top gap-2 select-none",
                size === "lg" ? "text-label-lg" : "text-label",
                disabled && "text-brand-secondary-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

export { Label };
