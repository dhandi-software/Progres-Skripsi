// components/ui/toast.tsx
import { useEffect, useState } from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "~/lib/utils";

export interface ToastProps {
    title: string;
    variant?: "success" | "destructive" | "default";
    size?: "sm" | "md" | "lg";
    duration?: number;
    onClose?: () => void;
    className?: string;
}

export function Toast({
    title,
    variant = "success",
    size = "md",
    duration = 5000,
    onClose,
    className,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const getVariantStyles = () => {
        switch (variant) {
            case "success":
                return "bg-white border-accent-success shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)]";
            case "destructive":
                return "bg-destructive border-destructive text-white shadow-[0_4px_20px_-4px_rgba(239,68,68,0.2)]";
            default:
                return "bg-white border-border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]";
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case "sm":
                return "pl-2.5 pr-3 py-2";
            case "md":
                return "pl-2.5 pr-3 py-2";
            case "lg":
                return "pl-3 pr-4 py-3";
            default:
                return "pl-2.5 pr-3 py-2";
        }
    };

    const getIcon = () => {
        switch (variant) {
            case "success":
                return (
                    <CheckCircle2 className="w-5 h-5 text-accent-success-foreground" />
                );
            case "destructive":
                return <XCircle className="w-5 h-5 text-white" />;
            default:
                return (
                    <CheckCircle2 className="w-5 h-5 text-accent-success-foreground" />
                );
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case "success":
                return "text-262626";
            case "destructive":
                return "text-white";
            default:
                return "text-262626";
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "flex items-start rounded-xl border transition-all duration-300 animate-in slide-in-from-right-full backdrop-blur-sm",
                "max-w-[90vw] md:max-w-[850px] w-fit min-w-[300px]",
                getVariantStyles(),
                getSizeStyles(),
                className,
            )}
        >
            <div className="flex items-start gap-3 flex-1 py-0.5">
                <div className="mt-1 flex-shrink-0">
                    {getIcon()}
                </div>
                <span
                    className={cn(
                        "text-label whitespace-normal break-words leading-relaxed",
                        getTextColor(),
                    )}
                >
                    {title}
                </span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className={cn(
                    "w-6 h-6 hover:bg-black/5 rounded-full ml-3 flex-shrink-0 mt-0.5",
                    variant === "destructive"
                        ? "text-white hover:text-white/80 hover:bg-white/10"
                        : "text-muted-foreground",
                )}
            >
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
}
