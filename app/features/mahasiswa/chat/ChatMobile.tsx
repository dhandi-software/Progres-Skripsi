import { useState } from "react";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Toast } from "~/components/ui/toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

export function ChatMobile({ title }: { title: string }) {
    const {
        contacts,
        activeContact,
        setActiveContact,
        messages,
        sendMessage,
        isLoadingHistory,
        user,
        unreadCounts,
        resetUnreadCount,
        markAsRead,
        deleteMessage,
        deleteMessageForMe,
        editMessage,
        publicMembers,
        kickFromPublic,
        unbanFromPublic,
        toastProps,
        setToastProps,
        isSending
    } = useChat();

    const [view, setView] = useState<"list" | "chat">("list");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const userId = searchParams.get("userId");
        if (userId && contacts.length > 0 && !activeContact) {
            const targetId = parseInt(userId);
            const contact = contacts.find(c => c.id === targetId);
            if (contact) {
                setActiveContact(contact);
                setView("chat");
            }
        }
    }, [searchParams, contacts, activeContact, setActiveContact]);

    const handleSelectContact = (contact: any) => {
        setActiveContact(contact);
        resetUnreadCount(contact.id);
        setView("chat");
    };

    const handleBack = () => {
        setView("list");
        setActiveContact(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white relative">
            {view === "list" ? (
                <ChatSidebar
                    contacts={contacts}
                    activeContact={activeContact}
                    onSelectContact={handleSelectContact}
                    unreadCounts={unreadCounts}
                />
            ) : (
                <div className="flex flex-col h-full">
                    <ChatWindow
                        activeContact={activeContact}
                        messages={messages}
                        currentUser={user}
                        onSendMessage={sendMessage}
                        onEditMessage={editMessage}
                        isLoadingHistory={isLoadingHistory}
                        onBack={handleBack}
                        onMarkAsRead={markAsRead}
                        onDeleteMessage={deleteMessage}
                        onDeleteMessageForMe={deleteMessageForMe}
                        publicMembers={publicMembers}
                        onKickPublic={kickFromPublic}
                        onUnbanPublic={unbanFromPublic}
                        isSending={isSending}
                    />
                </div>
            )}
            
            {toastProps && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
        </div>
    );
}
