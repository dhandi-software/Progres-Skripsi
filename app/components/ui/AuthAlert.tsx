import React from "react";
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "~/lib/utils";

interface AuthAlertProps {
    message: string;
    type?: "error" | "success" | "warning" | "info";
    className?: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ 
    message, 
    type = "error",
    className 
}) => {
    if (!message) return null;

    const variants = {
        error: {
            bg: "bg-red-50",
            border: "border-red-100",
            text: "text-red-700",
            icon: <XCircle className="h-5 w-5 text-red-500" />,
            shadow: "shadow-red-900/5"
        },
        success: {
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            text: "text-emerald-700",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            shadow: "shadow-emerald-900/5"
        },
        warning: {
            bg: "bg-amber-50",
            border: "border-amber-100",
            text: "text-amber-700",
            icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
            shadow: "shadow-amber-900/5"
        },
        info: {
            bg: "bg-blue-50",
            border: "border-blue-100",
            text: "text-blue-700",
            icon: <Info className="h-5 w-5 text-blue-500" />,
            shadow: "shadow-blue-900/5"
        }
    };

    const variant = variants[type];

    return (
        <div 
            className={cn(
                "relative flex items-center gap-3 rounded-2xl border p-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300",
                variant.bg,
                variant.border,
                variant.text,
                variant.shadow,
                className
            )}
        >
            <div className="flex-shrink-0">{variant.icon}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">
                {message}
            </div>
        </div>
    );
};
