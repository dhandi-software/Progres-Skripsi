// TODO: Move API_URL to environment variable or shared config
const API_URL = "http://localhost:5000/api";

export const chatService = {
  async getContacts(userId: number) {
    const response = await fetch(`${API_URL}/chat/contacts/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return response.json();
  },

  async getChatHistory(userId: number, otherUserId: number | 'public') {
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
  }
};
