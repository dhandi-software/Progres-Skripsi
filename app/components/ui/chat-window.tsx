import { useRef, useState, useEffect } from "react";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Message, ChatContact } from "~/types/chat";
import { cn } from "~/lib/utils";
import { Paperclip, Send, FileText, ArrowLeft, X, Check, CheckCheck } from "lucide-react";
import { AttachmentMenu } from "./attachment-menu";
import { MessageActionMenu } from "./message-action-menu";
import { DeleteMessageDialog } from "./delete-message-dialog";

interface ChatWindowProps {
    activeContact: ChatContact | null;
    messages: Message[];
    currentUser: { id: number; username: string } | null;
    onSendMessage: (content: string, file?: File, replyToId?: number) => void;
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
    isLoadingHistory,
    onBack,
    onMarkAsRead,
    onDeleteMessage,
    onDeleteMessageForMe
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, replyingTo]);

    // Mark as read when messages load
    useEffect(() => {
        if (activeContact && messages.length > 0 && onMarkAsRead) {
            onMarkAsRead(activeContact.id);
        }
    }, [activeContact, messages.length, onMarkAsRead]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        onSendMessage(inputValue, undefined, replyingTo?.id);
        setInputValue("");
        setReplyingTo(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSendMessage("", file, replyingTo?.id);
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
            setMessageToDelete(null);
        }
    };

    const handleDeleteForMe = () => {
        if (messageToDelete !== null && onDeleteMessageForMe) {
             onDeleteMessageForMe(messageToDelete);
             setMessageToDelete(null);
        }
    };

    if (!activeContact) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Pilih kontak untuk memulai chat</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col h-full bg-[#0b141a]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#202c33] bg-[#202c33] flex items-center gap-4 z-20">
                {onBack && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onBack} 
                        className="text-[#e9edef] -ml-2 hover:bg-[#ffffff10]"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                )}
                <Avatar 
                    className="h-10 w-10"
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeContact.username}`} 
                    fallback={activeContact.username.slice(0, 2).toUpperCase()}
                />
                <div className="flex flex-col justify-center">
                    <h3 className="font-medium text-[#e9edef] text-base leading-tight">
                        {activeContact.username}
                        {activeContact.id === 0 && <span className="ml-2 text-xs text-[#8696a0] font-normal">(Grup)</span>}
                    </h3>
                    <p className="text-xs text-[#8696a0] truncate">
                        {messages.length > 0 ? 'online' : 'online'}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a] relative custom-scrollbar z-10"
                style={{
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                    backgroundRepeat: 'repeat',
                    backgroundBlendMode: 'soft-light',
                    backgroundColor: '#0b141a', 
                    backgroundSize: '400px'
                }}
            >
                {/* Overlay to darken background image */}
                <div className="absolute inset-0 bg-[#0b141a] opacity-40 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-2 pb-2">
                    {isLoadingHistory ? (
                        <div className="text-center text-sm text-[#8696a0] mt-4">Memuat riwayat chat...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-[#8696a0] mt-10 p-4 bg-[#202c33] rounded-lg self-center shadow-sm">
                            <p className="text-[#e9edef] font-medium mb-1">Selamat datang!</p>
                            Belum ada pesan. Mulai percakapan sekarang.
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === currentUser?.id;
                            const isPublic = activeContact.id === 0;
                            const senderColor = isPublic && !isMe ? 
                                `hsl(${(msg.sender?.username.length || 0) * 50 % 360}, 70%, 60%)` : 
                                '#e9edef';
                            
                            // Check if deleted
                            if (msg.isDeleted) {
                                return (
                                    <div key={msg.id} className={cn("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "px-3 py-2 rounded-lg text-sm italic text-[#8696a0] bg-[#202c33] border border-[#2a3942] flex items-center gap-2",
                                            isMe ? "rounded-tr-none" : "rounded-tl-none"
                                        )}>
                                            <div className="w-4 h-4 rounded-full border border-[#8696a0] flex items-center justify-center text-[10px]">!</div>
                                            Pesan ini telah dihapus
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full mb-1 group relative",
                                        isMe ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[70%] sm:max-w-[60%] rounded-lg px-2 py-1 relative shadow-sm text-sm break-words flex flex-col min-w-[120px]",
                                            isMe
                                                ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                                                : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                                        )}
                                    >
                                        
                                        {/* Action Menu Trigger (Hover) */}
                                        <div className="absolute top-0 right-0 p-1 z-20">
                                            <MessageActionMenu 
                                                isMe={isMe} 
                                                onReply={() => setReplyingTo(msg)}
                                                onDelete={() => handleDeleteClick(msg.id)}
                                                onInfo={() => {}}
                                            />
                                        </div>

                                        {/* Reply Context */}
                                        {msg.parent && (
                                            <div className="bg-[#00000030] rounded-md p-1 mb-1 border-l-4 border-[#00a884] text-xs flex flex-col cursor-pointer" onClick={() => {
                                                const el = document.getElementById(`msg-${msg.parent!.id}`);
                                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}>
                                                <span className="text-[#00a884] font-bold">{msg.parent.sender.username}</span>
                                                <span className="text-[#d1d7db] truncate">{msg.parent.content || "Lampiran"}</span>
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
                                                            src={`http://localhost:5000${msg.attachmentUrl}`} 
                                                            alt="attachment" 
                                                            className="rounded-md max-h-64 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(`http://localhost:5000${msg.attachmentUrl}`, '_blank')}
                                                        />
                                                    ) : (
                                                        <a 
                                                            href={`http://localhost:5000${msg.attachmentUrl}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-md bg-[#ffffff10] hover:bg-[#ffffff20] transition-colors border border-[#ffffff20]"
                                                        >
                                                            <FileText size={20} className="text-[#e9edef]" />
                                                            <span className="truncate flex-1 text-[#e9edef] font-medium">
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
                                            <span className="text-[11px] text-[#8696a0] mr-0.5">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isMe && !isPublic && (
                                                <span className={cn(msg.isRead ? "text-[#53bdeb]" : "text-[#8696a0]")}>
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
            {replyingTo && (
                <div className="bg-[#202c33] px-4 py-2 border-l-4 border-[#00a884] flex justify-between items-center animate-in slide-in-from-bottom-2">
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[#00a884] text-sm font-bold">Balas ke {replyingTo.sender?.username || currentUser?.username}</span>
                        <span className="text-[#8696a0] text-xs truncate">{replyingTo.content || "Lampiran"}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)} className="text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374045]">
                        <X size={20} />
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-2 bg-[#202c33] flex items-center gap-2 z-20">
                 <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                />
                
                <AttachmentMenu onAttach={(type) => {
                    if (type === 'document' || type === 'image') {
                        fileInputRef.current?.click();
                    }
                }} />
                
                <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center">
                    <Input
                        placeholder="Ketik pesan"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 bg-transparent border-none text-[#e9edef] placeholder-[#8696a0] focus-visible:ring-0 p-0 shadow-none h-auto"
                        autoComplete="off"
                    />
                </div>

                <Button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim()}
                    className={cn(
                        "rounded-full p-2 h-10 w-10 shrink-0 transition-colors",
                         inputValue.trim() ? "bg-[#005c4b] text-white hover:bg-[#007a65]" : "bg-[#2a3942] text-[#8696a0]"
                    )}
                >
                    <Send size={20} className={inputValue.trim() ? "ml-0.5" : ""} />
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
