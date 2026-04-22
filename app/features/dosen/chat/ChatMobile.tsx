import { useState } from "react";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddMemberModal } from "./AddMemberModal";

export function ChatMobile() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    
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
        createGroup,
        deleteGroup,
        addMembersToGroup,
        removeMemberFromGroup,
        isSending
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
                    currentUserRole={user?.role}
                    currentUser={user}
                    onCreateGroup={() => setIsCreateModalOpen(true)}
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
                        onAddMembers={() => setIsAddMemberOpen(true)}
                        onRemoveMember={(memberId) => {
                            if (activeContact?.isGroup && activeContact.realId) {
                                return removeMemberFromGroup(activeContact.realId, memberId);
                            }
                        }}
                        onDeleteGroup={() => {
                            if (activeContact?.isGroup && activeContact.realId) {
                                return deleteGroup(activeContact.realId);
                            }
                        }}
                        isSending={isSending}
                    />
                </div>
            )}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                contacts={contacts}
                onCreate={createGroup}
            />
            {activeContact?.isGroup && (
               <AddMemberModal
                   isOpen={isAddMemberOpen}
                   onClose={() => setIsAddMemberOpen(false)}
                   contacts={contacts}
                   currentMemberIds={activeContact.members?.map(m => m.id) || []}
                   onAdd={async (participantIds) => {
                       await addMembersToGroup(activeContact.realId!, participantIds);
                   }}
               />
            )}
        </div>
    );
}
