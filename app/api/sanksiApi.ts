import { client } from "./client";
import type { SanksiAdministrasi, SupervisedStudent } from "./types";
export type { SanksiAdministrasi, SupervisedStudent };

export const sanksiApi = {
    getAllSanksi: async (search?: string, status?: string): Promise<{ data: SanksiAdministrasi[], summary: any }> => {
        const response = await client.get("/sanksi", { params: { search, status } });
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
    },

    konfirmasiSanksi: async (id: number): Promise<SanksiAdministrasi> => {
        const response = await client.patch(`/sanksi/${id}/konfirmasi`);
        return response.data;
    }
};
