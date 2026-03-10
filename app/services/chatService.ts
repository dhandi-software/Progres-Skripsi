// TODO: Move API_URL to environment variable or shared config
const API_URL = "http://localhost:5002/api";

export const chatService = {
  async getContacts(userId: number) {
    const response = await fetch(`${API_URL}/chat/contacts/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return response.json();
  },

  async getChatHistory(userId: number, otherUserId: number | string) {
    const response = await fetch(`${API_URL}/chat/history/${userId}/${otherUserId}`);
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return response.json();
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/chat/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload file");
    return response.json(); // Returns { url: string, type: string }
  },

  async getUnreadCount(userId: number) {
    const response = await fetch(`${API_URL}/chat/unread/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch unread count");
    return response.json(); // Returns { count: number }
  },

  async createGroup(name: string, participantIds: number[], adminId: number) {
    const response = await fetch(`${API_URL}/chat/groups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, memberIds: participantIds, adminId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to create group: ${err.error || err.message || response.statusText}`);
    }
    return response.json();
  }
};
