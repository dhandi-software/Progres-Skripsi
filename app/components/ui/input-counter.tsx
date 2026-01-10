import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function InputCounter({
    canDelete,
    size = "md",
    className,
}: {
    canDelete?: boolean;
    className?: string;
    size?: "sm" | "md" | "lg";
}) {
    const [counter, setCounter] = useState(0);
    return (
        <div
            className={cn(
                "flex flex-row border border-subtle rounded-[0.563rem]",
                className
            )}
        >
            <Button
                variant="secondary"
                size="md"
                disabled={!canDelete && counter == 0}
                onClick={() => counter > 0 && setCounter(counter - 1)}
                className={cn(
                    "!bg-secondary-muted-foreground !rounded-l-md !rounded-r-none !p-0 !text-foreground !border-none",
                    size === "lg" && "w-[3rem]",
                    size === "md" && "w-[2.25rem]"
                )}
            >
                {canDelete && counter == 0 ? <Trash2 /> : <Minus />}
            </Button>
            <input
                className={cn(
                    "bg-white text-center border-border-subtle text-number focus:outline-none focus:ring-0 !font-geist-mono",
                    size === "lg" && "w-[3rem]",
                    size === "md" && "w-[2.5rem]"
                )}
                placeholder="0"
                type="number"
                value={counter} // <- controlled state
                readOnly={true} // <- makes input non-editable
            />
            <Button
                variant="secondary"
                size="md"
                onClick={() => setCounter(counter + 1)}
                className={cn(
                    "!bg-secondary-muted-foreground !rounded-l-none !rounded-r-md !p-0 !text-foreground !border-none",
                    size === "lg" && "w-[3rem]",
                    size === "md" && "w-[2.25rem]"
                )}
            >
                <Plus />
            </Button>
        </div>
    );
}
