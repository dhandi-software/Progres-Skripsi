import { useState } from "react";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { CreateGroupModal } from "./CreateGroupModal";

export function ChatDesktop({ title }: { title: string }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
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
        createGroup
    } = useChat();

    const handleSelectContact = (contact: any) => {
        setActiveContact(contact);
        resetUnreadCount(contact.id);
    };

    return (
        <div className="flex h-full pb-[4px] overflow-hidden">
            <ChatSidebar
                contacts={contacts}
                activeContact={activeContact}
                onSelectContact={handleSelectContact}
                unreadCounts={unreadCounts}
                currentUserRole={user?.role}
                currentUser={user}
                onCreateGroup={() => setIsCreateModalOpen(true)}
            />
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
            />
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                contacts={contacts}
                onCreate={createGroup}
            />
        </div>
    );
}
