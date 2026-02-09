import { ChevronDown, Reply, Trash2, Info, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

interface MessageActionMenuProps {
  isMe: boolean;
  onReply: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onInfo?: () => void;
}

export function MessageActionMenu({ isMe, onReply, onDelete, onEdit, onInfo }: MessageActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[#00000030] rounded-full data-[state=open]:opacity-100 h-6 w-6 flex items-center justify-center border-none custom-trigger">
        <ChevronDown size={18} className="text-[#aebac1]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isMe ? "end" : "start"} className="w-40 bg-[#233138] border-[#233138] text-[#e9edef]">
        <DropdownMenuItem onClick={onReply} className="hover:bg-[#182229] cursor-pointer">
          <Reply size={14} className="mr-2" />
          <span>Balas</span>
        </DropdownMenuItem>
        
        {isMe && onEdit && (
            <DropdownMenuItem onClick={onEdit} className="hover:bg-[#182229] cursor-pointer">
              <Pencil size={14} className="mr-2" />
              <span>Edit</span>
            </DropdownMenuItem>
        )}

        {isMe && (
            <DropdownMenuItem onClick={onInfo} className="hover:bg-[#182229] cursor-pointer">
            <Info size={14} className="mr-2" />
            <span>Info</span>
            </DropdownMenuItem>
        )}

        {isMe && (
          <DropdownMenuItem onClick={onDelete} className="hover:bg-[#182229] cursor-pointer text-red-400 focus:text-red-400">
            <Trash2 size={14} className="mr-2" />
            <span>Hapus</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
