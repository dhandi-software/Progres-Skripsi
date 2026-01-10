import { client } from "~/api/client";
import type {
    DeleteMediaRequest,
    MediaResponse,
    UpdateMediaRequest,
    PaginatedMediaData,
} from "~/api/types";

export const mediaApi = {
    getAllMedia: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<MediaResponse> => {
        try {
            const response = await client.get("/media", { params });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching media:", error);
            throw error;
        }
    },

    createMedia: async (file: File, name?: string): Promise<MediaResponse> => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (name) {
                formData.append("name", name);
            }

            const response = await client.post("/media", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Error uploading media:", error);
            throw error;
        }
    },

    updateMedia: async (
        id: string,
        data: UpdateMediaRequest,
    ): Promise<MediaResponse> => {
        try {
            const response = await client.put(`/media/${id}`, data);
            return response.data;
        } catch (error: any) {
            console.error("Error updating media:", error);
            throw error;
        }
    },

    deleteMedia: async (data: DeleteMediaRequest): Promise<MediaResponse> => {
        try {
            // Note: usually DELETE requests with body need 'data' config in axios
            const response = await client.delete("/media", { data });
            return response.data;
        } catch (error: any) {
            console.error("Error deleting media:", error);
            throw error;
        }
    },

    getFileUrl: (pathOrUrl: string): string => {
        if (!pathOrUrl) return "";
        if (pathOrUrl.startsWith("http")) return pathOrUrl;
        
        // Construct URL based on how backend serves files
        // Assuming the client baseURL is set correctly to API_URL
        const baseUrl = client.defaults.baseURL || "";
        // If path starts with slash, remove it to avoid double slashes if baseURL ends with one
        const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl.substring(1) : pathOrUrl;
        const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
        
        // Adjust this logic if your backend serves static files from a specific route like /uploads
        // For now assuming the path returned by API is a full relative path or needs simple concatenation
        // However, looking at MediaContext logic: 
        // const serverUrl = mediaApi.getFileUrl(apiItem.path || fileName);
        
        // If the backend returns a relative path like "uploads/image.jpg", we might need to prepend base URL
        // But often static files are served from the root or a specific static endpoint.
        // Let's assume standard behavior:
        
        // If we look at client.ts: API_URL = baseUrl/api/v1
        // Usually static files are at baseUrl/uploads or similar, not under /api/v1
        
        const rootUrl = baseUrl.replace(/\/api\/v1\/?$/, "");
        
        return `${rootUrl}/${cleanPath}`;
    },
};
