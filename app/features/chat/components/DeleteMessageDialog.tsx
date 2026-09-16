import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import type { DeleteMessageDialogProps } from "../types/chat";

export function DeleteMessageDialog({
  isOpen,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
  isMyMessage = false,
}: DeleteMessageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hapus pesan?</DialogTitle>
          <DialogDescription>
            {isMyMessage 
              ? "Anda dapat menghapus pesan ini untuk semua orang atau hanya untuk Anda sendiri."
              : "Hapus pesan ini dari tampilan Anda?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:w-auto">
            Batal
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onDeleteForMe}
            className="sm:w-auto"
          >
            Hapus untuk saya
          </Button>

          {isMyMessage && onDeleteForEveryone && (
            <Button 
              variant="destructive" 
              onClick={onDeleteForEveryone}
              className="sm:w-auto"
            >
              Hapus untuk semua
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
