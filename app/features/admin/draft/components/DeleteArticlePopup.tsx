import { X, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

interface DeleteArticlePopupProps {
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function DeleteArticlePopup({
  onClose,
  onDelete,
  isLoading = false,
}: DeleteArticlePopupProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-black/20 z-50 flex items-center justify-center p-8">
      <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-4 flex flex-col items-center gap-2 w-full max-w-[17.5rem] shadow-lg">
        {/* Close Button */}
        <div className="w-full flex justify-end">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-[1.125rem] h-[1.125rem] text-[#262626]" />
          </button>
        </div>

        {/* Trash Icon */}
        <div className="w-[1.875rem] h-[1.875rem] bg-[#D25026] rounded-full flex items-center justify-center">
          <Trash2 className="w-[1.125rem] h-[1.125rem] text-white" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-base font-medium text-[#0A0A0A] leading-5">
            Delete Article Draft?
          </p>
          <p className="text-xs font-medium text-[#737373] leading-4">
            This action cannot be undone
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 w-full mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-w-[6.25rem] h-8 text-xs font-medium border-[#E5E5E5] text-[#0A0A0A] hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onDelete}
            disabled={isLoading}
            className="min-w-[6.25rem] h-8 text-xs font-medium bg-[#D25026] hover:bg-[#B3411A] text-white"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
