export interface PenilaianItem {
    mahasiswaId: string;
    nama: string;
    nim: string;
    tahunMasuk: string;
    judulSkripsi: string;
    penilaianId: number | null;

    // Components
    p1_k1: number | null;
    p1_k2: number | null;
    p1_k3: number | null;
    p1_total: number | null;
    p1_nama: string | null;

    p2_k1: number | null;
    p2_k2: number | null;
    p2_k3: number | null;
    p2_total: number | null;
    p2_nama: string | null;

    nilai: number | null; // Detailed average
    keterangan: string | null;
    tanggal: string | null;

    pembimbingId?: string;
    pembimbingNama?: string;
    pengujiId?: string | null;
    pengujiNama?: string | null;
    suratTugasUrl?: string | null;
}

export interface FormState {
    mahasiswaId: string;
    penilaianId: number | null;
    nama: string;
    nim: string;

    p1_k1: string; p1_k2: string; p1_k3: string; p1_nama: string;
    p2_k1: string; p2_k2: string; p2_k3: string; p2_nama: string;

    suratTugasUrl?: string | null;
    keterangan: string;
}

export interface ConfirmModalState {
    type: "bulk" | "row" | "cancel" | "cancel_bulk";
    mahasiswaId?: string;
    pengujiId?: string;
    pembimbingId?: string;
    studentName?: string;
    pengujiName?: string;
    pembimbingName?: string;
}

export function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "?", color: "text-gray-400", bg: "bg-gray-100" };
    if (nilai >= 80) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 70) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 60) return { huruf: "B-", color: "text-cyan-700", bg: "bg-cyan-100" };
    if (nilai >= 50) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 40) return { huruf: "C-", color: "text-amber-700", bg: "bg-amber-100" };
    return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
}

export function formatNilai(val: number | null | undefined, fractionDigits = 2): string {
    if (val === null || val === undefined) return "-";
    return val.toFixed(fractionDigits);
}
