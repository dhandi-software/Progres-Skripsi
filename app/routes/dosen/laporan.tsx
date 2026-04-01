import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Printer, Search, Download } from "lucide-react";
import { cn } from "~/lib/utils";

export function meta() {
    return [
        { title: "Laporan Akhir - Dosen | Skripsi" },
        { name: "description", content: "Laporan akhir mahasiswa bimbingan" },
    ];
}

interface LaporanItem {
    id: number;
    nama: string;
    nim: string;
    judulSkripsi: string;
    totalBimbinganSelesai: number;
    totalBimbingan: number;
    nilaiAkhir: number | null;
    keteranganPenilaian: string | null;
    statusProgress: string;
}

export default function LaporanAkhirPage() {
    const { user } = useAuth();
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLaporan = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const data = await bimbinganApi.getLaporanAkhir();
                setLaporanData(data || []);
            } catch (error) {
                console.error("Failed to fetch Laporan Akhir:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLaporan();
    }, [user]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (!laporanData.length) return;
        
        const headers = ["No", "Nama Mahasiswa", "NIM", "Judul Skripsi", "Total Bimbingan Selesai", "Nilai Akhir", "Status Progres"];
        const rows = laporanData.map((item, index) => [
            index + 1,
            `"${item.nama}"`,
            item.nim,
            `"${item.judulSkripsi || '-'}"`,
            item.totalBimbinganSelesai,
            item.nilaiAkhir !== null ? item.nilaiAkhir : "Belum Dinilai",
            item.statusProgress
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Akhir_Bimbingan_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = laporanData.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.nim.includes(searchQuery)
    );

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] md:p-8 p-4 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 print:hidden">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-[#111b21] tracking-tight">Laporan Akhir Bimbingan</h1>
                    <p className="text-[#667781] mt-1 text-sm md:text-base">
                        Rekapitulasi seluruh mahasiswa bimbingan yang telah disetujui judulnya.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d1d7db] text-[#54656f] rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#D25026] text-white rounded-lg hover:bg-[#b03d19] transition-colors font-medium text-sm shadow-sm"
                    >
                        <Printer size={18} />
                        Cetak PDF
                    </button>
                </div>
            </div>

            {/* Print Header (Visible only when printing) */}
            <div className="hidden print:flex flex-col items-center justify-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold uppercase mb-1">Daftar Rekapitulasi Akhir Bimbingan Mahasiswa</h1>
                <p className="text-sm">Tahun Akademik: {new Date().getFullYear()}</p>
                <p className="text-sm mt-2 font-medium">Dosen Pembimbing: {user?.username}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] overflow-hidden flex flex-col flex-1 print:border-none print:shadow-none">
                <div className="p-4 border-b border-[#e5e5e5] flex items-center print:hidden">
                    <div className="relative w-full ">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Cari berdasarkan nama atau NIM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D25026] focus:border-transparent text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto w-full flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-[#FAFAFA] border-b border-[#e5e5e5] text-[#54656f] print:bg-gray-100 print:text-black print:border-black">
                                <th className="py-4 px-6 font-semibold text-sm w-[60px]">No</th>
                                <th className="py-4 px-6 font-semibold text-sm">Nama / NIM</th>
                                <th className="py-4 px-6 font-semibold text-sm w-[35%]">Judul Skripsi</th>
                                <th className="py-4 px-6 font-semibold text-sm text-center">Total Bimbingan</th>
                                <th className="py-4 px-6 font-semibold text-sm text-center">Nilai Akhir</th>
                                <th className="py-4 px-6 font-semibold text-sm">Status Progres</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e5e5e5] print:divide-black">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#D25026] animate-spin mb-3"></div>
                                            Memuat laporan...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-[#8696a0] bg-gray-50/50">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent">
                                        <td className="py-4 px-6 text-sm text-gray-600 print:text-black">
                                            {idx + 1}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[#111b21] print:text-black">{item.nama}</span>
                                                <span className="text-sm text-[#667781] print:text-gray-700">{item.nim}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[#111b21] print:text-black">
                                            {item.judulSkripsi || "-"}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className="font-bold text-[#D25026] text-lg print:text-black">
                                                    {item.totalBimbinganSelesai}
                                                </span>
                                                <span className="text-xs text-[#8696a0] print:text-gray-600">
                                                    / {item.totalBimbingan}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={cn(
                                                "font-bold text-lg",
                                                item.nilaiAkhir !== null ? "text-[#00a884] print:text-black" : "text-gray-400 print:text-gray-500"
                                            )}>
                                                {item.nilaiAkhir !== null ? item.nilaiAkhir : "-"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold print:bg-transparent print:p-0 print:border-none",
                                                item.statusProgress.includes("Selesai") ? "bg-[#d9fdd3] text-[#00a884]" :
                                                item.statusProgress.includes("Aktif") ? "bg-blue-100 text-blue-700" :
                                                item.statusProgress.includes("Reviu") ? "bg-yellow-100 text-yellow-700" :
                                                item.statusProgress.includes("Revisi") ? "bg-orange-100 text-orange-700" :
                                                "bg-gray-100 text-gray-600"
                                            )}>
                                                {item.statusProgress}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Footer Styles */}
            <style>{`
                @media print {
                    @page { margin: 1.5cm; size: landscape; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
                    ::-webkit-scrollbar { display: none; }
                }
            `}</style>
        </div>
    );
}
