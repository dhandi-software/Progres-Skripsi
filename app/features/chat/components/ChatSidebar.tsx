import React from "react";
import Avatar, { AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import type { ChatContact, ChatSidebarProps } from "~/api/types";
import { useChatSidebar } from "~/hooks/useChatSidebar";
import { cn } from "~/lib/utils";
import { Search, MessageSquarePlus, Users, ArrowLeft } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

export function ChatSidebar(props: ChatSidebarProps) {
    const {
        activeContact,
        onSelectContact,
        unreadCounts,
        currentUserRole,
        onCreateGroup
    } = props;

    const {
        searchQuery,
        setSearchQuery,
        navigate,
        getAvatarDetails,
        sortedFilteredContacts,
        getMyInitials
    } = useChatSidebar(props);

    return (
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-[#d1d7db] bg-white h-full shrink-0 z-20">
            {/* Header Sidebar */}
            <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#d1d7db] shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Kembali"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex items-center gap-2">
                        <Avatar className="h-9 w-9 bg-brand-primary text-white font-bold shadow-sm">
                            <AvatarFallback className="bg-brand-primary text-white text-xs font-bold">
                                {getMyInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#111b21]">Pesan</span>
                            <span className="text-[10px] text-slate-500 capitalize">{currentUserRole?.toLowerCase() || "user"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {onCreateGroup && (
                        <button
                            onClick={onCreateGroup}
                            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Buat Grup Baru"
                        >
                            <Users size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Input */}
            <div className="p-2.5 bg-white border-b border-[#f0f2f5] shrink-0">
                <div className="relative flex items-center bg-[#f0f2f5] rounded-xl px-3 py-1.5">
                    <Search size={16} className="text-[#54656f] mr-2 shrink-0" />
                    <input
                        type="text"
                        placeholder="Cari kontak atau grup..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs w-full focus:outline-none text-[#111b21] placeholder-[#667781]"
                    />
                </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5]">
                {sortedFilteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                        Tidak ada kontak ditemukan.
                    </div>
                ) : (
                    sortedFilteredContacts.map((contact) => {
                        const isSelected = activeContact?.id === contact.id;
                        const { initials, color, image } = getAvatarDetails(contact);
                        
                        const unreadKey = contact.isGroup ? `group_${contact.realId}` : contact.id;
                        const unreadCount = unreadCounts?.[unreadKey] || 0;

                        return (
                            <div
                                key={contact.id}
                                onClick={() => onSelectContact(contact)}
                                className={cn(
                                    "flex items-center px-4 py-3 cursor-pointer transition-colors relative",
                                    isSelected ? "bg-[#f0f2f5]" : "hover:bg-[#f5f6f6]"
                                )}
                            >
                                <Avatar className={cn("h-11 w-11 mr-3 shrink-0", !image && color)}>
                                    <AvatarImage src={image} />
                                    <AvatarFallback className={cn("text-xs font-bold text-[#54656f]", !image && color)}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-sm font-semibold text-[#111b21] truncate">
                                            {contact.username}
                                        </span>
                                        {contact.lastMessage && (
                                            <span className="text-[10px] text-[#667781] shrink-0 ml-2">
                                                {new Date(contact.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-[#667781] truncate pr-2">
                                            {contact.lastMessage ? (
                                                contact.lastMessage.isDeleted ? (
                                                    <span className="italic">Pesan ini telah dihapus</span>
                                                ) : (
                                                    contact.lastMessage.content || (contact.lastMessage.attachmentUrl ? "📷 Lampiran" : "")
                                                )
                                            ) : (
                                                <span className="capitalize">{contact.role}</span>
                                            )}
                                        </p>

                                        {unreadCount > 0 && (
                                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[18px] text-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
