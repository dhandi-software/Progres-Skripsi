// src/components/common/DropDownLanguage.tsx
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Flag } from "./Flag";
import { Button } from "./button";

type Lang = "indonesia" | "us";

const LABEL: Record<Lang, string> = {
    indonesia: "Bahasa Indonesia",
    us: "English - US",
};

type Props = {
    value?: Lang;
    onChange?: (v: Lang) => void;
    className?: string;
    showLabelInTrigger?: boolean; // false => hanya bendera + chevron
};

export function DropDownLanguages({
    value = "indonesia",
    onChange,
    className,
    showLabelInTrigger = false,
}: Props) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Lang>(value);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => setSelected(value), [value]);

    // klik di luar + ESC => close
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        const onEsc = (e: KeyboardEvent) =>
            e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDocClick);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocClick);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    const select = (v: Lang) => {
        setSelected(v);
        setOpen(false);
        onChange?.(v);
    };

    return (
        <div
            ref={ref}
            className={cn("relative inline-flex", className)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            {/* Trigger (pakai Button ghost/md, override dimensi) */}
            <Button
                type="button"
                variant="ghost"
                size="md"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={LABEL[selected]}
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "inline-flex items-center text-foreground",
                    " rounded-sm px-sm", // 36px, radius 4px, padding 8px
                    showLabelInTrigger
                        ? "gap-[0.375rem] min-w-0" // ada teks → biar fleksibel
                        : " min-w-0 gap-xs justify-center", // 57px + gap 4px
                )}
            >
                <Flag country={selected} />
                {showLabelInTrigger && (
                    <span className="text-paragraph-sm font-medium leading-none">
                        {LABEL[selected]}
                    </span>
                )}
                <ChevronDown
                    className={cn(
                        "size-[0.875rem] shrink-0 text-muted-foreground transition-transform duration-300",
                        open && "rotate-180",
                    )}
                />
            </Button>

            {open && (
                <section
                    role="listbox"
                    aria-label="Language"
                    className="absolute right-0 mt-3xl w-[13.5rem] rounded-md z-10
                     border border-border-subtle bg-background p-sm flex flex-col gap-xs shadow-sm"
                >
                    <div className="w-[12.5rem] h-[2.25rem] pt-[0.25rem] px-sm pb-md flex items-center">
                        <span className="font-medium text-[1rem] leading-[1.25rem] text-foreground">
                            Select your language
                        </span>
                    </div>

                    <div className="flex flex-col gap-xs">
                        <AtomNavList
                            lang="indonesia"
                            selected={selected === "indonesia"}
                            onClick={() => select("indonesia")}
                        />
                        <AtomNavList
                            lang="us"
                            selected={selected === "us"}
                            onClick={() => select("us")}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}

function AtomNavList({
    lang,
    selected,
    onClick,
}: {
    lang: Lang;
    selected: boolean;
    onClick: () => void;
}) {
    const LABEL: Record<Lang, string> = {
        indonesia: "Bahasa Indonesia",
        us: "English - US",
    };

    return (
        <button
            type="button"
            role="option"
            aria-selected={selected}
            onClick={onClick}
            className={cn(
                "min-w-[12.5rem] max-w-[18.75rem] px-sm py-sm",
                "flex items-center justify-between gap-[0.625rem] text-foreground transition-colors",
                selected ? "bg-bw-black-5" : "hover:bg-bw-black-5",
            )}
        >
            <span className="inline-flex items-center gap-[0.625rem]">
                <Flag country={lang} />
                <span className="text-[0.875rem] leading-[1.25rem] font-normal">
                    {LABEL[lang]}
                </span>
            </span>
            {selected && <Check className="size-[1rem]" aria-hidden="true" />}
        </button>
    );
}
