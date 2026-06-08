import { client } from "./client";

export const penilaianApi = {
    // Get all penilaian for dosen's supervised students
    getPenilaianByDosen: async () => {
        const response = await client.get("/penilaian/dosen");
        return response.data;
    },

    assignPenguji: async (mahasiswaId: number, pengujiId: number | null) => {
        const response = await client.post("/penilaian/assign-penguji", { mahasiswaId, pengujiId });
        return response.data;
    },

    // Create or update penilaian (upsert logic handled by backend)
    createPenilaian: async (data: {
        mahasiswaId: number;
        p1_k1: number; p1_k2: number; p1_k3: number; p1_nama: string;
        p2_k1: number; p2_k2: number; p2_k3: number; p2_nama: string;
        keterangan: string;
    }) => {
        const response = await client.post("/penilaian", data);
        return response.data;
    },

    updatePenilaian: async (id: number, data: {
        p1_k1: number; p1_k2: number; p1_k3: number; p1_nama: string;
        p2_k1: number; p2_k2: number; p2_k3: number; p2_nama: string;
        keterangan: string;
    }) => {
        const response = await client.put(`/penilaian/${id}`, data);
        return response.data;
    },


    deletePenilaian: async (id: number) => {
        const response = await client.delete(`/penilaian/${id}`);
        return response.data;
    },

    assignPembimbing: async (mahasiswaId: number, pembimbingId: number) => {
        const response = await client.post("/penilaian/assign-pembimbing", { mahasiswaId, pembimbingId });
        return response.data;
    }
};
