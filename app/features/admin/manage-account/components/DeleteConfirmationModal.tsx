import { Trash2, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this account? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}: DeleteConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl p-8 max-w-[27.5rem] w-full mx-4 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-6">
            <Trash2 className="w-8 h-8 text-[#EA580C]" />
          </div>

          {/* Text */}
          <h2 className="text-[1.5rem] font-bold text-[#18181B] mb-2">
            {title}
          </h2>
          <p className="text-[#71717A] text-[1rem] leading-relaxed mb-8">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl border border-[#E4E4E7] text-[1rem] font-semibold text-[#18181B] hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3.5 rounded-xl bg-[#FDBC74] text-[1rem] font-semibold text-white hover:bg-[#FDB15A] transition-all active:scale-95 shadow-lg shadow-orange-100"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
