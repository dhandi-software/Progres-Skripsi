import Avatar, { AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import type { ChatContact } from "~/types/chat";
import { cn } from "~/lib/utils";
import { Search, MessageSquarePlus, Users, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { profileApi } from "~/api/profileApi";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { useNavigate } from "react-router";

interface ChatSidebarProps {
    contacts: ChatContact[];
    activeContact: ChatContact | null;
    onSelectContact: (contact: ChatContact) => void;
    unreadCounts?: Record<string | number, number>;
    currentUserRole?: string;
    currentUser?: any;
    onCreateGroup?: () => void;
}

export function ChatSidebar({ contacts, activeContact, onSelectContact, unreadCounts, currentUserRole, currentUser, onCreateGroup }: ChatSidebarProps) {
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

        if (contact.isGroup) {
            return { initials: contact.username.substring(0, 2).toUpperCase(), color: "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm", image: "" };
        }

        if (role.includes("mahasiswa") || username.includes("mahasiswa")) {
            image = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";
        } else if (role.includes("dosen") || username.includes("dosen")) {
            image = "https://cdn-icons-png.flaticon.com/512/2784/2784488.png";
        } else if (role.includes("kaprodi") || username.includes("kaprodi")) {
            initials = "Ka";
            color = "bg-[#fdffb6]"; 
        } else if (role.includes("staf") || username.includes("staf")) {
            initials = "Sf";
            color = "bg-[#caffbf]"; 
        } else {
            initials = (contact.username || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }

        return { 
            initials, 
            color, 
            image: contact.photo ? profileApi.getProfilePhotoUrl(contact.photo) : image 
        };
    };

    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredContacts = contacts.filter(c => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return c.username?.toLowerCase().includes(query) || c.role?.toLowerCase().includes(query);
    });

    const getMyInitials = () => {
        if (!currentUser) return "DA";
        const name = currentUser.dosen?.nama || currentUser.mahasiswa?.nama || currentUser.username || "Dhandi Adam";
        
        if (/^\d+$/.test(name)) return "DA";
        
        return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const sortedFilteredContacts = [...filteredContacts].sort((a, b) => {
        // 1. Ruang Publik stays firmly at the top
        if (a.id === 0) return -1;
        if (b.id === 0) return 1;

        // 2. Groups have secondary priority over personal chats
        if (a.isGroup && !b.isGroup) return -1;
        if (!a.isGroup && b.isGroup) return 1;

        // 3. Fallback to newest message time
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    return (
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full md:w-80 w-full z-20 shadow-sm">
            {/* Header */}
            <div className="px-5 py-4 bg-white border-b border-slate-100 flex justify-between items-center h-[68px]">
                 <div className="flex items-center gap-3">
                     <button 
                         onClick={() => navigate(-1)} 
                         className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                     >
                         <ArrowLeft className="w-5 h-5" />
                     </button>
                     <Avatar className="h-10 w-10 shadow-sm ring-2 ring-slate-50" src={currentUser?.photo ? profileApi.getProfilePhotoUrl(currentUser.photo) : ""}>
                        <AvatarImage src={currentUser?.photo ? profileApi.getProfilePhotoUrl(currentUser.photo) : ""} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-900 text-white font-medium">
                            {getMyInitials()}
                        </AvatarFallback>
                     </Avatar>
                     <h2 className="text-lg font-bold text-amber-800 tracking-tight">Pesan</h2>
                 </div>
                 {currentUserRole?.toUpperCase() === 'DOSEN' && onCreateGroup && (
                     <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                             <button 
                                 className="p-2 text-[#54656f] hover:bg-[#dfe3e5] rounded-full transition-colors focus:outline-none focus:ring-0" 
                                 title="Chat Baru"
                             >
                                 <MessageSquarePlus className="w-5 h-5" />
                             </button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-48 bg-white rounded-lg shadow-md border border-[#d1d7db]" sideOffset={8}>
                             <DropdownMenuItem onClick={onCreateGroup} className="cursor-pointer py-2.5 px-3 focus:bg-[#f0f2f5] rounded-md transition-colors">
                                 <Users className="w-5 h-5 mr-3 text-[#54656f]" />
                                 <span className="text-[#111b21] font-medium text-[15px]">Grup Baru</span>
                             </DropdownMenuItem>
                         </DropdownMenuContent>
                     </DropdownMenu>
                 )}
            </div>

            {/* Search Bar */}
            <div className="px-4 py-3 bg-white">
                <div className="flex items-center bg-slate-100/80 rounded-xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/20 focus-within:border-blue-400 border border-transparent transition-all shadow-sm">
                    <Search className="w-[18px] h-[18px] text-slate-400 mr-2.5" />
                    <input 
                        type="text"
                        placeholder="Cari percakapan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-700 w-full text-[14px] placeholder:text-slate-400 py-0.5"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
                {sortedFilteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm mt-4">
                        {searchQuery ? "Tidak ada hasil ditemukan" : "Belum ada percakapan"}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 mt-1">
                        {sortedFilteredContacts.map((contact) => {
                            const unread = unreadCounts?.[contact.id] || 0;
                            const { initials, color, image } = getAvatarDetails(contact);
                            const isActive = activeContact?.id === contact.id;
                            
                            return (
                                <button
                                    key={contact.id}
                                    onClick={() => onSelectContact(contact)}
                                    className={cn(
                                        "flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left",
                                        isActive ? "bg-blue-50/80 shadow-sm ring-1 ring-blue-100" : "hover:bg-slate-50 bg-transparent"
                                    )}
                                >
                                    <Avatar className="h-[46px] w-[46px] shadow-sm border border-slate-100" src={image || ""}>
                                        <AvatarImage src={image} />
                                        <AvatarFallback className={cn("text-[13px] font-bold text-slate-600", !image && color)}>
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={cn("font-semibold truncate text-[14.5px]", isActive ? "text-blue-900" : "text-slate-700")}>
                                                {contact.username}
                                            </span>
                                            {contact.lastMessage && (
                                                <span className={cn(
                                                    "text-[10px] font-medium whitespace-nowrap ml-2",
                                                    unread > 0 ? "text-blue-600" : "text-slate-400"
                                                )}>
                                                    {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <p className={cn(
                                                "text-[13px] truncate max-w-[170px]",
                                                unread > 0 ? "text-slate-700 font-medium" : "text-slate-500"
                                            )}>
                                                {contact.lastMessage ? (
                                                    contact.lastMessage.content || 
                                                    (contact.lastMessage.attachmentType === 'image' ? '📷 Foto' : 
                                                     contact.lastMessage.attachmentType === 'document' ? `📎 ${contact.lastMessage.fileName || 'File'}` : 
                                                     'Pesan baru')
                                                ) : "Belum ada pesan"}
                                            </p>
                                            
                                            {unread > 0 && (
                                                <span className="bg-blue-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-sm">
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
