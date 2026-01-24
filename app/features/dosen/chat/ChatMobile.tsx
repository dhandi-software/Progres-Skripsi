import { useState } from "react";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ChatMobile() {
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
        deleteMessage
    } = useChat();

    const [view, setView] = useState<"list" | "chat">("list");

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
        <div className="flex flex-col h-[calc(100vh-4rem)] w-full bg-white">
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
                        isLoadingHistory={isLoadingHistory}
                        onBack={handleBack}
                        onMarkAsRead={markAsRead}
                        onDeleteMessage={deleteMessage}
                    />
                </div>
            )}
        </div>
    );
}
