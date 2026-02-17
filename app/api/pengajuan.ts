import { client } from "./client";
import type { PengajuanPayload, PengajuanResponse } from "./types";

export const pengajuanApi = {
    getDosenList: async () => {
        const response = await client.get("/pengajuan/dosen");
        return response.data;
    },
    
    getProfile: async () => {
        const response = await client.get("/pengajuan/profile");
        return response.data;
    },

    createPengajuan: async (data: PengajuanPayload): Promise<PengajuanResponse> => {
        const response = await client.post("/pengajuan", data);
        return response.data;
    },

    // Dosen
    getPengajuanByDosen: async () => {
        const response = await client.get("/pengajuan/dosen/list");
        return response.data;
    },

    updateStatus: async (id: number, status: 'APPROVED' | 'REJECTED', remarks?: string) => {
        const response = await client.put(`/pengajuan/${id}/status`, { status, remarks });
        return response.data;
    }
};
