import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { Toast } from "~/components/ui/toast";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ChevronLeft } from "lucide-react";

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
        fetchPublicMembers,
        kickFromPublic,
        unbanFromPublic,
        toastProps,
        setToastProps,
        isSending
    } = useChat();

    const [searchParams] = useSearchParams();
    const [view, setView] = useState<"list" | "chat">("list");

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
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            {view === "list" ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b">
                        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ChatSidebar
                            contacts={contacts}
                            activeContact={activeContact}
                            onSelectContact={handleSelectContact}
                            unreadCounts={unreadCounts}
                        />
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-hidden">
                        <ChatWindow
                            activeContact={activeContact}
                            messages={messages}
                            currentUser={user}
                            onSendMessage={sendMessage}
                            onEditMessage={editMessage}
                            isLoadingHistory={isLoadingHistory}
                            onMarkAsRead={markAsRead}
                            onDeleteMessage={deleteMessage}
                            onDeleteMessageForMe={deleteMessageForMe}
                            onBack={handleBack}
                            publicMembers={publicMembers}
                            onKickPublic={kickFromPublic}
                            onUnbanPublic={unbanFromPublic}
                            isSending={isSending}
                        />
                    </div>
                </div>
            )}
            {toastProps && (
                <div className="absolute bottom-20 left-4 right-4 z-50">
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
