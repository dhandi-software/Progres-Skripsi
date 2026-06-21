import { client as apiClient } from "./client";

export interface TempatKP {
    namaPerusahaan: string;
    tlpFaxPerusahaan: string;
    alamatPerusahaan: string;
    kontakPembimbing: string;
}

export interface LogbookEntry {
    id: string;
    tanggalPukul: string;
    uraian: string;
    mahasiswaParaf: string | null;
    pembimbingParaf: string | null;
    catatan: string;
}

export const logbookApi = {
    // Info Perusahaan
    getInfo: async (mahasiswaId?: number): Promise<TempatKP> => {
        const url = mahasiswaId ? `/logbook/info?mahasiswaId=${mahasiswaId}` : '/logbook/info';
        const response = await apiClient.get(url);
        return response.data;
    },
    
    updateInfo: async (data: TempatKP, mahasiswaId?: number): Promise<TempatKP> => {
        const url = mahasiswaId ? `/logbook/info?mahasiswaId=${mahasiswaId}` : '/logbook/info';
        const response = await apiClient.post(url, data);
        return response.data.data;
    },

    // Logbook Entries
    getEntries: async (mahasiswaId?: number): Promise<LogbookEntry[]> => {
        const url = mahasiswaId ? `/logbook/entries?mahasiswaId=${mahasiswaId}` : '/logbook/entries';
        const response = await apiClient.get(url);
        return response.data;
    },

    syncEntries: async (entries: LogbookEntry[], mahasiswaId?: number): Promise<void> => {
        const url = mahasiswaId ? `/logbook/entries/sync?mahasiswaId=${mahasiswaId}` : '/logbook/entries/sync';
        await apiClient.post(url, { entries });
    },

    getStudentProfile: async (mahasiswaId: number): Promise<any> => {
        const response = await apiClient.get(`/logbook/student-profile/${mahasiswaId}`);
        return response.data;
    }
};
