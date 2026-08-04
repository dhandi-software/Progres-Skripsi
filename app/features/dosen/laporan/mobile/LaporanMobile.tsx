import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Search, Download, Users, ClipboardList, Award } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface TempatKPItem {
    namaPerusahaan: string | null;
    tlpFaxPerusahaan: string | null;
    alamatPerusahaan: string | null;
    kontakPembimbing: string | null;
}

interface LogbookItem {
    id: number;
    tanggalPukul: string;
    uraian: string;
    mahasiswaParaf: string | null;
    pembimbingParaf: string | null;
    catatan: string | null;
}

interface BimbinganDetailItem {
    id: number;
    tanggal: string;
    topik: string;
    catatan: string;
    status: string;
}

interface LaporanItem {
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

function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "-", color: "text-gray-400 border-gray-200", bg: "bg-gray-100" };
    if (nilai >= 80) return { huruf: "A", color: "text-emerald-700 border-emerald-300", bg: "bg-emerald-100" };
    if (nilai >= 70) return { huruf: "B", color: "text-blue-700 border-blue-300", bg: "bg-blue-100" };
    if (nilai >= 60) return { huruf: "B-", color: "text-cyan-700 border-cyan-300", bg: "bg-cyan-100" };
    if (nilai >= 50) return { huruf: "C", color: "text-yellow-700 border-yellow-300", bg: "bg-yellow-100" };
    if (nilai >= 40) return { huruf: "C-", color: "text-amber-700 border-amber-300", bg: "bg-amber-100" };
    return { huruf: "D", color: "text-orange-700 border-orange-300", bg: "bg-orange-100" };
}

function formatNilai(val: number | null | undefined, fractionDigits = 0): string {
    if (val === null || val === undefined) return "-";
    return val.toFixed(fractionDigits);
}

