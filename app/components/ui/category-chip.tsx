import { cn } from "~/lib/utils"
import { Sparkle } from "lucide-react"
interface CategoryChipProps {
    className?: string,
    text: string
}
function CategoryChip({ className, text }: CategoryChipProps) {
    return (
        <div className={
            cn("w-fit gap-x-xs mt-[2.375rem] px-lg py-[0.375rem] leading-none flex flex-row text text-paragraph-sm font-semibold text-brand-primary-foreground rounded-full bg-gradient-to-r from-[#FF5B01] to-[#F39923] z-[2]",
                className
            )
        }>
            <Sparkle size={16} />
            {text}
        </div>
    )
}

interface OutlineCategoryChipProps extends CategoryChipProps {
    isActive?: boolean
}

function OutlineCategoryChip({ className, text, isActive = false}: OutlineCategoryChipProps) {
    return (
        <div className={cn(
            "cursor-pointer !font-medium h-[3rem] flex items-center px-2xl border border-divider rounded-full text-label text-brand-secondary-foreground",
            isActive ? "border-[#FF5B01]" : "border-divider",
            className
        )}>
            {text}
        </div>
    )
}

export { CategoryChip, OutlineCategoryChip }