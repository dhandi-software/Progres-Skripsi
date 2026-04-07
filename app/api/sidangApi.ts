import { client } from "./client";

export const sidangApi = {
    getSidangByDosen: async () => {
        const response = await client.get("/sidang/dosen");
        return response.data;
    },
    applyForSidang: async (data: { 
        mahasiswaId: number; 
        judul: string; 
        tanggalSidang?: string; 
        waktuSidang?: string; 
        lokasi?: string 
    }) => {
        const response = await client.post("/sidang/apply", data);
        return response.data;
    },
    pembimbingApprove: async (id: number) => {
        const response = await client.put(`/sidang/approve/${id}`);
        return response.data;
    },
    scheduleByProdi: async (id: number, data: { 
        tanggalSidang: string; 
        waktuSidang: string; 
        lokasi: string; 
        pengujiId: number | null; 
        catatan?: string 
    }) => {
        const response = await client.put(`/sidang/schedule/${id}`, data);
        return response.data;
    },
    deleteSidang: async (id: number) => {
        const response = await client.delete(`/sidang/${id}`);
        return response.data;
    },
    getAllSidang: async () => {
        const response = await client.get("/sidang/dosen");
        return response.data;
    },
    prodiApprove: async (id: number) => {
        const response = await client.put(`/sidang/approve-prodi/${id}`);
        return response.data;
    },
    verifyByKaprodi: async (id: number) => {
        const response = await client.put(`/sidang/verify-kaprodi/${id}`);
        return response.data;
    },
    confirmScheduleByKaprodi: async (id: number) => {
        const response = await client.put(`/sidang/confirm-jadwal-kaprodi/${id}`);
        return response.data;
    }
};
