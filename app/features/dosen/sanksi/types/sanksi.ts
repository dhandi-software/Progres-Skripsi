import type { SanksiAdministrasi, SupervisedStudent } from "~/api/sanksiApi";

export type { SanksiAdministrasi, SupervisedStudent };

export interface FormState {
    id?: number;
    mahasiswaId: string;
    nama: string;
    nim: string;
    hariSidang: string;
    tanggalSidang: string;
    hariTenggat: string;
    tanggalSurat: string;
    rawTanggalSidang?: string;
    durasiTenggat?: 1 | 2;
}

export function calculateWeeksLate(tenggat?: string): number {
    if (!tenggat) return 0;
    const now = new Date();
    const tglTenggat = new Date(tenggat);
    if (now <= tglTenggat) return 0;
    const diffMs = now.getTime() - tglTenggat.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.ceil(diffDays / 7);
}
