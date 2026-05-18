import { Loader2, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface RemoveMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void> | void;
    memberName: string;
}

export function RemoveMemberDialog({
    open,
    onOpenChange,
    onConfirm,
    memberName,
}: RemoveMemberDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 fade-in-0 animate-in duration-200">
            <div className="w-full max-w-[380px] p-5 relative bg-white rounded-xl shadow-2xl border border-[#e5e7eb] flex flex-col justify-start items-center gap-4 overflow-hidden zoom-in-95 animate-in">
                
                {/* Header Actions (Close Button) */}
                <div className="w-full flex justify-end items-center">
                    <button 
                        onClick={() => !isLoading && onOpenChange(false)}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Icon Wrapper */}
                <div className="w-12 h-12 bg-red-100 rounded-full flex justify-center items-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>

                {/* Text Content */}
                <div className="w-full text-center px-1">
                    <div className="text-gray-900 text-lg font-medium leading-snug mb-2">
                        Keluarkan <span className="font-bold">{memberName}</span>
                    </div>
                    <div className="text-gray-500 text-sm font-normal leading-relaxed">
                        Apakah Anda yakin ingin mengeluarkan {memberName} dari grup ini? Tindakan ini tidak dapat dibatalkan.
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full flex justify-center items-center gap-3 mt-2">
                    <button 
                        onClick={() => !isLoading && onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 h-10 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={isLoading}
                        className="flex-1 h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : "Keluarkan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
