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

    // New Dosen endpoint for final bimbingan report
    getLaporanAkhir: async () => {
        const response = await client.get("/bimbingan/dosen-laporan-akhir");
        return response.data;
    },

    // New Dosen endpoint for assigning tasks
    assignBimbinganTask: async (mahasiswaId: number, topik: string, jadwalBimbingan?: Date) => {
        const response = await client.post("/bimbingan/assign-task", { 
            mahasiswaId, 
            topik,
            jadwalBimbingan: jadwalBimbingan ? jadwalBimbingan.toISOString() : undefined
        });
        return response.data;
    },

    // Edit an active assigned task
    editBimbinganTask: async (id: number, topik: string, jadwalBimbingan?: Date) => {
        const response = await client.put(`/bimbingan/edit-task/${id}`, {
            topik,
            jadwalBimbingan: jadwalBimbingan ? jadwalBimbingan.toISOString() : undefined
        });
        return response.data;
    },

    // New Mahasiswa endpoint for currently active task
    getMahasiswaActiveTask: async () => {
        const response = await client.get("/bimbingan/mahasiswa-active-task");
        return response.data;
    },

    // Mark as read by Dosen
    markAsRead: async (id: number) => {
        const response = await client.put(`/bimbingan/mark-as-read/${id}`);
        return response.data;
    },

    // Get all tasks for Mahasiswa
    getMahasiswaAllTasks: async () => {
        const response = await client.get("/bimbingan/mahasiswa-all-tasks");
        return response.data;
    },

    // Upload draft by Mahasiswa
    uploadDraftMahasiswa: async (id: number, file: File, keteranganProgres?: string) => {
        const formData = new FormData();
        formData.append("file", file);
        if (keteranganProgres) formData.append("keteranganProgres", keteranganProgres);
        
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
    },

    // Get History of Bimbingan Versions
    getBimbinganHistory: async (mahasiswaId: number, topik: string) => {
        const response = await client.get(`/bimbingan/history/${mahasiswaId}/${encodeURIComponent(topik)}`);
        return response.data;
    },

    // Annotations CRUD
    createAnnotation: async (data: any) => {
        const response = await client.post('/bimbingan/annotations', data);
        return response.data;
    },
    getAnnotations: async (bimbinganId: number) => {
        const response = await client.get(`/bimbingan/annotations/${bimbinganId}`);
        return response.data;
    },
    deleteAnnotation: async (id: number) => {
        const response = await client.delete(`/bimbingan/annotations/${id}`);
        return response.data;
    }
};
