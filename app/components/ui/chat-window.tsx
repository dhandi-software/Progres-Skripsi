import { useRef, useState, useEffect } from "react";
import Avatar from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import type { Message, ChatContact } from "~/types/chat";
import { cn } from "~/lib/utils";
import { Paperclip, Send, FileText, ArrowLeft, X, Check, CheckCheck } from "lucide-react";
import { MessageActionMenu } from "./message-action-menu";
import { DeleteMessageDialog } from "./delete-message-dialog";

interface ChatWindowProps {
    activeContact: ChatContact | null;
    messages: Message[];
    currentUser: { id: number; username: string } | null;
    onSendMessage: (content: string, file?: File, replyToId?: number) => void;
    onEditMessage?: (messageId: number, newContent: string) => void;
    isLoadingHistory: boolean;
    onBack?: () => void;
    onMarkAsRead?: (senderId: number) => void;
    onDeleteMessage?: (messageId: number) => void;
    onDeleteMessageForMe?: (messageId: number) => void;
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
    onDeleteMessageForMe
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, replyingTo, editingMessageId]);

    // Mark as read when messages load
    useEffect(() => {
        if (activeContact && onMarkAsRead && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.senderId === activeContact.id && !lastMsg.isRead) {
                onMarkAsRead(activeContact.id);
            }
        }
    }, [messages, activeContact, onMarkAsRead]);

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
        <div className="flex flex-col h-full bg-[#efeae2] relative w-full mb-0">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{
                backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                backgroundSize: "400px"
            }} />

            {/* Header */}
            <div className="flex items-center p-3 bg-[#f0f2f5] border-b border-[#d1d7db] z-10 shrink-0 h-[60px]">
                <Button variant="ghost" size="icon" className="md:hidden mr-2 text-[#54656f]" onClick={onBack}>
                    <ArrowLeft size={24} />
                </Button>
                
                <Avatar className={cn("h-10 w-10 mr-3", !avatarImage && avatarColor)}>
                    {avatarImage ? (
                        <img src={avatarImage} alt={activeContact.username} className="h-full w-full object-cover" />
                    ) : (
                        <div className={cn(avatarColor, "h-full w-full flex items-center justify-center text-[#54656f] text-sm font-bold")}>
                            {avatarInitials}
                        </div>
                    )}
                </Avatar>
                
                <div className="flex flex-col">
                    <span className="text-[#111b21] font-medium">{activeContact.username}</span>
                    <span className="text-xs text-[#667781]">{messages.length > 0 ? 'online' : 'online'}</span>
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
                            const isPublic = activeContact.id === 0;
                            const senderColor = isPublic ? ['#FF5733', '#33FF57', '#3357FF', '#FF33F5'][msg.senderId % 4] : undefined;

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
                                    <div
                                        className={cn(
                                            "max-w-[70%] sm:max-w-[60%] rounded-lg px-2 py-1 relative shadow-sm text-sm break-words flex flex-col min-w-[120px]",
                                            isMe
                                                ? "bg-[#d9fdd3] text-[#111b21] rounded-tr-none"
                                                : "bg-white text-[#111b21] rounded-tl-none"
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

                                        {/* Reply Context */}
                                        {msg.parent && (
                                            <div className="bg-[#0000000d] rounded-md p-1 mb-1 border-l-4 border-[#00a884] text-xs flex flex-col cursor-pointer" onClick={() => {
                                                const el = document.getElementById(`msg-${msg.parent!.id}`);
                                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}>
                                                <span className="text-[#00a884] font-bold">{msg.parent.sender.username}</span>
                                                <span 
                                                    className="text-[#54656f] block break-words overflow-hidden text-ellipsis"
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

                                        {/* Sender Name in Public Chat */}
                                        {isPublic && !isMe && (
                                            <div 
                                                className="text-xs font-bold mb-1 cursor-pointer hover:underline"
                                                style={{ color: senderColor }}
                                            >
                                                {msg.sender?.username || 'Unknown'}
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div id={`msg-${msg.id}`}>
                                            {msg.attachmentUrl && (
                                                <div className="mb-1 mt-1">
                                                    {msg.attachmentType === 'image' ? (
                                                        <img 
                                                            src={`http://localhost:5002${msg.attachmentUrl}`} 
                                                            alt="attachment" 
                                                            className="rounded-md max-h-64 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(`http://localhost:5002${msg.attachmentUrl}`, '_blank')}
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={`http://localhost:5002${msg.attachmentUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-md bg-[#f0f2f5] hover:bg-[#e9edef] transition-colors border border-[#d1d7db]"
                                                        >
                                                            <FileText size={20} className="text-[#54656f]" />
                                                            <span className="truncate flex-1 text-[#111b21] font-medium">
                                                                {msg.attachmentUrl.split('/').pop()}
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
                                        <div className="flex justify-end items-center gap-1 mt-0.5 select-none self-end float-right">
                                            {msg.isEdited && <span className="text-[10px] text-[#667781] italic mr-2">diedit</span>}
                                            <span className="text-[11px] text-[#667781] mr-0.5">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && !isPublic && (
                                                <span className={cn(msg.isRead ? "text-[#53bdeb]" : "text-[#667781]")}>
                                                    {msg.isRead ? <CheckCheck size={14} /> : <CheckCheck size={14} />}
                                                </span>
                                            )}
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
                <div className="bg-[#f0f2f5] px-4 py-2 border-l-4 border-[#00a884] flex justify-between items-center animate-in slide-in-from-bottom-2 border-t border-[#d1d7db]">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[#00a884] text-sm font-bold">Balas ke {replyingTo.sender?.username || currentUser?.username}</span>
                        <span className="text-[#54656f] text-xs truncate">{replyingTo.content || "Lampiran"}</span>
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
                 <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                />
                
                <Button variant="ghost" size="icon" className="text-[#54656f] hover:text-[#111b21] hover:bg-[#d1d7db]" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip size={20} />
                </Button>
                
                <div className="flex-1 bg-white rounded-lg px-2 flex items-center min-h-[40px] py-1 border border-[#fff]">
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
                
                <Button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim()}
                    className={cn(
                        "rounded-full p-2 h-10 w-10 transition-colors",
                         inputValue.trim() ? "bg-[#00a884] text-white hover:bg-[#008f6f]" : "bg-[#f0f2f5] text-[#8696a0]"
                    )}
                >
                    {editingMessageId ? (
                         <Check size={20} className={inputValue.trim() ? "ml-0.5" : ""} />
                    ) : ( 
                         <Send size={20} className={inputValue.trim() ? "ml-0.5" : ""} />
                    )}
                </Button>
            </div>

            <DeleteMessageDialog 
                open={isDeleteDialogOpen} 
                onOpenChange={setIsDeleteDialogOpen} 
                onDeleteForEveryone={handleDeleteForEveryone}
                onDeleteForMe={handleDeleteForMe}
            />
        </div>
    );
}
