import { Button } from "~/components/ui/button";
import { Trash2, X } from "lucide-react";

interface DeleteArticlePopupProps {
  onClose: () => void;
  onDelete: () => void;
  isLoading?: boolean;
}

export default function DeleteArticlePopup({
  onClose,
  onDelete,
  isLoading,
}: DeleteArticlePopupProps) {
  return (
    <div className="fixed inset-0 w-full h-full bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[24.25rem] bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-[3rem] h-[3rem] bg-[#D25026] rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-[1.125rem] font-bold text-[#0D0D12]">
                Delete Article
              </h3>
              <p className="text-[0.875rem] text-[#71717A] leading-relaxed">
                Are you sure you want to delete this article? This action cannot
                be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-10 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={onDelete}
              disabled={isLoading}
              className="flex-1 h-10 bg-[#D25026] hover:bg-[#b54622] text-white font-medium shadow-sm transition-all"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
