import { client } from './client';

export interface JadwalKp {
    id: number;
    tipe: string; // PENGARAHAN_KP, PENGAJUAN_SIDANG
    judul: string;
    deskripsi?: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    stafNip: string;
}

export const jadwalKpApi = {
    getAllJadwalKp: async () => {
        const response = await client.get('/jadwal-kp');
        return response.data;
    },
    
    getActiveJadwalKp: async (tipe?: string) => {
        const response = await client.get(`/jadwal-kp/active${tipe ? `?tipe=${tipe}` : ''}`);
        return response.data;
    },

    createJadwalKp: async (data: Partial<JadwalKp>) => {
        const response = await client.post('/jadwal-kp', data);
        return response.data;
    },

    updateJadwalKp: async (id: number, data: Partial<JadwalKp>) => {
        const response = await client.put(`/jadwal-kp/${id}`, data);
        return response.data;
    },

    deleteJadwalKp: async (id: number) => {
        const response = await client.delete(`/jadwal-kp/${id}`);
        return response.data;
    }
};
