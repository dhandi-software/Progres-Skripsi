import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

interface DeleteMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
}

export function DeleteMessageDialog({ open, onOpenChange, onDeleteForEveryone, onDeleteForMe }: DeleteMessageDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#233138] border-[#233138] text-[#e9edef] sm:max-w-[400px] p-6 gap-6 rounded-2xl shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-normal">Hapus pesan ini?</AlertDialogTitle>
          <AlertDialogDescription className="text-[#8696a0] text-base leading-relaxed">
            Pesan yang dihapus akan ditarik untuk semua orang di ruang obrolan ini (jika Anda memilih untuk semua orang).
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-3 w-full mt-2">
            <button 
                type="button"
                onClick={() => { onDeleteForEveryone(); onOpenChange(false); }}
                className="w-full py-3 bg-[#374045] hover:bg-[#455055] text-[#ef5350] font-bold text-base transition-colors rounded-full transition-transform active:scale-[0.98]"
            >
                Hapus untuk semua orang
            </button>

            <button 
                type="button"
                onClick={() => { onDeleteForMe(); onOpenChange(false); }}
                className="w-full py-3 bg-[#374045] hover:bg-[#455055] text-[#ef5350] font-bold text-base transition-colors rounded-full transition-transform active:scale-[0.98]"
            >
                Hapus untuk saya
            </button>
            
            <button 
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full py-3 bg-[#374045] hover:bg-[#455055] text-[#e9edef] font-bold text-base transition-colors rounded-full transition-transform active:scale-[0.98]"
            >
                Batal
            </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
