import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { DeleteGroupDialogProps } from "../types/chat";

export function DeleteGroupDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteGroupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Hapus / Bubarkan Grup?</DialogTitle>
          <DialogDescription>
            Tindakan ini akan menghapus grup secara permanen untuk semua anggota dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:w-auto">
            Batal
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            className="sm:w-auto font-bold"
          >
            Hapus Grup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
