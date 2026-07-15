import { client } from "./client";

export interface SanksiAdministrasi {
    id: number;
    mahasiswaId?: string;
    mahasiswaNim?: string;
    dosenId?: string;
    dosenNidn?: string;
    nama: string;
    nim: string;
    hariSidang: string;
    tanggalSidang: string;
    hariTenggat: string;
    tanggalSurat: string;
    status?: string;
    tenggatWaktu?: string;
    createdAt: string;
    updatedAt: string;
    mahasiswa?: {
        id: string | number;
        nama: string;
        nim: string;
    };
    dosen?: {
        id: number;
        nama: string;
        nidn: string;
    };
}

export interface SupervisedStudent {
    id: string | number;
    nama: string;
    nim: string;
    tanggalSidang?: string | null;
    statusSidang?: string | null;
}

export const sanksiApi = {
    getAllSanksi: async (): Promise<SanksiAdministrasi[]> => {
        const response = await client.get("/sanksi");
        return response.data;
    },

    getSupervisedStudents: async (): Promise<SupervisedStudent[]> => {
        const response = await client.get("/sanksi/students");
        return response.data;
    },

    createSanksi: async (data: Omit<SanksiAdministrasi, 'id' | 'createdAt' | 'updatedAt' | 'dosenId'>): Promise<SanksiAdministrasi> => {
        const response = await client.post("/sanksi", data);
        return response.data;
    },

    updateSanksi: async (id: number, data: Partial<SanksiAdministrasi>): Promise<SanksiAdministrasi> => {
        const response = await client.put(`/sanksi/${id}`, data);
        return response.data;
    },

    deleteSanksi: async (id: number): Promise<{ message: string }> => {
        const response = await client.delete(`/sanksi/${id}`);
        return response.data;
    },

    terimaHardcover: async (id: number): Promise<SanksiAdministrasi> => {
        const response = await client.patch(`/sanksi/${id}/terima`);
        return response.data;
    }
};
