import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";

export function ChatDesktop({ title }: { title: string }) {
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
        deleteMessageForMe
    } = useChat();

    const handleSelectContact = (contact: any) => {
        setActiveContact(contact);
        resetUnreadCount(contact.id);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-white rounded-lg shadow-sm border mt-4">
            <ChatSidebar
                contacts={contacts}
                activeContact={activeContact}
                onSelectContact={handleSelectContact}
                unreadCounts={unreadCounts}
            />
            <ChatWindow
                activeContact={activeContact}
                messages={messages}
                currentUser={user}
                onSendMessage={sendMessage}
                isLoadingHistory={isLoadingHistory}
                onMarkAsRead={markAsRead}
                onDeleteMessage={deleteMessage}
                onDeleteMessageForMe={deleteMessageForMe}
            />
        </div>
    );
}
