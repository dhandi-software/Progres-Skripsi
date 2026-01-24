import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Paperclip, FileText, Image as ImageIcon, Camera, User, BarChart2, Calendar, Sticker } from "lucide-react";
import { cn } from "~/lib/utils";

interface AttachmentMenuProps {
  onAttach: (type: 'document' | 'image' | 'camera') => void;
}

export function AttachmentMenu({ onAttach }: AttachmentMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#8696a0] hover:bg-[#ffffff10] hover:text-[#e9edef] shrink-0"
        >
            <Paperclip size={24} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        side="top" 
        className="w-56 bg-[#233138] border-[#233138] text-[#e9edef] p-2 space-y-1 shadow-2xl rounded-xl mb-4"
      >
        <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            onClick={() => onAttach('document')}
        >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7f66ff] to-[#5334e8] flex items-center justify-center">
                <FileText size={14} className="text-white" />
            </div>
            <span className="text-[15px]">Document</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            onClick={() => onAttach('image')}
        >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#007bfc] to-[#0057c7] flex items-center justify-center">
                <ImageIcon size={14} className="text-white" />
            </div>
            <span className="text-[15px]">Photos & videos</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            onClick={() => onAttach('camera')}
        >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff2e74] to-[#d41356] flex items-center justify-center">
                <Camera size={14} className="text-white" />
            </div>
            <span className="text-[15px]">Camera</span>
        </DropdownMenuItem>

        {/* Other requested items (visual mostly for now) */}
        <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            disabled
        >
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ff4f0f] to-[#d63400] flex items-center justify-center">
                <User size={14} className="text-white" />
            </div>
            <span className="text-[15px]">Contact</span>
        </DropdownMenuItem>

         <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            disabled
        >
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#ffbc03] to-[#dca306] flex items-center justify-center">
                <BarChart2 size={14} className="text-white" />
            </div>
            <span className="text-[15px]">Poll</span>
        </DropdownMenuItem>
        
         <DropdownMenuItem 
            className="cursor-pointer gap-3 p-3 focus:bg-[#182229] focus:text-[#e9edef] rounded-lg"
            disabled
        >
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#02c0b6] to-[#009b92] flex items-center justify-center">
                <Sticker size={14} className="text-white" />
            </div>
            <span className="text-[15px]">New sticker</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
