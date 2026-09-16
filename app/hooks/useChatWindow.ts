import { useState, useRef, useEffect } from "react";
import type { Message, ChatContact, ChatWindowProps } from "~/features/chat/types/chat";
import { profileApi } from "~/api/profileApi";

export function useChatWindow({
    activeContact,
    messages,
    currentUser,
    onSendMessage,
    onEditMessage,
    onMarkAsRead,
    onDeleteMessage,
    onDeleteMessageForMe,
    isSending
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string } | null>(null);
    const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
    const [selectedPublicUserId, setSelectedPublicUserId] = useState<number | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const canAttachFiles = () => {
        if (!currentUser || !activeContact) return false;
        const isGroup = activeContact.isGroup || Number(activeContact.id) === 0;
        if (isGroup) return true;
        
        const currentRole = currentUser.role?.toUpperCase() || "";
        const contactRole = activeContact.role?.toUpperCase() || "";
        if (currentRole === "MAHASISWA" && contactRole === "MAHASISWA") {
            return false;
        }
        return true;
    };

    const getAvatarDetails = (contact: ChatContact) => {
        const role = contact.role?.toLowerCase() || "";
        const username = contact.username?.toLowerCase() || "";
        
        let initials = "";
        let color = "bg-[#dfe3e5]";
        let image = "";

        if (contact.id === 0) {
            return { initials: "Rp", color: "bg-[#e5e7eb]", image: "" }; 
        }

        if (role.includes("mahasiswa") || username.includes("mahasiswa")) {
            image = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";
        } else if (role.includes("dosen") || username.includes("dosen")) {
            image = "https://cdn-icons-png.flaticon.com/512/2784/2784488.png";
        } else if (role.includes("kaprodi") || username.includes("kaprodi")) {
            initials = "Ka";
            color = "bg-[#fdffb6]"; 
        } else if (role.includes("staf") || username.includes("staf")) {
            initials = "Sf";
            color = "bg-[#caffbf]"; 
        } else {
            initials = (contact.username || "U")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }

        return { 
            initials, 
            color, 
            image: contact.photo ? profileApi.getProfilePhotoUrl(contact.photo) : image 
        };
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, replyingTo, editingMessageId]);

    useEffect(() => {
        if (activeContact && onMarkAsRead) {
            const isGroup = activeContact.isGroup || Number(activeContact.id) === 0;
            onMarkAsRead(activeContact.id, isGroup);
        }
    }, [messages.length, activeContact?.id, onMarkAsRead]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        
        if (editingMessageId && onEditMessage) {
            onEditMessage(editingMessageId, inputValue);
            setEditingMessageId(null);
            setInputValue("");
        } else {
            onSendMessage(inputValue, undefined, replyingTo?.id);
            setInputValue("");
            setReplyingTo(null);
        }
    };

    const handleEditClick = (msg: Message) => {
        setInputValue(msg.content || "");
        setEditingMessageId(msg.id);
        setReplyingTo(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isSending) return;
        const file = e.target.files?.[0];
        if (file) {
            onSendMessage("", file);
            if (fileInputRef.current) fileInputRef.current.value = "";
            setReplyingTo(null);
        }
    };

    const handleDeleteClick = (messageId: number) => {
        setMessageToDelete(messageId);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteForEveryone = () => {
        if (messageToDelete !== null && onDeleteMessage) {
            onDeleteMessage(messageToDelete);
            setIsDeleteDialogOpen(false);
            setMessageToDelete(null);
        }
    };

    const handleDeleteForMe = () => {
        if (messageToDelete !== null && onDeleteMessageForMe) {
             onDeleteMessageForMe(messageToDelete);
             setIsDeleteDialogOpen(false);
             setMessageToDelete(null);
        }
    };

    return {
        inputValue,
        setInputValue,
        replyingTo,
        setReplyingTo,
        editingMessageId,
        setEditingMessageId,
        messageToDelete,
        setMessageToDelete,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isGroupInfoOpen,
        setIsGroupInfoOpen,
        memberToRemove,
        setMemberToRemove,
        isDeleteGroupOpen,
        setIsDeleteGroupOpen,
        selectedPublicUserId,
        setSelectedPublicUserId,
        fileInputRef,
        messagesEndRef,
        canAttachFiles,
        getAvatarDetails,
        handleSend,
        handleEditClick,
        handleFileUpload,
        handleDeleteClick,
        handleDeleteForEveryone,
        handleDeleteForMe
    };
}
