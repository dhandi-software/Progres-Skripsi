import { client } from "~/api/client";

export const chatService = {
  async getContacts(userId: number) {
    const response = await client.get(`/chat/contacts/${userId}`);
    return response.data;
  },

  async getChatHistory(userId: number, otherUserId: number | string) {
    const response = await client.get(`/chat/history/${userId}/${otherUserId}`);
    return response.data;
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post("/chat/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // Returns { url: string, type: string }
  },

  async getUnreadCount(userId: number) {
    const response = await client.get(`/chat/unread/${userId}`);
    return response.data; // Returns { count: number }
  },

  async createGroup(name: string, participantIds: number[], adminId: number) {
    const response = await client.post("/chat/groups", { name, memberIds: participantIds, adminId });
    return response.data;
  },

  async addMembersToGroup(groupId: number, participantIds: number[], adminId: number) {
    const response = await client.post(`/chat/groups/${groupId}/members`, { memberIds: participantIds, adminId });
    return response.data;
  },

  async removeMemberFromGroup(groupId: number, userId: number, adminId: number) {
    const response = await client.delete(`/chat/groups/${groupId}/members/${userId}`, {
      data: { adminId },
    });
    return response.data;
  },

  async deleteGroup(groupId: number, adminId: number) {
    const response = await client.delete(`/chat/groups/${groupId}`, {
      data: { adminId },
    });
    return response.data;
  },

  async getPublicMembers() {
    const response = await client.get("/chat/public/members");
    return response.data;
  },

  async kickFromPublic(userId: number) {
    const response = await client.post("/chat/public/kick", { userId });
    return response.data;
  },

  async unbanFromPublic(userId: number) {
    const response = await client.post("/chat/public/unban", { userId });
    return response.data;
  }
};