function parseBimbinganCatatan(catatan: string | null | undefined): { grade: number | null; text: string } {
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

export function LaporanMobile({ title }: { title?: string }) {
    const { user } = useAuth();
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLowVision, setIsLowVision] = useState(false);
    const [showDownloadToast, setShowDownloadToast] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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
        setShowDownloadToast(true);

        const handleAfterPrint = () => {
            setShowDownloadToast(false);
            window.removeEventListener("afterprint", handleAfterPrint);
        };

        window.addEventListener("afterprint", handleAfterPrint);

        setTimeout(() => {
            window.print();
        }, 500);
    };


    const handleExportCSV = () => {
        if (!laporanData.length) return;
        
        const headers = [
            "No",
            "Nama Mahasiswa",
            "NIM",
            "Judul Kerja Praktik",
            "Bimbingan Approved",
            "Total Bimbingan",
            "Logbook Diisi",
            "Logbook Disetujui",
            "P1 Nama (Pembimbing)",
            "P1 K1",
            "P1 K2",
            "P1 K3",
            "P1 Total",
            "P2 Nama (Penguji)",
            "P2 K1",
            "P2 K2",
            "P2 K3",
            "P2 Total",
            "Nilai Akhir",
            "Huruf Mutu",
            "Status Progres"
        ];

        const rows = laporanData.map((item, index) => [
            index + 1,
            `"${item.nama}"`,
            item.nim,
            `"${item.judulSkripsi || '-'}"`,
            item.totalBimbinganSelesai,
            item.totalBimbingan,
            item.totalLogbook,
            item.totalLogbookApproved,
            `"${item.p1_nama || '-'}"`,
            item.p1_k1 !== null ? item.p1_k1 : "-",
            item.p1_k2 !== null ? item.p1_k2 : "-",
            item.p1_k3 !== null ? item.p1_k3 : "-",
            item.p1_total !== null ? item.p1_total : "-",
            `"${item.p2_nama || '-'}"`,
            item.p2_k1 !== null ? item.p2_k1 : "-",
            item.p2_k2 !== null ? item.p2_k2 : "-",
            item.p2_k3 !== null ? item.p2_k3 : "-",
            item.p2_total !== null ? item.p2_total : "-",
            item.nilaiAkhir !== null ? item.nilaiAkhir : "-",
            getGrade(item.nilaiAkhir).huruf,
            `"${item.statusProgress}"`
        ]);

        const csvContent = "\uFEFF" + [
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

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);



    return (
        <>
        <style type="text/css" media="print">
            {`
            @page { margin: 0 !important; }
            body { margin: 1.6cm !important; }
            `}
        </style>
        <div className={cn(
            "print-container-root flex flex-col min-h-screen w-full transition-colors duration-300 md:p-8 p-4",
            isLowVision ? "bg-white text-black" : "bg-gray-50"
        )}>
            {/* Header section */}
            <div className="flex flex-col gap-3 mb-6 print:hidden">
                <div className="flex flex-col">
                    <h1 className={cn(
                        "tracking-tight",
                        isLowVision ? "text-2xl font-black text-black" : "text-2xl font-bold text-[#111b21]"
                    )}>
                        {title || "Laporan Akhir Bimbingan"}
                    </h1>
                    <p className={cn(
                        "mt-0.5",
                        isLowVision ? "text-black font-extrabold text-sm" : "text-[#667781] text-xs"
                    )}>
                        Mahasiswa bimbingan yang telah disetujui judulnya (Mobile View).
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button 
                        onClick={handleExportCSV}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors font-semibold text-xs shadow-sm bg-white border border-[#d1d7db] text-[#54656f] hover:bg-gray-50"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors font-semibold text-xs shadow-sm bg-[#D25026] text-white hover:bg-[#b03d19]"
                    >
                        <Download size={16} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>





            {/* Search Input (Screen only) */}
            <div className="relative mb-4 print:hidden">
                <Search className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                    isLowVision ? "text-black" : "text-gray-400"
                )} />
                <input 
                    type="text" 
                    placeholder="Cari berdasarkan nama/NIM..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                        "w-full pl-9 pr-3 transition-all duration-200",
                        isLowVision 
                            ? "py-2.5 bg-white border-2 border-black rounded-lg focus:outline-none text-sm text-black font-black placeholder-neutral-700" 
                            : "py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D25026] focus:border-transparent text-xs"
                    )}
                />
            </div>

            {/* Screen Cards List (Hidden during printing) */}
            <div className="flex flex-col gap-3 print:hidden flex-1">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-3 border-gray-200 border-t-[#D25026] animate-spin mb-3",
                                isLowVision && "border-black border-t-black"
                            )}></div>
                            <span className={cn(isLowVision && "text-base font-black text-black")}>Memuat laporan...</span>
                        </div>
                    </div>
                ) : paginatedData.length === 0 ? (
                    <div className={cn(
                        "py-12 text-center rounded-xl border",
                        isLowVision ? "text-black bg-white border-2 border-black font-black text-base" : "text-gray-400 bg-white border-gray-100"
                    )}>
                        Data tidak ditemukan.
                    </div>
                ) : (
                    <>
                        {paginatedData.map((item) => (
                        <div 
                            key={item.id}
                            className={cn(
                                "p-4 rounded-xl flex flex-col gap-3 transition-all duration-200 shadow-sm",
                                isLowVision 
                                    ? "bg-white border-3 border-black text-black" 
                                    : "bg-white border border-[#e5e5e5]"
                            )}
                        >
                            {/* Card Header (Identitas) */}
                            <div className={cn(
                                "pb-2.5 border-b flex flex-col gap-0.5",
                                isLowVision ? "border-black" : "border-slate-100"
                            )}>
                                <span className={cn(
                                    "font-bold",
                                    isLowVision ? "text-base font-black text-black" : "text-slate-950"
                                )}>
                                    {item.nama}
                                </span>
                                <span className={cn(
                                    "text-xs",
                                    isLowVision ? "text-sm font-extrabold text-black" : "text-slate-500"
                                )}>
                                    {item.nim}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-1">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logbook Diisi</span>
                                            <span className={cn("text-base font-extrabold text-slate-900 mt-0.5", isLowVision && "text-black font-black")}>
                                                {item.totalLogbook}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logbook Disetujui</span>
                                            <span className={cn("text-base font-extrabold text-[#00a884] mt-0.5", isLowVision && "text-black font-black")}>
                                                {item.totalLogbookApproved}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {(() => {
                                        const percent = item.totalLogbook > 0 
                                            ? Math.round((item.totalLogbookApproved / item.totalLogbook) * 100) 
                                            : 0;
                                        return (
                                            <div className="flex flex-col gap-1 w-full pt-1 border-t border-slate-50 mt-1">
                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                    <span className={cn(isLowVision ? "font-black" : "text-[#54656f]")}>Progres Logbook</span>
                                                    <span className={cn(isLowVision ? "font-black" : "text-[#00a884]")}>{percent}% ({item.totalLogbookApproved}/{item.totalLogbook})</span>
                                                </div>
                                                <div className={cn(
                                                    "w-full rounded-full h-2 overflow-hidden mt-0.5",
                                                    isLowVision ? "bg-white border border-black" : "bg-gray-100"
                                                )}>
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-300",
                                                            isLowVision ? "bg-black" : "bg-[#00a884]"
                                                        )}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex flex-col gap-2.5">
                                    <hr className={cn("border-t-2 my-2", isLowVision ? "border-black" : "border-slate-100")} />
                                    {/* P1 Section */}
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nilai Pembimbing (P1):</span>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex gap-1.5 text-[10px] font-bold text-slate-800">
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K1: {formatNilai(item.p1_k1, 0)}</span>
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K2: {formatNilai(item.p1_k2, 0)}</span>
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K3: {formatNilai(item.p1_k3, 0)}</span>
                                            </div>
                                            <span className={cn("font-bold text-xs", isLowVision ? "text-black" : "text-[#D25026]")}>
                                                Total P1: {formatNilai(item.p1_total, 1)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 italic truncate">Dospem: {item.p1_nama || "-"}</span>
                                    </div>
 
                                    {/* P2 Section */}
                                    <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Nilai Penguji (P2):</span>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex gap-1.5 text-[10px] font-bold text-slate-800">
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K1: {formatNilai(item.p2_k1, 0)}</span>
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K2: {formatNilai(item.p2_k2, 0)}</span>
                                                <span className={cn("px-1.5 py-0.5 rounded", isLowVision ? "bg-white border border-black" : "bg-slate-100")}>K3: {formatNilai(item.p2_k3, 0)}</span>
                                            </div>
                                            <span className={cn("font-bold text-xs", isLowVision ? "text-black" : "text-[#D25026]")}>
                                                Total P2: {formatNilai(item.p2_total, 1)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 italic truncate">Penguji: {item.p2_nama || "-"}</span>
                                    </div>
 
                                    {/* Score Averages & Grade */}
                                    <div className={cn(
                                        "flex items-center justify-between pt-2 border-t mt-1",
                                        isLowVision ? "border-black" : "border-slate-100"
                                    )}>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">Nilai Akhir:</span>
                                            <span className={cn(
                                                "text-base font-extrabold",
                                                item.nilaiAkhir !== null ? "text-[#D25026]" : "text-gray-400",
                                                isLowVision && "text-black font-black"
                                            )}>
                                                {formatNilai(item.nilaiAkhir, 1)}
                                            </span>
                                        </div>

                                        {(() => {
                                            const grade = getGrade(item.nilaiAkhir);
                                            return (
                                                <span className={cn(
                                                    "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black border",
                                                    isLowVision 
                                                        ? "border-2 border-black bg-white text-black font-black w-9 h-9 text-sm" 
                                                        : `${grade.bg} ${grade.color} ${grade.color.replace('text-', 'border-')}/30`
                                                )}>
                                                    {grade.huruf}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                        </div>
                        ))}
                        
                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-col gap-4 mt-6 print:hidden">
                                <span className={cn(
                                    "text-center font-medium",
                                    isLowVision ? "text-black font-bold text-base" : "text-sm text-slate-500"
                                )}>
                                    Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                                </span>
                                <div className="flex justify-between items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className={cn(
                                            "flex-1 py-3 text-sm font-semibold rounded-xl border transition-colors",
                                            isLowVision ? "border-2 border-black text-black text-base uppercase bg-white disabled:bg-gray-200" : "bg-white text-slate-700 border-slate-200 disabled:opacity-50"
                                        )}
                                    >
                                        Sebelumnya
                                    </button>
                                    <span className={cn(
                                        "font-bold px-3",
                                        isLowVision ? "text-black text-lg" : "text-slate-700"
                                    )}>
                                        {currentPage}/{totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className={cn(
                                            "flex-1 py-3 text-sm font-semibold rounded-xl border transition-colors",
                                            isLowVision ? "border-2 border-black text-black text-base uppercase bg-white disabled:bg-gray-200" : "bg-white text-slate-700 border-slate-200 disabled:opacity-50"
                                        )}
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Print Section (One page/section per student) */}
            <div className="hidden print:block print-section w-full text-black">
                {laporanData.map((item, idx) => (
                    <div key={item.id} className={cn("w-full flex flex-col", idx > 0 && "page-break-before-always mt-8")}>
                        {/* Student Header */}
                        <div className="flex flex-col items-center justify-center mb-6 border-b-2 border-black pb-4 text-center w-full">
                            <h1 className="text-xl font-bold uppercase">Laporan Rekapitulasi Kerja Praktik Mahasiswa</h1>
                            <p className="text-sm font-semibold">Tahun Akademik: {new Date().getFullYear()}</p>
                            <p className="text-base font-bold mt-2">NAMA: {item.nama.toUpperCase()} | NIM: {item.nim}</p>
                            <p className="text-sm font-semibold mt-1">Dosen Pembimbing: {item.p1_nama || "-"}</p>
                            <p className="text-xs text-gray-700 italic max-w-[500px] mt-1">Judul KP: "{item.judulSkripsi || "-"}"</p>
                        </div>

                        {/* Company Details */}
                        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3 w-full">
                            <h3 className="text-xs font-bold text-gray-800 uppercase border-b border-gray-200 pb-2 mb-2 w-full text-center">Identitas Perusahaan / Instansi Magang</h3>
                            <div className="flex flex-col gap-2 w-full">
                                <div className="grid grid-cols-[100px_1fr] text-[10px] w-full">
                                    <span className="font-semibold text-gray-600">Nama Instansi</span>
                                    <span className="text-gray-900">: {item.tempatKP?.namaPerusahaan || "-"}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] text-[10px] w-full">
                                    <span className="font-semibold text-gray-600">Telepon / Fax</span>
                                    <span className="text-gray-900">: {item.tempatKP?.tlpFaxPerusahaan || "-"}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] text-[10px] w-full">
                                    <span className="font-semibold text-gray-600">Kontak Pembimbing Lapangan</span>
                                    <span className="text-gray-900">: {item.tempatKP?.kontakPembimbing || "-"}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] text-[10px] w-full">
                                    <span className="font-semibold text-gray-600">Alamat Instansi</span>
                                    <span className="text-gray-900 leading-tight">: {item.tempatKP?.alamatPerusahaan || "-"}</span>
                                </div>
                            </div>
                        </div>

                        {/* I. Rekapitulasi Logbook */}
                        <div className="mb-6 w-full">
                            <div className="flex justify-between items-end border-b border-black pb-0.5 mb-2">
                                <h3 className="text-xs font-bold uppercase">I. Uraian Kegiatan Logbook Kerja Praktik</h3>
                                <div className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 border border-black rounded">
                                    Progres: {item.totalLogbook > 0 ? Math.round((item.totalLogbookApproved / item.totalLogbook) * 100) : 0}% ({item.totalLogbookApproved}/{item.totalLogbook} Disetujui)
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse border border-black text-sm">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-black font-bold">
                                        <th className="py-1.5 px-2 w-[40px] text-center border border-black">No</th>
                                        <th className="py-1.5 px-2 w-[120px] border border-black">Tanggal</th>
                                        <th className="py-1.5 px-2 border border-black">Uraian Singkat Kegiatan</th>
                                        <th className="py-1.5 px-2 w-[110px] text-center border border-black">Paraf Dosen</th>
                                        <th className="py-1.5 px-2 w-[110px] text-center border border-black">Paraf Pembimbing Perusahaan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!item.logbooks || item.logbooks.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="py-4 text-center border border-black text-gray-500 italic">Belum ada catatan logbook.</td>
                                        </tr>
                                    ) : (
                                        item.logbooks.map((l, lIdx) => (
                                            <tr key={l.id} className="border-b border-black">
                                                <td className="py-1.5 px-2 text-center border border-black">{lIdx + 1}</td>
                                                <td className="py-1.5 px-2 border border-black">{new Date(l.tanggalPukul).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                <td className="py-1.5 px-2 border border-black">{l.uraian}</td>
                                                <td className="py-1 px-2 border border-black text-center"></td>
                                                <td className="py-1 px-2 border border-black text-center"></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* III. Penilaian Akhir */}
                        <div className="w-full">
                            <h3 className="text-xs font-bold uppercase mb-2 border-b border-black pb-0.5">III. Laporan Evaluasi & Penilaian Akhir</h3>
                            <table className="w-full text-left border-collapse border border-black text-xs">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-black font-bold">
                                        <th className="py-2 px-2 border border-black">Nilai Pembimbing (P1)</th>
                                        <th className="py-2 px-2 border border-black">Nilai Penguji (P2)</th>
                                        <th className="py-2 px-2 w-[80px] text-center border border-black">Total</th>
                                        <th className="py-2 px-2 w-[60px] text-center border border-black">Grade</th>
                                        <th className="py-2 px-2 w-[110px] text-center border border-black">Tanggal Sidang</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-black">
                                        <td className="py-3 px-2 border border-black">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2 font-bold text-sm">
                                                    <span>K1: {formatNilai(item.p1_k1, 0)}</span>
                                                    <span>K2: {formatNilai(item.p1_k2, 0)}</span>
                                                    <span>K3: {formatNilai(item.p1_k3, 0)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-700 font-medium">Dospem: {item.p1_nama || "-"}</div>
                                                <div className="font-black mt-1 text-sm text-[#D25026]">Total P1: {formatNilai(item.p1_total, 1)}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 border border-black">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex gap-2 font-bold text-sm">
                                                    <span>K1: {formatNilai(item.p2_k1, 0)}</span>
                                                    <span>K2: {formatNilai(item.p2_k2, 0)}</span>
                                                    <span>K3: {formatNilai(item.p2_k3, 0)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-700 font-medium">Penguji: {item.p2_nama || "-"}</div>
                                                <div className="font-black mt-1 text-sm text-[#D25026]">Total P2: {formatNilai(item.p2_total, 1)}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-center border border-black font-black text-lg">{formatNilai(item.nilaiAkhir, 1)}</td>
                                        <td className="py-3 px-2 text-center border border-black font-black text-lg">{getGrade(item.nilaiAkhir).huruf}</td>
                                        <td className="py-3 px-2 text-center border border-black font-bold text-xs">{item.tanggalPenilaian ? format(new Date(item.tanggalPenilaian), "dd MMM yyyy", { locale: localeId }) : "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {item.keteranganPenilaian && (
                                <div className="mt-2 text-[10px] italic"><span className="font-semibold">Catatan Evaluasi:</span> "{item.keteranganPenilaian}"</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Footer Styles */}
            <style>{`
                @media print {
                    @page { margin: 1.5cm; size: A4 portrait; }

                    /* Allow full content to flow across pages */
                    html {
                        height: auto !important;
                        overflow: visible !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        background-color: white !important;
                        height: auto !important;
                        overflow: visible !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* Target layout wrappers and reset height/overflow constraints precisely */
                    #root,
                    #root > div,
                    [data-slot="sidebar-wrapper"],
                    [data-slot="sidebar-wrapper"] > div,
                    [data-slot="sidebar-wrapper"] > div > main {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        display: block !important;
                        position: static !important;
                    }

                    /* Reset any sidebar/layout wrappers that may cut content */
                    main, aside, nav, header, footer {
                        height: auto !important;
                        max-height: none !important;
                        overflow: visible !important;
                        position: static !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Remove sidebar and nav from print */
                    div[data-slot="sidebar"],
                    aside, nav, header {
                        display: none !important;
                    }

                    /* Explicitly hide screen-only elements */
                    .print\:hidden,
                    [class*="print:hidden"] {
                        display: none !important;
                    }

                    ::-webkit-scrollbar { display: none; }

                    .print-container-root {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background-color: white !important;
                        position: static !important;
                    }

                    .print-section {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    .page-break-before-always {
                        page-break-before: always !important;
                        break-before: page !important;
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                    }

                    /* Prevent tables/rows from being clipped */
                    table, tr, td, th {
                        page-break-inside: auto !important;
                        overflow: visible !important;
                    }

                    img {
                        max-width: 100% !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>

            {/* Floating Toast Notification for PDF Download */}
            {showDownloadToast && (
                <div className="fixed top-4 left-4 right-4 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3.5 rounded-xl shadow-2xl border border-slate-800 transition-all duration-300 animate-in fade-in slide-in-from-top-5 print:hidden">
                    <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-700 border-t-white animate-spin shrink-0" />
                    <div className="flex flex-col text-xs">
                        <span className="font-semibold">Menyiapkan Laporan PDF...</span>
                        <span className="text-slate-400">Silakan simpan dokumen pada jendela cetak.</span>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}
