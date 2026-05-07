import { client } from "./client";

export interface Download {
    id: number;
    dosenId: number;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
    updatedAt: string;
    dosen: {
        nama: string;
    };
}

export interface DownloadResponse {
    data: Download[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const downloadApi = {
    getDownloads: async (page = 1, limit = 10): Promise<DownloadResponse> => {
        const response = await client.get("/download", {
            params: { page, limit }
        });
        return response.data;
    },
    getDownloadById: async (id: number): Promise<Download> => {
        const response = await client.get(`/download/${id}`);
        return response.data;
    },
    createDownload: async (data: { title: string; description?: string; fileUrl: string; fileType: string }): Promise<Download> => {
        const response = await client.post("/download", data);
        return response.data;
    },
    updateDownload: async (id: number, data: { title?: string; description?: string; fileUrl?: string; fileType?: string }): Promise<Download> => {
        const response = await client.put(`/download/${id}`, data);
        return response.data;
    },
    deleteDownload: async (id: number): Promise<{ message: string }> => {
        const response = await client.delete(`/download/${id}`);
        return response.data;
    },
    uploadFile: async (file: File): Promise<{ url: string; originalName: string; size: number }> => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await client.post("/download/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },
    downloadFile: async (id: number, title: string) => {
        const response = await client.get(`/download/${id}/download`, {
            responseType: 'blob'
        });
        
        // Get MIME type from response headers if available, or fallback
        const contentType = response.headers['content-type'];
        const blob = new Blob([response.data], { type: contentType });
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        
        // Use the filename from Content-Disposition if available, or build it
        const contentDisposition = response.headers['content-disposition'];
        let fileName = title;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch?.[1]) {
                fileName = fileNameMatch[1];
            }
        }

        link.setAttribute('download', fileName); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }
};
