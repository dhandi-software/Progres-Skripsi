import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { ChatSidebar } from "~/components/ui/chat-sidebar";
import { ChatWindow } from "~/components/ui/chat-window";
import { useChat } from "~/hooks/useChat";
import { CreateGroupModal } from "./CreateGroupModal";
import { AddMemberModal } from "./AddMemberModal";

export function ChatDesktop({ title }: { title: string }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    
    const {
        contacts,
        activeContact,
        setActiveContact,
        messages,
        sendMessage,
        isLoadingHistory,
        isSending,
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
        publicMembers,
        kickFromPublic,
        unbanFromPublic
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
        <div className="flex h-full pb-[4px] overflow-hidden relative bg-white">
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
                isSending={isSending}
                onMarkAsRead={markAsRead}
                onDeleteMessage={deleteMessage}
                onDeleteMessageForMe={deleteMessageForMe}
                publicMembers={publicMembers}
                onKickPublic={kickFromPublic}
                onUnbanPublic={unbanFromPublic}
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
            />
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
