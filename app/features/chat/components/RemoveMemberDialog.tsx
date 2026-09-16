import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { RemoveMemberDialogProps } from "../types/chat";

export function RemoveMemberDialog({
  isOpen,
  onClose,
  onConfirm,
  memberName,
}: RemoveMemberDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keluarkan Anggota?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin mengeluarkan <strong className="text-slate-800">{memberName}</strong> dari grup ini?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:w-auto">
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="sm:w-auto"
          >
            Keluarkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
