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
                return "bg-brand-destructive-muted-foreground border-accent-success";
            case "destructive":
                return "bg-destructive border-destructive text-white";
            default:
                return "bg-background border-border";
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
                "flex items-center rounded-md border shadow-elevation-medium transition-all duration-300 animate-in slide-in-from-right-full",
                getVariantStyles(),
                getSizeStyles(),
                className,
            )}
        >
            <div className="flex items-center gap-2 flex-1">
                {getIcon()}
                <span
                    className={cn(
                        "text-label whitespace-nowrap",
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
                    "w-5 h-5 hover:bg-transparent ml-2",
                    variant === "destructive"
                        ? "text-white hover:text-white/80"
                        : "text-muted-foreground",
                )}
            >
                <X className="w-5 h-5" />
            </Button>
        </div>
    );
}
