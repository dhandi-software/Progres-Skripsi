import { Trash2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string; // e.g. "John Doe"
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in-0">
      <div className="w-[400px] bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col items-center gap-4 relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button / Decoration */}
        <div className="w-full flex justify-end">
             <div className="flex gap-1">
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                 <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
             </div>
        </div>

        {/* Icon */}
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
           <Trash2 size={24} />
        </div>

        {/* Text Content */}
        <div className="text-center space-y-1">
             <h3 className="text-lg font-medium text-gray-900">
                {title} <span className="font-bold">{itemName}</span>
             </h3>
             <p className="text-sm text-gray-500 max-w-[300px] mx-auto leading-relaxed">
                {description}
             </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-2">
            <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
            >
                Delete
            </button>
        </div>
      </div>
    </div>
  );
}
