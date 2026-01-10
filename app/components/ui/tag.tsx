import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const tagVariants = cva(
    "group items-center rounded-sm cursor-pointer flex flex-row  gap-x-xs bg-brand-secondary border border-black/10 [&_svg]:!size-[0.875rem]",
    {
        variants: {
            size: {
                s: "px-sm py-xs shadow-xs",
                m: "px-md py-xs shadow-xs",
            },
        },
        defaultVariants: {
            size: "s",
        },
    },
);

interface TagProps {
    label: string;
    onClose?: () => void;
    className?: string;
}

export function Tag({
    className,
    label,
    size,
    onClose,
}: TagProps & VariantProps<typeof tagVariants>) {
    return (
        <div className={cn(tagVariants({ size }), className)}>
            <span className="text-caption-sm text-foreground leading-none">
                {label}
            </span>
            {onClose && (
                <X
                    className="group-hover:!text-foreground text-muted-foreground"
                    onClick={() => {
                        onClose();
                    }}
                />
            )}
        </div>
    );
}
