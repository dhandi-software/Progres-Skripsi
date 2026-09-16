export interface PengajuanDetail {
    id: number;
    judul: string;
    mahasiswa: {
        nama: string;
        nim: string;
        bimbingan?: any[];
    };
    status: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk: string;
    sksDicapai: string;
    sksNilaiD?: string;
    batasStudi?: string;
    remarks?: string;
    deadlineRevisi?: string;
}

export type PengajuanActionStatus = 'APPROVED' | 'REJECTED' | 'REVISION' | 'PENDING' | 'PENDING_KOORDINATOR';

export interface UsePeninjauanDetailProps {
    id: string;
}
