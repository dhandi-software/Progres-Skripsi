import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface ForceDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
}

export function ForceDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}: ForceDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in-0">
      <div className="w-[90%] max-w-[450px] bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header/Banner */}
        <div className="bg-red-50 px-6 py-6 flex flex-col items-center text-center space-y-3 relative">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-red-300 hover:text-red-500 transition-colors"
                id="close-force-delete-modal"
            >
                <X size={20} />
            </button>

            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-1">
                <h3 className="text-xl font-bold text-red-900">
                    Peringatan Kritis!
                </h3>
                <p className="text-sm text-red-700 font-medium">
                    Tindakan ini tidak dapat dibatalkan
                </p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-8 text-center space-y-4">
            <div className="space-y-2">
                <p className="text-gray-900 font-semibold group">
                    Menghapus akun: <span className="text-red-600 underline decoration-red-200 underline-offset-4">{itemName}</span>
                </p>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 italic">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        "{description}"
                    </p>
                </div>
            </div>

            <div className="bg-red-50/50 rounded-lg p-3 text-left border border-red-100">
                <p className="text-xs text-red-800 leading-relaxed">
                    <strong>Catatan:</strong> Seluruh riwayat bimbingan, sidang, nilai, dan pesan chat mahasiswa ini akan dihapus permanen dari sistem untuk menjaga integritas database.
                </p>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
            <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 h-11 rounded-xl"
                id="cancel-force-delete"
            >
                Batalkan
            </Button>
            <Button
                onClick={onConfirm}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 h-11 rounded-xl font-bold shadow-lg shadow-red-200 transition-transform active:scale-95"
                id="confirm-force-delete"
            >
                Hapus Secara Paksa
            </Button>
        </div>
      </div>
    </div>
  );
}
