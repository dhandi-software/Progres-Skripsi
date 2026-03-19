import { client } from "./client";

export const bimbinganApi = {
    getAllBimbingan: async () => {
        const response = await client.get("/bimbingan");
        return response.data;
    },

    getBimbinganByMahasiswa: async (mahasiswaId: number) => {
        const response = await client.get(`/bimbingan/mahasiswa/${mahasiswaId}`);
        return response.data;
    },

    createBimbingan: async (data: any) => {
        const response = await client.post("/bimbingan", data);
        return response.data;
    },

    // New Dosen endpoint for getting students in bimbingan phase
    getDosenBimbinganStudents: async () => {
        const response = await client.get("/bimbingan/dosen-students");
        return response.data;
    },

    // New Dosen endpoint for assigning tasks
    assignBimbinganTask: async (mahasiswaId: number, topik: string) => {
        const response = await client.post("/bimbingan/assign-task", { mahasiswaId, topik });
        return response.data;
    },

    // New Mahasiswa endpoint for currently active task
    getMahasiswaActiveTask: async () => {
        const response = await client.get("/bimbingan/mahasiswa-active-task");
        return response.data;
    },

    // Upload draft by Mahasiswa
    uploadDraftMahasiswa: async (id: number, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await client.post(`/bimbingan/upload-mahasiswa/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Upload revision by Dosen
    uploadRevisiDosen: async (id: number, file: File | null, status: string, catatan: string) => {
        const formData = new FormData();
        if (file) formData.append("file", file);
        formData.append("status", status);
        formData.append("catatan", catatan);
        const response = await client.post(`/bimbingan/upload-dosen/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
