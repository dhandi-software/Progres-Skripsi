import { Avatar } from "~/components/ui/avatar";
import type { ChatContact } from "~/types/chat";
import { cn } from "~/lib/utils";

interface ChatSidebarProps {
    contacts: ChatContact[];
    activeContact: ChatContact | null;
    onSelectContact: (contact: ChatContact) => void;
    unreadCounts?: Record<number, number>;
}

export function ChatSidebar({ contacts, activeContact, onSelectContact, unreadCounts }: ChatSidebarProps) {
    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="w-80 border-r border-[#202c33] bg-[#111b21] flex flex-col h-full">
            <div className="px-4 py-3 bg-[#202c33] border-b border-[#202c33] flex justify-between items-center h-[59px]">
                 <div className="flex items-center gap-3">
                     <Avatar 
                        className="h-10 w-10 bg-[#6a7175]" 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=You`}
                        fallback="YO"
                     />
                     <h2 className="text-base font-medium text-[#e9edef] font-bold">Chat</h2>
                 </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.length === 0 ? (
                    <div className="p-8 text-center text-[#8696a0] text-sm">
                        Tidak ada kontak
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {contacts.map((contact) => {
                            const unread = unreadCounts?.[contact.id] || 0;
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => onSelectContact(contact)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] transition-colors text-left border-b border-[#222d34]",
                                        activeContact?.id === contact.id ? "bg-[#2a3942]" : "bg-transparent"
                                    )}
                                >
                                    <Avatar 
                                        className="h-12 w-12"
                                        src={contact.username === "Ruang Publik" ? "" : `https://api.dicebear.com/7.x/initials/svg?seed=${contact.username}`}
                                        fallback={contact.username === "Ruang Publik" ? "RP" : getInitials(contact.username)}
                                    />
                                    <div className="flex-1 overflow-hidden flex flex-col justify-center gap-1">
                                        <div className="flex justify-between items-center h-[22px]">
                                            <h3 className="font-normal text-[#e9edef] text-[17px] truncate leading-tight">
                                                {contact.username}
                                            </h3>
                                            {contact.lastMessage && (
                                                 <span className={cn(
                                                     "text-[12px] shrink-0 ml-2",
                                                     unread > 0 ? "text-[#00a884] font-medium" : "text-[#8696a0]"
                                                 )}>
                                                    {new Date(contact.lastMessage.createdAt).getHours()}:{String(new Date(contact.lastMessage.createdAt).getMinutes()).padStart(2, '0')}
                                                 </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center h-[20px]">
                                            <p className="text-[14px] text-[#8696a0] truncate leading-tight flex-1">
                                                {contact.username === "Ruang Publik" && contact.lastMessage ? (
                                                     <span className="text-[#8696a0]">
                                                         {contact.lastMessage.senderId === 0 ? "" : (
                                                             <span className="text-[#e9edef] mr-1">
                                                                 {contact.lastMessage.sender?.username || "Someone"}:
                                                             </span>
                                                         )}
                                                         {contact.lastMessage.content || (contact.lastMessage.attachmentUrl ? "📎 Attachment" : "")}
                                                     </span>
                                                ) : (
                                                    // Private Chat Last Message
                                                    contact.lastMessage ? (
                                                        <span>
                                                            {contact.lastMessage.senderId !== contact.id && ( // If I sent it
                                                                <span className="mr-1">✓</span> // Simplified checkmark
                                                            )}
                                                            {contact.lastMessage.content || (contact.lastMessage.attachmentUrl ? "📎 Attachment" : "")}
                                                        </span>
                                                    ) : (
                                                        // Fallback if no message
                                                        contact.role === "Grup" ? "Pesan untuk semua" : contact.role
                                                    )
                                                )}
                                            </p>
                                            {unread > 0 && (
                                                <span className="ml-2 bg-[#25d366] text-[#111b21] text-[12px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1">
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
