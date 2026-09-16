import React from "react";
import { UPLOADS_URL } from "~/api/client";
import Avatar, { AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { Message, ChatContact, ChatWindowProps } from "~/api/types";
import { useChatWindow } from "~/hooks/useChatWindow";
import { cn } from "~/lib/utils";
import { Paperclip, Send, FileText, ArrowLeft, X, Check, CheckCheck, Trash2, UserPlus, User } from "lucide-react";
import { MessageActionMenu } from "./MessageActionMenu";
import { DeleteMessageDialog } from "./DeleteMessageDialog";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";

export function ChatWindow(props: ChatWindowProps) {
    const {
        activeContact,
        messages,
        currentUser,
        onSendMessage,
        onEditMessage,
        isLoadingHistory,
        onBack,
        onMarkAsRead,
        onDeleteMessage,
        onDeleteMessageForMe,
        onAddMembers,
        onRemoveMember,
        onDeleteGroup,
        publicMembers = [],
        onKickPublic,
        onUnbanPublic,
        isSending = false
    } = props;

    const {
        inputValue,
        setInputValue,
        replyingTo,
        setReplyingTo,
        editingMessageId,
        setEditingMessageId,
        messageToDelete,
        setMessageToDelete,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isGroupInfoOpen,
        setIsGroupInfoOpen,
        memberToRemove,
        setMemberToRemove,
        isDeleteGroupOpen,
        setIsDeleteGroupOpen,
        selectedPublicUserId,
        setSelectedPublicUserId,
        fileInputRef,
        messagesEndRef,
        canAttachFiles,
        getAvatarDetails,
        handleSend,
        handleEditClick,
        handleFileUpload,
        handleDeleteClick,
        handleDeleteForEveryone,
        handleDeleteForMe
    } = useChatWindow(props);

    if (!activeContact) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#f0f2f5] text-[#8696a0]">
                <p>Pilih kontak untuk memulai chat</p>
            </div>
        );
    }

    const { initials: avatarInitials, color: avatarColor, image: avatarImage } = getAvatarDetails(activeContact);

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] relative w-full mb-0">
            <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />

            {/* Header */}
            <div 
                className={cn("flex items-center p-3 pl-16 md:pl-3 bg-[#f0f2f5] border-b border-[#d1d7db] z-10 shrink-0 h-[60px] cursor-pointer hover:bg-[#e9edef] transition-colors")}
                onClick={() => {
                    if (activeContact.isGroup || Number(activeContact.id) === 0) {
                        setIsGroupInfoOpen(true);
                    } else {
                        setSelectedPublicUserId(Number(activeContact.id));
                    }
                }}
            >
                <div className="flex items-center flex-1">
                    <Button variant="ghost" size="icon" className="md:hidden mr-2 text-[#54656f]" onClick={(e) => { e.stopPropagation(); onBack?.(); }}>
                        <ArrowLeft size={24} />
                    </Button>
                    
                    <Avatar className={cn("h-10 w-10 mr-3", !avatarImage && avatarColor)} src={avatarImage || ""}>
                        <AvatarImage src={avatarImage} />
                        <AvatarFallback className={cn("text-sm font-bold text-[#54656f]", !avatarImage && avatarColor)}>
                            {avatarInitials}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                        <span className="text-[#111b21] font-medium">{activeContact.username}</span>
                        <span className="text-xs text-[#667781]">
                            {Number(activeContact.id) === 0 
                                ? `${publicMembers.length} anggota` 
                                : activeContact.isGroup 
                                    ? `${activeContact.members?.length || 0} anggota` 
                                    : 'online'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-[4px] md:px-12 w-full z-10 relative">
                <div className="flex flex-col space-y-2 pb-0">
                    {isLoadingHistory ? (
                        <div className="flex justify-center p-4">
                            <span className="text-[#8696a0]">Memuat pesan...</span>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUser?.id;
                            const isPublic = Number(activeContact.id) === 0;
                            const isGroupChat = activeContact.isGroup || isPublic;
                            const showAvatarAndName = !isMe && isGroupChat;

                            const gradientColors = [
                                "bg-gradient-to-br from-indigo-500 to-purple-500",
                                "bg-gradient-to-br from-blue-500 to-cyan-500",
                                "bg-gradient-to-br from-emerald-500 to-teal-500",
                                "bg-gradient-to-br from-rose-500 to-pink-500",
                                "bg-gradient-to-br from-amber-500 to-orange-500",
                                "bg-gradient-to-br from-fuchsia-500 to-violet-500"
                            ];
                            
                            const textColors = ['#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#d946ef'];
                            
                            const senderGradient = isGroupChat ? gradientColors[msg.senderId % 6] : "bg-slate-300";
                            const senderColor = isGroupChat ? textColors[msg.senderId % 6] : undefined;

                            let senderAvatarImage = "";
                            let senderInitials = "";
                            if (showAvatarAndName && msg.sender) {
                                const senderRole = msg.sender.role?.toLowerCase() || "";
                                const senderUsername = msg.sender.username || "U";
                                if (senderRole.includes("mahasiswa") || senderUsername.toLowerCase().includes("mahasiswa")) {
                                    senderAvatarImage = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";
                                } else if (senderRole.includes("dosen") || senderUsername.toLowerCase().includes("dosen")) {
                                    senderAvatarImage = "https://cdn-icons-png.flaticon.com/512/2784/2784488.png";
                                } else {
                                    senderAvatarImage = "";
                                }
                                if (msg.sender.photo) senderAvatarImage = profileApi.getProfilePhotoUrl(msg.sender.photo);
                                senderInitials = senderUsername.substring(0, 2).toUpperCase();
                            }

                            if (msg.isDeleted) {
                                return (
                                    <div key={idx} className={cn("flex mb-1", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[70%] sm:max-w-[60%] rounded-lg px-3 py-2 text-sm italic flex items-center gap-2 shadow-sm",
                                            isMe ? "bg-[#d9fdd3] text-[#54656f]" : "bg-white text-[#54656f]"
                                        )}>
                                            <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center">
                                                <div className="w-3 h-[1px] bg-current rotate-45" />
                                            </div>
                                            <span>Pesan ini telah dihapus</span>
                                             <span className="text-[10px] ml-2 self-end">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={cn("flex flex-col mb-1 group max-w-full", isMe ? "items-end" : "items-start")}>
                                    <div className={cn("flex max-w-[85%] sm:max-w-[75%]", isMe ? "justify-end" : "justify-start gap-2")}>
                                        
                                        {showAvatarAndName && (
                                            <Avatar 
                                                className="h-8 w-8 flex-shrink-0 cursor-pointer mt-0.5 shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (msg.senderId) setSelectedPublicUserId(msg.senderId);
                                                }}
                                            >
                                                <AvatarImage src={senderAvatarImage} />
                                                <AvatarFallback className={cn("text-[11px] font-bold text-white", senderGradient)}>
                                                    {senderInitials}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div
                                            className={cn(
                                                "px-3.5 py-2.5 relative text-[14.5px] break-words flex flex-col min-w-[120px] transition-all",
                                                isMe
                                                    ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-2xl rounded-br-sm shadow-md shadow-blue-400/20"
                                                    : "bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100/60"
                                            )}
                                        >
                                        <div className="absolute top-0 right-0 p-1 z-20">
                                            <MessageActionMenu 
                                                message={msg}
                                                currentUserId={currentUser?.id}
                                                onReply={() => setReplyingTo(msg)}
                                                onDelete={() => handleDeleteClick(msg.id)}
                                                onEdit={() => handleEditClick(msg)}
                                            />
                                        </div>

                                        {showAvatarAndName && (
                                            <div 
                                                className="text-[12px] font-bold mb-1.5 cursor-pointer hover:opacity-80 flex items-center justify-between"
                                                style={{ color: senderColor }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (msg.senderId) {
                                                        setSelectedPublicUserId(msg.senderId);
                                                    }
                                                }}
                                            >
                                                <span>{msg.sender?.username || 'Unknown'}</span>
                                                {msg.sender?.role && (
                                                    <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold ml-2 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                        {msg.sender.role}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {msg.parent && (
                                            <div 
                                                className={cn(
                                                    "rounded-lg p-2 mb-2 border-l-[3px] text-xs flex flex-col cursor-pointer transition-colors",
                                                    isMe ? "bg-white/20 border-white/50 hover:bg-white/30 text-white" : "bg-black/5 border-[#119DA4] hover:bg-black/10 text-slate-700"
                                                )}
                                                onClick={() => {
                                                    const el = document.getElementById(`msg-${msg.parent!.id}`);
                                                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }}
                                            >
                                                <span className={cn("font-bold opacity-90", isMe ? "text-white" : "text-[#119DA4]")}>
                                                    {msg.parent.sender.username}
                                                </span>
                                                <span 
                                                    className="opacity-80 block break-words overflow-hidden text-ellipsis mt-0.5"
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical'
                                                    }}
                                                >
                                                    {msg.parent.content || "Lampiran"}
                                                </span>
                                            </div>
                                        )}

                                        <div id={`msg-${msg.id}`}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-2">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img 
                                                            src={profileApi.getProfilePhotoUrl(msg.attachmentUrl)} 
                                                            alt="Attachment" 
                                                            className="max-w-full max-h-60 rounded-lg object-cover cursor-pointer"
                                                            onClick={() => window.open(profileApi.getProfilePhotoUrl(msg.attachmentUrl!), '_blank')}
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={profileApi.getProfilePhotoUrl(msg.attachmentUrl)} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className={cn("flex items-center gap-2 p-2 rounded-lg text-xs font-semibold underline", isMe ? "text-white hover:text-white/90" : "text-blue-600 hover:text-blue-800")}
                                                        >
                                                            <FileText size={16} />
                                                            <span>{msg.fileName || "Dokumen Lampiran"}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.content && <p className="leading-normal whitespace-pre-wrap">{msg.content}</p>}
                                        </div>

                                        <div className={cn("text-[10px] mt-1 flex items-center justify-end gap-1 font-sans font-medium", isMe ? "text-white/80" : "text-slate-400")}>
                                            {msg.isEdited && <span className="italic mr-1">(diedit)</span>}
                                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isMe && (
                                                msg.isRead ? <CheckCheck size={14} className="text-white font-extrabold" /> : <Check size={14} className="text-white/70" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Replying Context Indicator */}
            {replyingTo && (
                <div className="bg-[#f0f2f5] border-t border-[#d1d7db] p-2.5 px-4 flex items-center justify-between z-20 shrink-0">
                    <div className="flex flex-col text-xs border-l-2 border-[#119DA4] pl-2">
                        <span className="font-bold text-[#119DA4]">
                            Membalas {replyingTo.sender?.username || "Pesan"}
                        </span>
                        <span className="text-[#667781] truncate max-w-md">
                            {replyingTo.content || "Lampiran"}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-6 w-6 p-0 rounded-full">
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* Editing Indicator */}
            {editingMessageId && (
                <div className="bg-amber-50 border-t border-amber-200 p-2.5 px-4 flex items-center justify-between z-20 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                        <span>Mengedit pesan...</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingMessageId(null); setInputValue(""); }} className="h-6 w-6 p-0 rounded-full text-amber-800">
                        <X size={16} />
                    </Button>
                </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-[#f0f2f5] border-t border-[#d1d7db] flex items-center gap-2 z-20 shrink-0">
                {canAttachFiles() && (
                    <>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#54656f] hover:bg-[#e9edef] rounded-full shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                        >
                            <Paperclip size={20} />
                        </Button>
                    </>
                )}
                <Textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 bg-white border-none rounded-xl py-2 px-4 text-sm focus-visible:ring-1 focus-visible:ring-[#119DA4] min-h-[40px] max-h-[120px] resize-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-[#119DA4] hover:bg-[#e9edef] rounded-full shrink-0"
                    onClick={handleSend}
                    disabled={isSending || !inputValue.trim()}
                >
                    <Send size={20} />
                </Button>
            </div>

            {/* Dialogs */}
            <DeleteMessageDialog 
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onDeleteForEveryone={handleDeleteForEveryone}
                onDeleteForMe={handleDeleteForMe}
                isMyMessage={messages.find(m => m.id === messageToDelete)?.senderId === currentUser?.id}
            />

            <RemoveMemberDialog 
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onConfirm={() => {
                    if (memberToRemove && onRemoveMember) {
                        onRemoveMember(memberToRemove.id);
                        setMemberToRemove(null);
                    }
                }}
                memberName={memberToRemove?.name || ""}
            />

            <DeleteGroupDialog 
                isOpen={isDeleteGroupOpen}
                onClose={() => setIsDeleteGroupOpen(false)}
                onConfirm={() => {
                    if (onDeleteGroup) {
                        onDeleteGroup();
                        setIsDeleteGroupOpen(false);
                    }
                }}
            />

            {/* Sheet Group Info */}
            <Sheet open={isGroupInfoOpen} onOpenChange={setIsGroupInfoOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold border-b pb-3">
                            {Number(activeContact.id) === 0 ? "Informasi Ruang Publik" : "Informasi Grup"}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col items-center my-6">
                        <Avatar className="h-20 w-20 mb-3 bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                            <AvatarFallback>{avatarInitials}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-bold text-slate-800">{activeContact.username}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {Number(activeContact.id) === 0 ? "Ruang Diskusi Terbuka" : `Dibuat oleh ${activeContact.members?.find(m => m.id === activeContact.adminId)?.username || 'Admin'}`}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Anggota ({Number(activeContact.id) === 0 ? publicMembers.length : (activeContact.members?.length || 0)})
                            </span>
                            {activeContact.isGroup && activeContact.adminId === currentUser?.id && onAddMembers && (
                                <Button size="sm" variant="ghost" className="text-[#119DA4] text-xs font-bold gap-1" onClick={() => { setIsGroupInfoOpen(false); onAddMembers(); }}>
                                    <UserPlus size={14} /> Tambah
                                </Button>
                            )}
                        </div>

                        <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                            {Number(activeContact.id) === 0 ? (
                                publicMembers.map(m => (
                                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={m.photo ? profileApi.getProfilePhotoUrl(m.photo) : ""} />
                                                <AvatarFallback className="text-xs font-bold bg-slate-200">
                                                    {m.username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800">{m.username}</span>
                                                <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                                            </div>
                                        </div>
                                        {currentUser?.role?.toUpperCase() === "ADMIN" && m.id !== currentUser.id && (
                                            <div className="flex items-center gap-1">
                                                {m.isBannedFromPublic ? (
                                                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-emerald-300 text-emerald-600 hover:bg-emerald-50" onClick={() => onUnbanFromPublic?.(m.id)}>
                                                        Unban
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-red-200 text-red-600 hover:bg-red-50" onClick={() => onKickPublic?.(m.id)}>
                                                        Kick
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                activeContact.members?.map(m => (
                                    <div key={m.id} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={m.photo ? profileApi.getProfilePhotoUrl(m.photo) : ""} />
                                                <AvatarFallback className="text-xs font-bold bg-slate-200">
                                                    {m.username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                                    {m.username}
                                                    {m.id === activeContact.adminId && (
                                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">Admin</span>
                                                    )}
                                                </span>
                                                <span className="text-[10px] text-slate-400 capitalize">{m.role}</span>
                                            </div>
                                        </div>
                                        {activeContact.adminId === currentUser?.id && m.id !== currentUser?.id && (
                                            <Button size="sm" variant="ghost" className="h-7 text-red-500 hover:bg-red-50 text-xs font-bold" onClick={() => setMemberToRemove({ id: m.id, name: m.username })}>
                                                Keluarkan
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {activeContact.isGroup && activeContact.adminId === currentUser?.id && onDeleteGroup && (
                            <div className="pt-4 border-t">
                                <Button variant="destructive" className="w-full text-xs font-bold gap-2" onClick={() => { setIsGroupInfoOpen(false); setIsDeleteGroupOpen(true); }}>
                                    <Trash2 size={14} /> Bubarkan Grup
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* Public Profile View Modal */}
            {selectedPublicUserId && (
                <PublicProfileModal
                    userId={selectedPublicUserId}
                    isOpen={!!selectedPublicUserId}
                    onClose={() => setSelectedPublicUserId(null)}
                />
            )}
        </div>
    );
}
