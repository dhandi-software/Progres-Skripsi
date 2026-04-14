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

    getPengajuanById: async (id: number) => {
        const response = await client.get(`/pengajuan/${id}`);
        return response.data;
    },

    updateStatus: async (id: number, status: 'APPROVED' | 'REJECTED' | 'REVISION', remarks?: string) => {
        const response = await client.put(`/pengajuan/${id}/status`, { status, remarks });
        return response.data;
    },

    updateProfile: async (data: { nama?: string, photo?: File }) => {
        const formData = new FormData();
        if (data.nama) formData.append('nama', data.nama);
        if (data.photo) formData.append('photo', data.photo);

        const response = await client.put("/pengajuan/profile", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getDosenProfile: async () => {
        const response = await client.get("/pengajuan/profile/dosen");
        return response.data;
    },

    updateDosenProfile: async (data: { nama?: string, jabatan?: string, photo?: File }) => {
        const formData = new FormData();
        if (data.nama) formData.append('nama', data.nama);
        if (data.jabatan) formData.append('jabatan', data.jabatan);
        if (data.photo) formData.append('photo', data.photo);

        const response = await client.put("/pengajuan/profile/dosen", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
