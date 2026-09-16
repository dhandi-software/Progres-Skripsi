import { useState } from "react";
import type { ChatContact, ChatSidebarProps } from "~/features/chat/types/chat";
import { profileApi } from "~/api/profileApi";
import { useNavigate } from "react-router";

export function useChatSidebar({ contacts, currentUser }: ChatSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const getAvatarDetails = (contact: ChatContact) => {
        const role = contact.role?.toLowerCase() || "";
        const username = contact.username?.toLowerCase() || "";
        
        let initials = "";
        let color = "bg-[#dfe3e5]";
        let image = "";

        if (contact.id === 0) {
            return { initials: "Rp", color: "bg-[#e5e7eb]", image: "" }; 
        }

        if (contact.isGroup) {
            return { initials: contact.username.substring(0, 2).toUpperCase(), color: "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm", image: "" };
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

    const filteredContacts = contacts.filter(c => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return c.username?.toLowerCase().includes(query) || c.role?.toLowerCase().includes(query);
    });

    const getMyInitials = () => {
        if (!currentUser) return "DA";
        const name = currentUser.dosen?.nama || currentUser.mahasiswa?.nama || currentUser.username || "Dhandi Adam";
        
        if (/^\d+$/.test(name)) return "DA";
        
        return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const sortedFilteredContacts = [...filteredContacts].sort((a, b) => {
        if (a.id === 0) return -1;
        if (b.id === 0) return 1;

        if (a.isGroup && !b.isGroup) return -1;
        if (!a.isGroup && b.isGroup) return 1;

        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return timeB - timeA;
    });

    return {
        searchQuery,
        setSearchQuery,
        navigate,
        getAvatarDetails,
        sortedFilteredContacts,
        getMyInitials
    };
}
