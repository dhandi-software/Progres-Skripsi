import { client } from "./client";

export const penilaianApi = {
    // Get all penilaian for dosen's supervised students
    getPenilaianByDosen: async () => {
        const response = await client.get("/penilaian/dosen");
        return response.data;
    },

    // Create or update penilaian (upsert logic handled by backend)
    createPenilaian: async (mahasiswaId: number, nilai: number, keterangan: string) => {
        const response = await client.post("/penilaian", { mahasiswaId, nilai, keterangan });
        return response.data;
    },

    updatePenilaian: async (id: number, nilai: number, keterangan: string) => {
        const response = await client.put(`/penilaian/${id}`, { nilai, keterangan });
        return response.data;
    },

    deletePenilaian: async (id: number) => {
        const response = await client.delete(`/penilaian/${id}`);
        return response.data;
    }
};
