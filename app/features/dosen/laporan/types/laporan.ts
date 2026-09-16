export interface TempatKPItem {
    namaPerusahaan: string | null;
    tlpFaxPerusahaan: string | null;
    alamatPerusahaan: string | null;
    kontakPembimbing: string | null;
}

export interface LogbookItem {
    id: number;
    tanggalPukul: string;
    uraian: string;
    mahasiswaParaf: string | null;
    pembimbingParaf: string | null;
    catatan: string | null;
}

export interface BimbinganDetailItem {
    id: number;
    tanggal: string;
    topik: string;
    catatan: string;
    status: string;
}

export interface LaporanItem {
    id: string;
    nama: string;
    nim: string;
    judulSkripsi: string;
    totalBimbinganSelesai: number;
    totalBimbingan: number;
    totalLogbook: number;
    totalLogbookApproved: number;
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
    nilaiAkhir: number | null;
    keteranganPenilaian: string | null;
    tanggalPenilaian: string | null;
    statusProgress: string;
    tempatKP: TempatKPItem | null;
    logbooks: LogbookItem[];
    bimbingans: BimbinganDetailItem[];
}

export function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "-", color: "text-gray-400 border-gray-200", bg: "bg-gray-100" };
    if (nilai >= 80) return { huruf: "A", color: "text-emerald-700 border-emerald-300", bg: "bg-emerald-100" };
    if (nilai >= 70) return { huruf: "B", color: "text-blue-700 border-blue-300", bg: "bg-blue-100" };
    if (nilai >= 60) return { huruf: "B-", color: "text-cyan-700 border-cyan-300", bg: "bg-cyan-100" };
    if (nilai >= 50) return { huruf: "C", color: "text-yellow-700 border-yellow-300", bg: "bg-yellow-100" };
    if (nilai >= 40) return { huruf: "C-", color: "text-amber-700 border-amber-300", bg: "bg-amber-100" };
    return { huruf: "D", color: "text-orange-700 border-orange-300", bg: "bg-orange-100" };
}

export function formatNilai(val: number | null | undefined, fractionDigits = 0): string {
    if (val === null || val === undefined) return "-";
    return val.toFixed(fractionDigits);
}

export function parseBimbinganCatatan(catatan: string | null | undefined): { grade: number | null; text: string } {
    if (!catatan) return { grade: null, text: "" };
    const match = catatan.match(/^\[NILAI:\s*(\d+)\]\s*(.*)$/s);
    if (match) {
        return {
            grade: parseInt(match[1]),
            text: match[2].trim()
        };
    }
    return { grade: null, text: catatan };
}
