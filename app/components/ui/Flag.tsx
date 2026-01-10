// src/components/common/Flag.tsx
import { cn } from "~/lib/utils";

type FlagCountry = "us" | "indonesia";

const SRC: Record<FlagCountry, string> = {
    us: "/icons/ic_us.svg",

    indonesia: "/icons/ic_indonesia.svg",
};

const ALT: Record<FlagCountry, string> = {
    us: "United States flag",
    indonesia: "Indonesia flag",
};

type Props = {
    country: FlagCountry;
    className?: string;
};

export function Flag({ country, className }: Props) {
    return (
        <span
            className={cn(
                "inline-flex w-[1.25rem] h-lg overflow-hidden rounded-[0.125rem] shrink-0",
                country === "indonesia" &&
                "ring-[0.013rem] ring-[rgba(112,112,112,0.6)] ring-offset-0 rounded-[0.125rem]",
                className
            )}
        >
            <img
                src={SRC[country]}
                alt={ALT[country]}
                className="w-full h-full object-cover"
            />
        </span>
    );
}
