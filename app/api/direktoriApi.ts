import { client } from "./client";

export interface DirectoryUser {
    id: number;
    username: string;
    role: "MAHASISWA" | "DOSEN" | "STAF" | "ADMIN";
    photo: string | null;
    isBanned: boolean;
}

export const direktoriApi = {
    getUsers: async (): Promise<DirectoryUser[]> => {
        try {
            // Reusing the chat's public members endpoint as it returns exactly what we need
            // (all users sorted by username with role, photo, and id)
            const response = await client.get("/chat/public/members");
            return response.data;
        } catch (error: any) {
            console.error("Failed to fetch directory users:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch directory users");
        }
    }
};
