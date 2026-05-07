import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { Toast } from "~/components/ui/toast";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

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
        deleteMessageForMe,
        editMessage,
        publicMembers,
        kickFromPublic,
        unbanFromPublic,
        toastProps,
        setToastProps,
        isSending
    } = useChat();

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const userId = searchParams.get("userId");
        if (userId && contacts.length > 0 && !activeContact) {
            const targetId = parseInt(userId);
            const contact = contacts.find(c => c.id === targetId);
            if (contact) {
                setActiveContact(contact);
            }
        }
    }, [searchParams, contacts, activeContact, setActiveContact]);

    const handleSelectContact = (contact: any) => {
        setActiveContact(contact);
        resetUnreadCount(contact.id);
    };

    return (
        <div className="flex h-full pb-[4px] overflow-hidden relative">
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
                onEditMessage={editMessage}
                isLoadingHistory={isLoadingHistory}
                onMarkAsRead={markAsRead}
                onDeleteMessage={deleteMessage}
                onDeleteMessageForMe={deleteMessageForMe}
                publicMembers={publicMembers}
                onKickPublic={kickFromPublic}
                onUnbanPublic={unbanFromPublic}
                isSending={isSending}
            />
            {toastProps && (
                <div className="absolute bottom-4 right-4 z-50">
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
