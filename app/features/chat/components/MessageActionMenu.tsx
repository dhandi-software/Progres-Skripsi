import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { ChevronDown, Pencil, Trash2, Reply } from "lucide-react";
import type { MessageActionMenuProps } from "../types/chat";

export function MessageActionMenu({ message, currentUserId, onEdit, onDelete, onReply }: MessageActionMenuProps) {
  const isOwner = message.senderId === currentUserId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#f5f6f6] rounded text-[#8696a0]">
          <ChevronDown size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onReply && (
          <DropdownMenuItem onClick={onReply} className="cursor-pointer flex items-center gap-2 text-xs">
            <Reply size={14} />
            <span>Balas</span>
          </DropdownMenuItem>
        )}
        {isOwner && onEdit && !message.isDeleted && (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer flex items-center gap-2 text-xs">
            <Pencil size={14} />
            <span>Edit Pesan</span>
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 flex items-center gap-2 text-xs">
            <Trash2 size={14} />
            <span>Hapus Pesan</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
