import Avatar from "~/components/ui/avatar";
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
    // Helper to get avatar details
    const getAvatarDetails = (contact: ChatContact) => {
        const role = contact.role?.toLowerCase() || "";
        const username = contact.username?.toLowerCase() || "";
        
        let initials = "";
        let color = "bg-[#dfe3e5]";
        let image = "";

        if (contact.id === 0) { // Public Room
            return { initials: "Rp", color: "bg-[#e5e7eb]", image: "" }; 
        }

        if (role.includes("mahasiswa") || username.includes("mahasiswa")) {
            image = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";
        } else if (role.includes("dosen") || username.includes("dosen")) {
            image = "https://rmik.poltekkes-smg.ac.id/wp-content/uploads/2023/10/Doen.png";
        } else if (role.includes("kaprodi") || username.includes("kaprodi")) {
            initials = "Ka";
            color = "bg-[#fdffb6]"; 
        } else if (role.includes("staf") || username.includes("staf")) {
            initials = "Sf";
            color = "bg-[#caffbf]"; 
        } else {
            initials = contact.username
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }

        return { initials, color, image };
    };

    return (
        <div className="w-80 border-r border-[#d1d7db] bg-white flex flex-col h-full">
            <div className="px-4 py-3 bg-[#f0f2f5] border-b border-[#d1d7db] flex justify-between items-center h-[59px]">
                 <div className="flex items-center gap-3">
                     <Avatar 
                        className="h-10 w-10 bg-[#dfe3e5]" 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=You`}
                        fallback="YO"
                     />
                     <h2 className="text-base font-medium text-[#111b21] font-bold">Chat</h2>
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
                            const { initials, color, image } = getAvatarDetails(contact);
                            
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => onSelectContact(contact)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 hover:bg-[#f5f6f6] transition-colors text-left border-b border-[#e9edef]",
                                        activeContact?.id === contact.id ? "bg-[#f0f2f5]" : ""
                                    )}
                                >
                                    <Avatar 
                                        className={cn("h-12 w-12", !image && color)}
                                        src={image}
                                        fallback={initials}
                                    >
                                        {image ? (
                                            <img src={image} alt={contact.username} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className={cn(color, "h-full w-full flex items-center justify-center text-[#54656f] text-sm font-bold")}>
                                                {initials}
                                            </div>
                                        )}
                                    </Avatar>
                                    
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="font-medium text-[#111b21] truncate">
                                                {contact.username}
                                            </span>
                                            {contact.lastMessage && (
                                                <span className={cn(
                                                    "text-xs whitespace-nowrap ml-2",
                                                    unread > 0 ? "text-[#00a884] font-medium" : "text-[#667781]"
                                                )}>
                                                    {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <p className={cn(
                                                "text-sm truncate max-w-[180px]",
                                                unread > 0 ? "text-[#111b21] font-medium" : "text-[#667781]"
                                            )}>
                                                {contact.lastMessage?.content || "No messages yet"}
                                            </p>
                                            
                                            {unread > 0 && (
                                                <span className="bg-[#00a884] text-white text-[0.7rem] font-medium min-w-[1.25rem] h-5 px-1.5 rounded-full flex items-center justify-center">
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
