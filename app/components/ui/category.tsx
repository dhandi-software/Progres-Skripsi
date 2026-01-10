import { cn } from "~/lib/utils"
import { Link } from "react-router"
interface CategoryProps {
    src: string,
    alt: string,
    text: string,
    className?: string
}

/*
* @example
* <Category src="/icons/ic_category.svg" alt="Category" text="Mining Exploration" />
*/
function Category({ src, alt, text, className }: CategoryProps) {
    return (
        <Link to="/search">
            <div className={cn(
                "flex flex-col gap-y-sm text-white font-label text-center max-w-[6.25rem] cursor-pointer hover:scale-105 transition-transform duration-300",
                className
            )}>
                <div className="size-[6.25rem] flex items-center justify-center rounded-[1.875rem] shadow-xs bg-gradient-to-b from-[#F9F9F9] to-[#CECECE]">
                    <img src={src} alt={alt} className="size-[5rem]" loading="lazy" />
                </div>
                <span className="line-clamp-2">{text}</span>
            </div>
        </Link>

    )
}

function CategorySmall({ src, alt, text, className }: CategoryProps) {
    return (
        <div className={cn(
            "flex flex-col gap-y-sm text-white text-label-lg !font-medium text-center w-[6.25rem] items-center cursor-pointer hover:scale-105 transition-transform duration-300",
            className
        )}>
            <div className="rounded-xl border-subtle border bg-[#F9F9F9] shadow-xs size-[3.75rem] flex items-center justify-center">
                <img src={src} alt={alt} className="size-[3.125rem]" loading="lazy" />
            </div>
            <span className="line-clamp-2">{text}</span>
        </div>

    )
}

export { Category, CategorySmall }