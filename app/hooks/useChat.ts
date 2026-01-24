import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { chatService } from "~/services/chatService";
import type { Message, ChatContact, SendMessagePayload } from "~/types/chat";
import { useAuth } from "~/hooks/useAuth";

const SOCKET_URL = "http://localhost:5000";

export function useChat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  // Initialize socket
  useEffect(() => {
    if (!user) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit("join", user.id);

    newSocket.on("receive_message", (message: Message) => {
      // Play sound and show notification if message is not from self
      if (message.senderId !== user.id) {
          const isChatOpen = activeContact?.id === message.senderId || (activeContact?.id === 0 && message.isPublic);
          const isWindowFocused = document.hasFocus();

          if (!isChatOpen || !isWindowFocused) {
              // const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); 
              // audio.play().catch(e => console.log("Audio play failed", e));

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
              // Logic: If public, increment 0. If private, increment senderId.
              const contactIdToUpdate = message.isPublic ? 0 : message.senderId;
              setUnreadCounts(prev => ({
                  ...prev,
                  [contactIdToUpdate]: (prev[contactIdToUpdate] || 0) + 1
              }));
          }
      }

      setMessages((prev) => {
          // Check if message belongs to current active conversation
          // Case 1: Public Chat
          if (activeContact?.id === 0 && message.isPublic) {
              return [...prev, message];
          }
          // Case 2: Private Chat
          if (
            activeContact?.id !== 0 && 
            !message.isPublic &&
            (
                (message.senderId === activeContact?.id && message.receiverId === user.id) ||
                (message.senderId === user.id && message.receiverId === activeContact?.id)
            )
          ) {
             return [...prev, message];
          }
          return prev;
      });

      // Update Contact's Last Message
      setContacts(prevContacts => {
          return prevContacts.map(contact => {
              // Public Chat Update
              if (message.isPublic) {
                   if (contact.id === 0) {
                       return { ...contact, lastMessage: message };
                   }
                   return contact;
              }
              // Private Chat Update
              if (
                  (message.senderId === contact.id && message.receiverId === user.id) ||
                  (message.senderId === user.id && message.receiverId === contact.id)
              ) {
                  return { ...contact, lastMessage: message };
              }
              return contact;
          });
      });
    });
    
    // Also listen for my own messages sent from other tabs/devices or confirmed by server
    newSocket.on("message_sent", (message: Message) => {
        // ... existing history update ...
       if (
        activeContact &&
        !message.isPublic && 
        (message.receiverId === activeContact.id)
      ) {
         setMessages((prev) => {
             if (prev.find(m => m.id === message.id)) return prev;
             return [...prev, message];
         });
      }

       // Update Last Message in Sidebar for Sent Messages
        setContacts(prevContacts => {
            return prevContacts.map(contact => {
                 // Public Chat
                if (message.isPublic && contact.id === 0) {
                     return { ...contact, lastMessage: message };
                }
                // Private Chat
                 if (
                    !message.isPublic &&
                    (message.receiverId === contact.id)
                ) {
                    return { ...contact, lastMessage: message };
                }
                return contact;
            });
        });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, activeContact]);

  const resetUnreadCount = (contactId: number) => {
      setUnreadCounts(prev => {
          const newCounts = { ...prev };
          delete newCounts[contactId];
          return newCounts;
      });
  };

  // Fetch contacts and add Public Room
  useEffect(() => {
    if (!user) return;
    chatService.getContacts(user.id).then((response) => {
        // Handle both old array format (fallback) and new object format
        const data = Array.isArray(response) ? response : response.users;
        const lastPublicMsg = !Array.isArray(response) ? response.lastPublicMessage : undefined;

        // Add Public Room as a fake contact
        const publicRoom: ChatContact = {
            id: 0, // Special ID for public room
            username: "Ruang Publik",
            role: "Grup", // Custom role for display
            email: "",
            lastMessage: lastPublicMsg
        };
        // Ensure data is array before spreading
        const validContacts = Array.isArray(data) ? data : [];
        setContacts([publicRoom, ...validContacts]);
    }).catch(console.error);
  }, [user]);

  // Fetch history when active contact changes
  useEffect(() => {
    if (!user || !activeContact) return;

    setIsLoadingHistory(true);
    const targetId = activeContact.id === 0 ? 'public' : activeContact.id;
    
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

    return () => {
        socket.off("messages_read");
        socket.off("message_deleted");
        socket.off("message_deleted_for_me");
    };
  }, [socket, user]);

  const sendMessage = useCallback(async (content: string, file?: File, replyToId?: number) => {
    if (!user || !activeContact || !socket) return;

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

    const payload: SendMessagePayload & { replyToId?: number } = {
      senderId: user.id,
      receiverId: activeContact.id === 0 ? 0 : activeContact.id,
      content: content || undefined,
      attachmentUrl: attachmentUrl || undefined,
      attachmentType: attachmentType === "none" ? undefined : attachmentType,
      isPublic: activeContact.id === 0,
      replyToId
    };

    socket.emit("send_message", payload);
  }, [user, activeContact, socket]);

  const markAsRead = useCallback((senderId: number) => {
      if (!socket || !user) return;
      socket.emit("mark_read", { conversationWithId: senderId, userId: user.id });
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
          if (msg.senderId === senderId && !msg.isRead) {
               return { ...msg, isRead: true };
          }
          return msg;
      }));
      
      resetUnreadCount(senderId);
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
    deleteMessageForMe
  };
}
