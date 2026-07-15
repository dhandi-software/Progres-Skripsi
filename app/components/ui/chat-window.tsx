import { useRef, useState, useEffect } from "react";
import { UPLOADS_URL } from "~/api/client";
import Avatar, { AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { Message, ChatContact } from "~/types/chat";
import { cn } from "~/lib/utils";
import { Paperclip, Send, FileText, ArrowLeft, X, Check, CheckCheck, Trash2, UserPlus, User } from "lucide-react";
import { MessageActionMenu } from "./message-action-menu";
import { DeleteMessageDialog } from "./delete-message-dialog";
import { RemoveMemberDialog } from "./remove-member-dialog";
import { DeleteGroupDialog } from "./delete-group-dialog";
import { profileApi } from "~/api/profileApi";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";

interface ChatWindowProps {
    activeContact: ChatContact | null;
    messages: Message[];
    currentUser: { id: number; username: string; role?: string } | null;
    onSendMessage: (content: string, file?: File, replyToId?: number) => void;
    onEditMessage?: (messageId: number, newContent: string) => void;
    isLoadingHistory: boolean;
    onBack?: () => void;
    onMarkAsRead?: (targetId: number | string, isGroup?: boolean) => void;
    onDeleteMessage?: (messageId: number) => void;
    onDeleteMessageForMe?: (messageId: number) => void;
    onAddMembers?: () => void;
    onRemoveMember?: (memberId: number) => Promise<void> | void;
    onDeleteGroup?: () => Promise<void> | void;
    publicMembers?: any[];
    onKickPublic?: (userId: number) => void;
    onUnbanPublic?: (userId: number) => void;
    isSending?: boolean;
}

export function ChatWindow({
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
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
    const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
    
    // For Public Profile viewing
    const [selectedPublicUserId, setSelectedPublicUserId] = useState<number | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const canAttachFiles = () => {
        if (!currentUser || !activeContact) return false;
        
        // Allowed in all groups (isGroup or Public Room id 0)
        const isGroup = activeContact.isGroup || Number(activeContact.id) === 0;
        if (isGroup) return true;
        
        // For direct chats, if both are Mahasiswa, do not allow attachments
        const currentRole = currentUser.role?.toUpperCase() || "";
        const contactRole = activeContact.role?.toUpperCase() || "";
        
        if (currentRole === "MAHASISWA" && contactRole === "MAHASISWA") {
            return false;
        }
        
        return true;
    };

    // Function to get Avatar Details (Consistent with Sidebar)
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
            image = "https://cdn-icons-png.flaticon.com/512/2784/2784488.png";
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

        return { 
            initials, 
            color, 
            image: contact.photo ? profileApi.getProfilePhotoUrl(contact.photo) : image 
        };
    };

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, replyingTo, editingMessageId]);

    // Mark as read when messages load or activeContact changes
    useEffect(() => {
        if (activeContact && onMarkAsRead) {
            const isGroup = activeContact.isGroup || Number(activeContact.id) === 0;
            onMarkAsRead(activeContact.id, isGroup);
        }
    }, [messages.length, activeContact?.id, onMarkAsRead]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        if (editingMessageId && onEditMessage) {
            onEditMessage(editingMessageId, inputValue);
            setEditingMessageId(null);
            setInputValue("");
        } else {
            onSendMessage(inputValue, undefined, replyingTo?.id);
            setInputValue("");
            setReplyingTo(null);
        }
    };

    const handleEditClick = (msg: Message) => {
        setInputValue(msg.content || "");
        setEditingMessageId(msg.id);
        setReplyingTo(null); // Clear reply if editing
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isSending) return;
        const file = e.target.files?.[0];
        if (file) {
            onSendMessage("", file);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setReplyingTo(null);
        }
    };

    const handleDeleteClick = (messageId: number) => {
        setMessageToDelete(messageId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteForEveryone = () => {
        if (messageToDelete !== null && onDeleteMessage) {
            onDeleteMessage(messageToDelete);
            setIsDeleteDialogOpen(false);
            setMessageToDelete(null);
        }
    };

    const handleDeleteForMe = () => {
        if (messageToDelete !== null && onDeleteMessageForMe) {
             onDeleteMessageForMe(messageToDelete);
             setIsDeleteDialogOpen(false);
             setMessageToDelete(null);
        }
    };

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
            {/* Subtle Abstract Pattern instead of dots */}
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

                            // Gunakan gradien mewah untuk avatar fallback
                            const gradientColors = [
                                "bg-gradient-to-br from-indigo-500 to-purple-500",
                                "bg-gradient-to-br from-blue-500 to-cyan-500",
                                "bg-gradient-to-br from-emerald-500 to-teal-500",
                                "bg-gradient-to-br from-rose-500 to-pink-500",
                                "bg-gradient-to-br from-amber-500 to-orange-500",
                                "bg-gradient-to-br from-fuchsia-500 to-violet-500"
                            ];
                            
                            // Warna teks nama tetap flat agar mudah dibaca
                            const textColors = ['#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#d946ef'];
                            
                            const senderGradient = isGroupChat ? gradientColors[msg.senderId % 6] : "bg-slate-300";
                            const senderColor = isGroupChat ? textColors[msg.senderId % 6] : undefined;

                            let senderAvatarImage = "";
                            let senderInitials = "";
                            if (showAvatarAndName && msg.sender) {
                                const senderRole = msg.sender.role?.toLowerCase() || "";
                                const senderUsername = msg.sender.username || "U";
                                if (senderRole.includes("mahasiswa")) senderAvatarImage = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";
                                else if (senderRole.includes("dosen")) senderAvatarImage = "https://cdn-icons-png.flaticon.com/512/2784/2784488.png";
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
                                        
                                        {/* Avatar for incoming group messages */}
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
                                        {/* Action Menu Trigger (Hover) */}
                                        <div className="absolute top-0 right-0 p-1 z-20">
                                            <MessageActionMenu 
                                                isMe={isMe} 
                                                onReply={() => setReplyingTo(msg)}
                                                onDelete={() => handleDeleteClick(msg.id)}
                                                onEdit={() => handleEditClick(msg)}
                                                onInfo={() => {}}
                                            />
                                        </div>

                                        {/* Sender Name in Group Chat (ALWAYS ON TOP) */}
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

                                        {/* Reply Context */}
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

                                        {/* Content */}
                                        <div id={`msg-${msg.id}`}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-1 mt-1">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img 
                                                            src={`${UPLOADS_URL}${msg.attachmentUrl}`} 
                                                            alt="attachment" 
                                                            className="rounded-md max-h-64 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(`${UPLOADS_URL}${msg.attachmentUrl}`, '_blank')}
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={`${UPLOADS_URL}${msg.attachmentUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-md bg-[#f0f2f5] hover:bg-[#e9edef] transition-colors border border-[#d1d7db]"
                                                        >
                                                            <FileText size={20} className="text-[#54656f]" />
                                                            <span className="truncate flex-1 text-[#111b21] font-medium">
                                                                {msg.fileName || msg.attachmentUrl.split('/').pop()}
                                                            </span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <p className="whitespace-pre-wrap leading-relaxed text-[14.2px] pr-6">
                                                {msg.content}
                                            </p>
                                        </div>
                                        
                                        {/* Meta (Time & Status) */}
                                         {/* Meta (Time & Status) */}
                                         <div className={cn("flex justify-end items-center gap-1.5 mt-1 select-none self-end float-right", isMe ? "text-white" : "text-slate-500")}>
                                             {msg.isEdited && <span className="text-[10px] italic">diedit</span>}
                                             <span className="text-[10px] font-bold">
                                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </span>
                                             {isMe && !isPublic && (
                                                 <span className="text-white">
                                                     {msg.isRead ? <CheckCheck size={14} strokeWidth={2.5} /> : <Check size={14} strokeWidth={2.5} />}
                                                 </span>
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

            {/* Replying Banner */}
            {replyingTo && !editingMessageId && (
                <div className="bg-white/80 backdrop-blur-md px-6 py-3 border-l-[4px] border-blue-500 flex justify-between items-center animate-in slide-in-from-bottom-2 border-t border-slate-200/60 shadow-sm z-20">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-blue-500 text-sm font-bold">Membalas {replyingTo.sender?.username || currentUser?.username}</span>
                        <span className="text-slate-500 text-xs truncate mt-0.5">{replyingTo.content || "Lampiran"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)} className="text-[#54656f] hover:text-[#111b21] hover:bg-[#d1d7db]">
                        <X size={20} />
                    </Button>
                </div>
            )}

             {/* Editing Banner */}
             {editingMessageId && (
                <div className="bg-[#f0f2f5] px-4 py-2 flex justify-between items-center border-l-4 border-blue-400 animate-in slide-in-from-bottom-2 border-t border-[#d1d7db]">
                    <span className="text-blue-400 text-sm font-bold">Edit Pesan</span>
                    <Button variant="ghost" size="icon" onClick={() => {
                        setEditingMessageId(null);
                        setInputValue("");
                    }} className="text-[#54656f] hover:text-[#111b21] hover:bg-[#d1d7db]">
                        <X size={20} />
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-2 bg-[#f0f2f5] flex items-center gap-2 z-20 border-t border-[#d1d7db]">
                 {canAttachFiles() && (
                    <>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-[46px] w-[46px] rounded-full bg-white text-slate-500 hover:text-blue-500 hover:bg-blue-50 shadow-sm border border-slate-200 transition-all flex-shrink-0" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                        >
                            <Paperclip size={20} />
                        </Button>
                    </>
                )}
                
                <div className="flex-1 bg-white rounded-3xl px-4 flex items-center min-h-[46px] py-1 shadow-sm border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 transition-all">
                    <Textarea
                        placeholder={editingMessageId ? "Edit pesan Anda..." : "Ketik pesan"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[#111b21] placeholder:text-[#667781] w-full resize-none py-2 min-h-[24px] max-h-[100px] leading-relaxed"
                        rows={1}
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                             const target = e.target as HTMLTextAreaElement;
                             target.style.height = 'auto';
                             target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
                        }}
                    />
                </div>
                
                <button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim() || isSending}
                    className={cn(
                        "rounded-full p-2 h-[48px] w-[48px] flex items-center justify-center transition-all flex-shrink-0 shadow-sm border-none outline-none",
                         inputValue.trim() ? "text-white cursor-pointer shadow-md" : "bg-white text-slate-300 border border-slate-200 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: inputValue.trim() ? '#2563eb' : '' }}
                >
                    {editingMessageId ? (
                         <Check size={26} />
                    ) : ( 
                         <Send size={26} className={inputValue.trim() ? "ml-1" : ""} />
                    )}
                </button>
            </div>

            <DeleteMessageDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen} 
                onDeleteForEveryone={handleDeleteForEveryone}
                onDeleteForMe={handleDeleteForMe}
            />

            {/* Group Info Side Panel (Custom overlay & side panel) */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/40 z-30 transition-opacity duration-300",
                    isGroupInfoOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsGroupInfoOpen(false)}
            />
            
            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-[100%] sm:w-[400px] md:w-[450px] bg-[#f0f2f5] p-0 flex flex-col border-none shadow-2xl border-l border-[#d1d7db] z-40 transition-transform duration-300 ease-in-out",
                    isGroupInfoOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="px-6 py-4 bg-[#f0f2f5] flex items-center border-b border-[#d1d7db] shrink-0 h-[60px]">
                    <button onClick={() => setIsGroupInfoOpen(false)} className="mr-5 text-[#54656f] hover:bg-[#dfe3e5] p-2 rounded-full transition-colors flex items-center justify-center focus:outline-none">
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-medium text-[#111b21] m-0 leading-none pb-1">Info grup</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pt-8">
                    {/* Group Display Area */}
                    <div className="flex flex-col items-center justify-center py-2 mb-6 w-full px-6">
                        <Avatar className={cn("h-48 w-48 mb-6 shadow-sm", !avatarImage && avatarColor)} src={avatarImage || ""}>
                            <AvatarImage src={avatarImage} />
                            <AvatarFallback className={cn("text-6xl font-light text-[#54656f]", !avatarImage && avatarColor)}>
                                {avatarInitials}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-medium text-[#111b21] text-center px-4 break-words max-w-full leading-tight">{activeContact.username}</h2>
                        <p className="text-[15px] text-[#667781] mt-1.5">{Number(activeContact.id) === 0 ? 'Grup Publik' : 'Grup'} · {Number(activeContact.id) === 0 ? publicMembers.length : (activeContact.members?.length || 0)} anggota</p>
                    </div>
                    
                    {/* Members List Area */}
                    <div className="bg-white w-full py-2 shadow-sm border-t border-b border-[#d1d7db] flex flex-col mb-10">
                        <div className="px-6 py-4 text-[#8696a0] text-sm font-medium flex justify-between items-center bg-white border-b border-[#f0f2f5]">
                            <span>{Number(activeContact.id) === 0 ? publicMembers.length : (activeContact.members?.length || 0)} anggota</span>
                            {Number(activeContact.id) !== 0 && activeContact.adminId === currentUser?.id && onAddMembers && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={onAddMembers} 
                                    className="h-8 text-[#00a884] hover:bg-[#d9fdd3] hover:text-[#008f6f] px-3 font-medium rounded-full"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Tambah Anggota
                                </Button>
                            )}
                        </div>
                        
                        {(activeContact.id === 0 
                            ? [...publicMembers]
                                .sort((a, b) => {
                                    const modRoles = ['ADMIN', 'DOSEN', 'STAF', 'KAPRODI'];
                                    const isAMod = modRoles.includes(a.role?.toUpperCase() || '');
                                    const isBMod = modRoles.includes(b.role?.toUpperCase() || '');
                                    if (isAMod && !isBMod) return -1;
                                    if (!isAMod && isBMod) return 1;
                                    return 0;
                                })
                                .filter(m => {
                                    const isModerator = ['ADMIN', 'DOSEN', 'STAF', 'KAPRODI'].includes(currentUser?.role?.toUpperCase() || '');
                                    return !m.isBanned || isModerator;
                                }) 
                            : activeContact.members
                        )?.map((member) => (
                            <div key={`member-${member.id}`} className="flex items-center px-6 py-3 hover:bg-[#f5f6f6] transition-colors group cursor-pointer border-b border-[#f0f2f5] last:border-0">
                                <Avatar 
                                    className="h-12 w-12 mr-3 bg-[#dfe3e5]" 
                                    src={member.photo ? profileApi.getProfilePhotoUrl(member.photo) : ""}
                                >
                                    <AvatarImage src={member.photo ? profileApi.getProfilePhotoUrl(member.photo) : ""} />
                                    <AvatarFallback className="text-[15px] font-medium text-[#54656f]">
                                        {(member.username || "U").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 truncate justify-center">
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-[16px] truncate leading-tight", member.id === currentUser?.id ? "text-[#111b21] font-medium" : "text-[#111b21]")}>
                                            {member.id === currentUser?.id ? "Anda" : member.username}
                                            {Number(activeContact.id) === 0 && member.isBanned && <span className="ml-2 text-xs text-red-500 font-bold">(Dikeluarkan)</span>}
                                        </span>
                                        {/* Badge for Groups or Public moderators */}
                                        {((Number(activeContact.id) !== 0 && activeContact.adminId === member.id) || 
                                          (Number(activeContact.id) === 0 && ['ADMIN', 'DOSEN', 'STAF', 'KAPRODI'].includes(member.role?.toUpperCase() || ''))) && (
                                            <div className="text-[10px] text-white bg-[#00a884] rounded-full px-2 py-[1px] ml-2 font-bold uppercase tracking-wider shadow-sm">
                                                {Number(activeContact.id) === 0 ? (member.role || 'Admin') : 'Admin'}
                                            </div>
                                        )}
                                        {/* View Profile Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPublicUserId(member.id);
                                            }}
                                            className="ml-auto text-[#00a884] hover:text-[#008f6f] hover:bg-[#d9fdd3] h-8 w-8 p-0 rounded-full flex-shrink-0"
                                            title="Lihat profil"
                                        >
                                            <User className="w-4 h-4" />
                                        </Button>
                                        {/* Group Kick (Non-Public) */}
                                        {Number(activeContact.id) !== 0 && activeContact.adminId === currentUser?.id && member.id !== currentUser?.id && onRemoveMember && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMemberToRemove({ id: member.id, name: member.username || 'User' });
                                                }} 
                                                className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0 rounded-full flex-shrink-0"
                                                title="Keluarkan dari grup"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {/* Public Room Kick (Admin/Dosen/Staf only) */}
                                        {Number(activeContact.id) === 0 && 
                                         ['ADMIN', 'DOSEN', 'STAF'].includes(currentUser?.role?.toUpperCase() || '') && 
                                         member.id !== currentUser?.id && 
                                         !(['ADMIN', 'DOSEN', 'STAF'].includes(member.role?.toUpperCase() || '')) && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (member.isBanned) {
                                                        onUnbanPublic?.(member.id);
                                                    } else {
                                                        onKickPublic?.(member.id);
                                                    }
                                                }} 
                                                className={cn(
                                                    "ml-auto h-8 px-3 rounded-full text-xs font-bold",
                                                    member.isBanned 
                                                        ? "text-green-600 hover:bg-green-50 border border-green-200" 
                                                        : "text-red-600 hover:bg-red-50 border border-red-200"
                                                )}
                                            >
                                                {member.isBanned ? 'Masukan Kembali' : 'Keluarkan'}
                                            </Button>
                                        )}
                                    </div>
                                    <span className="text-[13px] text-[#667781] truncate capitalize leading-tight mt-0.5">
                                        {member.role?.toLowerCase()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Danger Zone */}
                    {activeContact?.isGroup && activeContact.adminId === currentUser?.id && (
                        <div className="w-full flex justify-center py-6">
                            <Button 
                                variant="outline" 
                                className="text-red-500 border-red-200 bg-white hover:bg-red-50 hover:text-red-700 w-[90%] font-medium flex items-center justify-center py-5 transition-colors"
                                onClick={() => setIsDeleteGroupOpen(true)}
                            >
                                <Trash2 className="w-5 h-5 mr-3" />
                                Hapus Grup
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <RemoveMemberDialog 
                open={memberToRemove !== null}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
                memberName={memberToRemove?.name || ""}
                onConfirm={async () => {
                    if (memberToRemove && onRemoveMember) {
                        try {
                             await onRemoveMember(memberToRemove.id);
                        } catch (e) {
                             console.error("Failed handling remove member", e);
                        }
                    }
                }}
            />

            <DeleteGroupDialog
                open={isDeleteGroupOpen}
                onOpenChange={setIsDeleteGroupOpen}
                groupName={activeContact?.username || ""}
                onConfirm={async () => {
                    if (onDeleteGroup) {
                        try {
                            await onDeleteGroup();
                            setIsGroupInfoOpen(false); // Tutup panel
                        } catch (e) {
                            console.error("Failed to delete group", e);
                        }
                    }
                }}
            />

            <PublicProfileModal 
                userId={selectedPublicUserId} 
                open={selectedPublicUserId !== null} 
                onOpenChange={(open) => {
                    if (!open) setSelectedPublicUserId(null);
                }} 
            />
        </div>
    );
}
