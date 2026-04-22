import { useState, useEffect } from "react";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { ChevronLeft } from "lucide-react";
import { Toast } from "~/components/ui/toast";
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
        toastProps,
        setToastProps,
        isSending
    } = useChat();

    const [view, setView] = useState<'list' | 'chat'>('list');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const userId = searchParams.get("userId");
        if (userId && contacts.length > 0 && !activeContact) {
            const targetId = parseInt(userId);
            const contact = contacts.find(c => c.id === targetId);
            if (contact) {
                setActiveContact(contact);
                setView('chat');
            }
        }
    }, [searchParams, contacts, activeContact, setActiveContact]);

    useEffect(() => {
        if (activeContact) {
            setView('chat');
        } else {
            setView('list');
        }
    }, [activeContact]);

    const handleSelectContact = (contact: any) => {
        setActiveContact(contact);
        resetUnreadCount(contact.id);
        setView('chat');
    };

    const handleBack = () => {
        setView('list');
        setActiveContact(null);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white relative">
            {view === 'list' ? (
                <div className="flex flex-col h-full pt-16">
                    <ChatSidebar
                        contacts={contacts}
                        activeContact={activeContact}
                        onSelectContact={handleSelectContact}
                        unreadCounts={unreadCounts}
                    />
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10 pt-16">
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 truncate">
                                {activeContact?.username}
                            </h2>
                            <p className="text-xs text-gray-500 truncate uppercase tracking-wider font-semibold">
                                {activeContact?.role}
                            </p>
                        </div>
                    </div>
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
                            isSending={isSending}
                        />
                    </div>
                </div>
            )}
            {toastProps && (
                <div className="absolute bottom-20 right-4 left-4 z-50">
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
