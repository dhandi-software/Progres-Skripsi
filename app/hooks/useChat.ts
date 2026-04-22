import { useEffect, useState, useRef, useCallback } from "react";
import { UPLOADS_URL } from "~/api/client";
import { io, Socket } from "socket.io-client";
import { chatService } from "~/services/chatService";
import type { Message, ChatContact, SendMessagePayload } from "~/types/chat";
import { useAuth } from "~/hooks/useAuth";

const SOCKET_URL = UPLOADS_URL;

export function useChat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string | number, number>>({});
  const [toastProps, setToastProps] = useState<{title: string, variant: 'default'|'destructive', description?: string} | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const activeContactRef = useRef<ChatContact | null>(null);

  // Sync ref with state
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // Initialize socket
  useEffect(() => {
    if (!user) return;

    // Prevent multiple connections if user didn't change (strict mode double mount safety handled by cleanup)
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join", user.id);

  newSocket.on("receive_message", (message: Message) => {
      // Use ref to get current active contact without re-triggering effect
      const currentActive = activeContactRef.current;
      const isGroupMessage = !!message.roomId;
      
      // Play sound and show notification if message is not from self
      if (message.senderId !== user.id) {
          const isChatOpen = 
            (isGroupMessage && currentActive?.isGroup && currentActive.realId === message.roomId) || 
            (message.isPublic && currentActive?.id === 0) ||
            (!isGroupMessage && !message.isPublic && currentActive?.id === message.senderId);

          const isWindowFocused = document.hasFocus();

          if (!isChatOpen || !isWindowFocused) {
              if (Notification.permission === "granted") {
                  const title = message.isPublic 
                      ? `Pesan Baru di Ruang Publik: ${message.sender?.username}` 
                      : `Pesan Baru dari ${message.sender?.username}`;
                  
                  new Notification(title, {
                      body: message.content || (message.attachmentUrl ? "📎 Lampiran" : "Pesan baru"),
                      icon: "/favicon.ico"
                  });
              }
              
              // Increment Unread Count
              // Logic: If public, increment 0. If group, increment group_ID. If private, increment senderId.
              let contactIdToUpdate: string | number = message.senderId;
              if (message.isPublic) contactIdToUpdate = 0;
              else if (isGroupMessage) contactIdToUpdate = `group_${message.roomId}`;

              setUnreadCounts(prev => ({
                  ...prev,
                  [contactIdToUpdate]: (prev[contactIdToUpdate] || 0) + 1
              }));
              
              // In-App Toast Notification
              if (!isChatOpen) {
                  const senderName = message.sender?.username || 'Seseorang';
                  const titleStr = message.isPublic ? `Pesan di Publik dari ${senderName}` : `Pesan baru dari ${senderName}`;
                  const previewStr = message.content || (message.attachmentUrl ? "Mengirim lampiran" : "Pesan baru");
                  
                  setToastProps({
                       title: titleStr,
                       description: previewStr,
                       variant: "default",
                  });
                  // auto dismiss toast
                  setTimeout(() => setToastProps(null), 4000);
              }
          }
      }

      setMessages((prev) => {
          const currentActive = activeContactRef.current;
          
          // --- CEK DUPLIKASI ---
          if (prev.find(m => m.id === message.id)) return prev;

          // --- CEK OPTIMISTIK ---
          // Jika pesan ini dikirim oleh saya (tab lain atau broadcast), 
          // coba ganti pesan yang sedang loading (optimistic) jika ada.
          if (message.senderId === user.id) {
              const tempIdx = prev.findIndex(m => 
                  (m as any).isOptimistic === true && 
                  (m.content === message.content || (!m.content && !message.content)) &&
                  (m.attachmentUrl === message.attachmentUrl || m.fileName === message.fileName)
              );

              if (tempIdx !== -1) {
                  const next = [...prev];
                  next[tempIdx] = message;
                  return next;
              }
          }

          // Check if message belongs to current active conversation
          // Case 1: Public Chat
          if (currentActive?.id === 0 && message.isPublic) {
              return [...prev, message];
          }
          // Case 2: Private Chat
          if (
            currentActive?.id !== 0 && 
            !message.isPublic &&
            (
                (message.senderId === currentActive?.id && message.receiverId === user.id) ||
                (message.senderId === user.id && message.receiverId === currentActive?.id)
            )
          ) {
             return [...prev, message];
          }
          // Case 3: Group Chat
          if (!message.isPublic && isGroupMessage && currentActive?.isGroup && message.roomId === currentActive.realId) {
              return [...prev, message];
          }
          return prev;
      });

      // Update Contact's Last Message
      setContacts(prevContacts => {
          return prevContacts.map(contact => {
              // Public Chat Update
              if (message.isPublic) {
                   return contact.id === 0 ? { ...contact, lastMessage: message } : contact;
              }

              // Group Chat Update
              if (isGroupMessage) {
                  return (contact.isGroup && contact.realId === message.roomId) 
                    ? { ...contact, lastMessage: message } 
                    : contact;
              }

              // Private Chat Update
              if (!contact.isGroup && contact.id !== 0) {
                  const isMatch = (message.senderId === contact.id && message.receiverId === user.id) ||
                                  (message.senderId === user.id && message.receiverId === contact.id);
                  return isMatch ? { ...contact, lastMessage: message } : contact;
              }

              return contact;
          });
      });
    });
    
    // Also listen for my own messages sent from other tabs/devices or confirmed by server
    newSocket.on("message_sent", (message: Message) => {
        const currentActive = activeContactRef.current;
        const isGroupMessage = !!message.roomId;
        
        if (currentActive) {
            const isTargetActive = message.isPublic 
                ? currentActive.id === 0 
                : isGroupMessage 
                    ? message.roomId === currentActive.realId 
                    : message.receiverId === currentActive.id;

            if (isTargetActive) {
                setMessages((prev) => {
                    if (prev.find(m => m.id === message.id)) return prev;

                    // Cari pesan optimistik yang sesuai, ganti dengan yang asli
                    const tempIdx = prev.findIndex(m => 
                        (m as any).isOptimistic === true && 
                        (m.content === message.content || (!m.content && !message.content)) &&
                        (m.attachmentUrl === message.attachmentUrl || m.fileName === message.fileName)
                    );

                    if (tempIdx !== -1) {
                        const next = [...prev];
                        next[tempIdx] = message;
                        return next;
                    }

                    return [...prev, message];
                });
            }
        }

       // Update Last Message in Sidebar for Sent Messages
        setContacts(prevContacts => {
            return prevContacts.map(contact => {
                const isGroupContact = contact.isGroup;
                
                // Public Chat
                if (message.isPublic && contact.id === 0) return { ...contact, lastMessage: message };
                // Group Chat
                if (isGroupMessage && isGroupContact && message.roomId === contact.realId) return { ...contact, lastMessage: message };
                // Private Chat
                if (!message.isPublic && !isGroupMessage && !isGroupContact && message.receiverId === contact.id) return { ...contact, lastMessage: message };
                
                return contact;
            });
        });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]); // Only depend on user, NOT activeContact

  const resetUnreadCount = (contactId: number | string) => {
      setUnreadCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[contactId];
          return newCounts;
      });
  };

  const fetchContacts = useCallback(async () => {
    if (!user) return;
    try {
        const response = await chatService.getContacts(user.id);
        const data = Array.isArray(response) ? response : response.users;
        const lastPublicMsg = !Array.isArray(response) ? response.lastPublicMessage : undefined;

        const publicRoom: ChatContact = {
            id: 0,
            username: "Ruang Publik",
            role: "Grup",
            email: "",
            lastMessage: lastPublicMsg
        };
        const validContacts = Array.isArray(data) ? data : [];
        
        // Prioritaskan chat grup agar tampil di bagian paling atas
        validContacts.sort((a: any, b: any) => {
            if (a.isGroup && !b.isGroup) return -1;
            if (!a.isGroup && b.isGroup) return 1;
            return 0;
        });
        
        setContacts([publicRoom, ...validContacts]);

        const initialUnread: Record<string | number, number> = {};
        if (!Array.isArray(response) && response.publicUnreadCount) {
            initialUnread[0] = response.publicUnreadCount;
        }
        validContacts.forEach((c: any) => {
            if (c.unreadCount) {
                initialUnread[c.id] = c.unreadCount;
            }
        });
        setUnreadCounts(initialUnread);
    } catch (error) {
        console.error(error);
    }
  }, [user]);

  // Fetch contacts and add Public Room
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fetch history when active contact changes
  useEffect(() => {
    if (!user || activeContact === null) return;

    setIsLoadingHistory(true);
    const targetId = activeContact.id === 0 ? 'public' : activeContact.id as number | string;
    
    chatService.getChatHistory(user.id, targetId)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [user, activeContact]);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);



  // Listen for read receipts and deletions
  useEffect(() => {
    if (!socket) return;

    socket.on("messages_read", ({ byUserId }) => {
        setMessages(prev => prev.map(msg => {
            if (msg.senderId === user?.id && msg.receiverId === byUserId) {
                return { ...msg, isRead: true };
            }
            return msg;
        }));
    });

    socket.on("message_deleted", ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
            msg.id === parseInt(messageId) ? { ...msg, isDeleted: true, content: 'Pesan ini telah dihapus', attachmentUrl: null } : msg
        ));
        
        // Update sidebar preview if necessary
        setContacts(prev => prev.map(c => {
            if (c.lastMessage?.id === parseInt(messageId)) {
                return { 
                    ...c, 
                    lastMessage: { 
                        ...c.lastMessage, 
                        isDeleted: true, 
                        content: 'Pesan ini telah dihapus', 
                        attachmentUrl: null 
                    } 
                };
            }
            return c;
        }));
    });

    socket.on("message_deleted_for_me", ({ messageId }) => {
        setMessages(prev => prev.filter(msg => msg.id !== parseInt(messageId)));
        // Also update sidebar if last message was this one? 
        // Ideally we should refetch or logic is complex. For now just remove from chat.
    });

    const handleGroupRemoval = (groupId: number) => {
        setContacts(prev => prev.filter(c => !(c.isGroup && c.realId === groupId)));
        if (activeContactRef.current?.isGroup && activeContactRef.current?.realId === groupId) {
             setActiveContact(null);
        }
    };

    socket.on("group_member_removed", ({ groupId }) => handleGroupRemoval(groupId));
    socket.on("group_deleted", ({ groupId }) => handleGroupRemoval(groupId));

    return () => {
        socket.off("messages_read");
        socket.off("message_deleted");
        socket.off("message_deleted_for_me");
        socket.off("group_member_removed");
        socket.off("group_deleted");
    };
  }, [socket, user]);

  const sendMessage = useCallback(async (content: string, file?: File, replyToId?: number) => {
    if (!user || !activeContact || !socket || isSending) return;
    
    setIsSending(true);
    try {

    let attachmentUrl = null;
    let attachmentType: "image" | "document" | "none" = "none";

    if (file) {
      try {
        const uploadRes = await chatService.uploadFile(file);
        attachmentUrl = uploadRes.url;
        attachmentType = file.type.startsWith("image/") ? "image" : "document";
      } catch (error) {
        console.error("Upload failed", error);
        return; 
      }
    }

    const isGroup = typeof activeContact.id === 'string' && activeContact.id.startsWith('group_');
    const targetPayload = isGroup 
         ? { roomId: activeContact.realId } 
         : { receiverId: activeContact.id === 0 ? 0 : (activeContact.id as number) };

    const payload: SendMessagePayload & { replyToId?: number } = {
      senderId: user.id,
      ...targetPayload,
      content: content || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentType === "none" ? undefined : attachmentType,
      fileName: file ? file.name : undefined,
      isPublic: activeContact.id === 0,
      replyToId
    };

    // --- Optimistic UI Update Mencegah Delay ---
    const tempId = Date.now() + Math.floor(Math.random() * 1000);
    const optimisticMessage: Message = {
      id: tempId,
      content: payload.content || "",
      senderId: user.id,
      receiverId: payload.receiverId,
      roomId: targetPayload.roomId,
      createdAt: new Date().toISOString(),
      isPublic: payload.isPublic,
      isRead: false,
      isDeleted: false,
      isEdited: false,
      attachmentUrl: payload.attachmentUrl || null,
      attachmentType: payload.attachmentType || null,
      fileName: payload.fileName || null,
      replyToId: payload.replyToId,
      sender: { username: "Anda", role: user.role || "dosen" } // Dummy
    };

    (optimisticMessage as any).isOptimistic = true;

    setMessages(prev => [...prev, optimisticMessage]);

    socket.emit("send_message", payload);
    } catch (error) {
        console.error("SendMessage Error:", error);
    } finally {
        setIsSending(false);
    }
  }, [user, activeContact, socket, isSending]);

  const markAsRead = useCallback((targetId: number | string, isGroup?: boolean) => {
      if (!socket || !user) return;

      if (targetId === 0) {
          // Public Room
          socket.emit("mark_read", { isPublic: true, userId: user.id });
      } else if (isGroup) {
          // Group Room
          const roomId = typeof targetId === 'string' ? parseInt(targetId.split('_')[1]) : targetId;
          socket.emit("mark_read", { roomId, userId: user.id });
      } else {
          // Private DM
          socket.emit("mark_read", { conversationWithId: targetId, userId: user.id });
      }
      
      // Optimistic update for UI counts
      resetUnreadCount(targetId);

      // Optimistic update for message status if private
      if (!isGroup && targetId !== 0) {
          setMessages(prev => prev.map(msg => {
              if (msg.senderId === targetId && !msg.isRead) {
                   return { ...msg, isRead: true };
              }
              return msg;
          }));
      }
  }, [socket, user]);

  const deleteMessage = useCallback((messageId: number) => {
      if (!socket) return;
      socket.emit("delete_message", { messageId });
  }, [socket]);

  const deleteMessageForMe = useCallback((messageId: number) => {
      if (!socket || !user) return;
      socket.emit("delete_message_for_me", { messageId, userId: user.id });
      // Optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [socket, user]);

  const editMessage = useCallback((messageId: number, newContent: string) => {
      if (!socket) return;
      socket.emit("edit_message", { messageId, newContent });

      // Optimistic update for messages
      setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
      ));

      // Optimistic update for contacts (preview)
      setContacts(prev => prev.map(c => {
          if (c.lastMessage?.id === messageId) {
              return { 
                  ...c, 
                  lastMessage: { 
                      ...c.lastMessage!, 
                      content: newContent,
                      isEdited: true
                  } 
              };
          }
          return c;
      }));
  }, [socket]);

  // Listen for edits
  useEffect(() => {
    if (!socket) return;
    
    socket.on("message_edited", ({ messageId, newContent, isEdited }) => {
        setMessages(prev => prev.map(msg => 
            msg.id === parseInt(messageId) ? { ...msg, content: newContent, isEdited: true } : msg
        ));

         // Update sidebar preview if necessary
        setContacts(prev => prev.map(c => {
            if (c.lastMessage?.id === parseInt(messageId)) {
                return { 
                    ...c, 
                    lastMessage: { 
                        ...c.lastMessage, 
                        content: newContent,
                        isEdited: true
                    } 
                };
            }
            return c;
        }));
    });

    return () => {
        socket.off("message_edited");
    }
  }, [socket]);

  const createGroup = useCallback(async (name: string, participantIds: number[]) => {
      if (!user) return;
      try {
          const newRoom = await chatService.createGroup(name, participantIds, user.id);
          // Refetch contacts entirely to get the new group in the sidebar
          await fetchContacts();
          
          // Set active contact immediately to the newly generated group
          setActiveContact({
              ...(newRoom || {}),
              email: ""
          } as any);
          
      } catch (e) {
          console.error('Failed to create group:', e);
          throw e; // Let the caller handle the layout error if needed
      }
  }, [user, fetchContacts]);

  const addMembersToGroup = useCallback(async (groupId: number, participantIds: number[]) => {
      if (!user) return;
      try {
          const updatedGroup = await chatService.addMembersToGroup(groupId, participantIds, user.id);
          setActiveContact({ ...(updatedGroup || {}), email: "" } as any);
          await fetchContacts();
      } catch (e) {
          console.error('Failed to add members:', e);
          throw e;
      }
  }, [user, fetchContacts]);

  const removeMemberFromGroup = useCallback(async (groupId: number, targetUserId: number) => {
      if (!user) return;
      try {
          const updatedGroup = await chatService.removeMemberFromGroup(groupId, targetUserId, user.id);
          setActiveContact({ ...(updatedGroup || {}), email: "" } as any);
          await fetchContacts();
      } catch (e) {
          console.error('Failed to remove member:', e);
          throw e;
      }
  }, [user, fetchContacts]);

  const deleteGroup = useCallback(async (groupId: number) => {
      if (!user) return;
      try {
          await chatService.deleteGroup(groupId, user.id);
          setActiveContact(null);
          await fetchContacts();
      } catch (e) {
          console.error('Failed to delete group:', e);
          throw e;
      }
  }, [user, fetchContacts]);

  return {
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
    toastProps,
    setToastProps,
    isSending
  };
}
