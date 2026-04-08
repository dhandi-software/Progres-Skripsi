import { client } from "./client";

export interface Acara {
    id: number;
    dosenId: number;
    title: string;
    content: string;
    type: "ASSIGNMENT" | "ANNOUNCEMENT";
    createdAt: string;
    updatedAt: string;
    dosen: {
        nama: string;
    };
    comments: AcaraComment[];
    isRead?: boolean; // Only present for students
    isReadByMe?: boolean; // New property for robust sync
}

export interface AcaraComment {
    id: number;
    acaraId: number;
    userId: number;
    content: string;
    createdAt: string;
    user: {
        username: string;
        role: string;
        id: number;
        mahasiswa?: { nama: string };
        dosen?: { nama: string };
    };
}

export interface AcaraResponse {
    data: Acara[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const acaraApi = {
    getAcara: async (page = 1, limit = 10): Promise<AcaraResponse> => {
        const response = await client.get("/acara", {
            params: { page, limit }
        });
        return response.data;
    },
    getAcaraById: async (id: number): Promise<Acara> => {
        const response = await client.get(`/acara/${id}`);
        return response.data;
    },
    createAcara: async (data: { title: string; content: string; type?: string }): Promise<Acara> => {
        const response = await client.post("/acara", data);
        return response.data;
    },
    updateAcara: async (id: number, data: { title?: string; content?: string; type?: string }): Promise<Acara> => {
        const response = await client.put(`/acara/${id}`, data);
        return response.data;
    },
    deleteAcara: async (id: number): Promise<{ message: string }> => {
        const response = await client.delete(`/acara/${id}`);
        return response.data;
    },
    addComment: async (id: number, content: string): Promise<AcaraComment> => {
        const response = await client.post(`/acara/${id}/comment`, { content });
        return response.data;
    },
    uploadFile: async (file: File): Promise<{ url: string; originalName: string; size: number }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await client.post("/acara/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await client.get("/acara/unread-count");
        return response.data;
    },
    markAsRead: async (id: number): Promise<{ success: boolean }> => {
        const response = await client.post(`/acara/${id}/read`);
        return response.data;
    }
};
