import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Search, Download, Users, ClipboardList, Award, Accessibility } from "lucide-react";
import { cn } from "~/lib/utils";


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
    id: number;
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

export function LaporanDesktop({ title }: { title?: string }) {
    const { user } = useAuth();
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"bimbingan" | "logbook" | "evaluasi">("bimbingan");
    const [isLowVision, setIsLowVision] = useState(false);
    const [showDownloadToast, setShowDownloadToast] = useState(false);

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

    const tabs = [
        { id: "bimbingan", label: "Progres Bimbingan", icon: Users },
        { id: "logbook", label: "Logbook Mahasiswa", icon: ClipboardList },
        { id: "evaluasi", label: "Penilaian Evaluasi Kerja Praktik", icon: Award },
    ] as const;

    return (
        <div className={cn(
            "print-container-root flex flex-col min-h-screen w-full transition-colors duration-300 md:p-8 p-4",
            isLowVision ? "bg-white text-black" : "bg-[#FAFAFA]"
        )}>
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8 print:hidden">
                <div className="flex flex-col">
                    <h1 className={cn(
                        "tracking-tight",
                        isLowVision ? "text-3xl font-black text-black" : "text-3xl font-bold text-[#111b21]"
                    )}>
                        {title || "Laporan Akhir Bimbingan"}
                    </h1>
                    <p className={cn(
                        "mt-1",
                        isLowVision ? "text-black font-extrabold text-base" : "text-[#667781] text-sm md:text-base"
                    )}>
                        Rekapitulasi seluruh mahasiswa bimbingan yang telah disetujui judulnya (Desktop View).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-sm",
                            "bg-white border border-[#d1d7db] text-[#54656f] hover:bg-gray-50"
                        )}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-sm bg-[#D25026] text-white hover:bg-[#b03d19]"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>



            {/* Tabs Navigation (Screen only) */}
            <div className="flex border-b border-gray-200 mb-6 gap-2 print:hidden overflow-x-auto">
                {tabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-200",
                                isActive 
                                    ? (isLowVision 
                                        ? "border-black text-black font-black" 
                                        : "border-[#D25026] text-[#D25026]")
                                    : (isLowVision
                                        ? "border-transparent text-gray-500 hover:text-black hover:border-black font-bold"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
                            )}
                        >
                            <TabIcon size={18} />
                            <span className={cn(isLowVision && "text-base font-black")}>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Content Container (Screen view - Hidden during printing) */}
            <div className={cn(
                "w-full flex-1 print:hidden",
                isLowVision 
                    ? "bg-white rounded-xl shadow-none border-4 border-black overflow-hidden flex flex-col" 
                    : "bg-white rounded-xl shadow-sm border border-[#e5e5e5] overflow-hidden flex flex-col"
            )}>
                {/* Search Bar */}
                <div className={cn(
                    "p-4 border-b flex items-center print:hidden",
                    isLowVision ? "border-black bg-slate-50" : "border-[#e5e5e5]"
                )}>
                    <div className="relative w-full">
                        <Search className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5",
                            isLowVision ? "text-black" : "text-gray-400"
                        )} />
                        <input 
                            type="text" 
                            placeholder="Cari berdasarkan nama atau NIM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 transition-all duration-200",
                                isLowVision 
                                    ? "py-3 bg-white border-3 border-black rounded-lg focus:outline-none text-base text-black font-black placeholder-neutral-700" 
                                    : "py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D25026] focus:border-transparent text-sm"
                            )}
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto w-full flex-1">
                    <table className={cn(
                        "w-full text-left border-collapse min-w-[900px]",
                        isLowVision && "border-black"
                    )}>
                        <thead>
                            <tr className={cn(
                                "border-b print:bg-gray-100 print:text-black print:border-black",
                                isLowVision 
                                    ? "bg-slate-100 border-black text-black" 
                                    : "bg-[#FAFAFA] border-b border-[#e5e5e5] text-[#54656f]"
                            )}>
                                <th className={cn(
                                    "py-4 px-6 w-[60px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>No</th>
                                <th className={cn(
                                    "py-4 px-6",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Nama / NIM</th>
                                
                                {/* Dynamic columns based on Tab */}
                                {activeTab === "bimbingan" && (
                                    <>
                                        <th className={cn(
                                            "py-4 px-6 w-[40%]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Judul Kerja Praktik</th>
                                        <th className={cn(
                                            "py-4 px-6 text-center w-[180px]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Pertemuan Approved</th>
                                        <th className={cn(
                                            "py-4 px-6 w-[200px]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Status Progres</th>
                                    </>
                                )}

                                {activeTab === "logbook" && (
                                    <>
                                        <th className={cn(
                                            "py-4 px-6 text-center",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Logbook Diisi</th>
                                        <th className={cn(
                                            "py-4 px-6 text-center",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Logbook Disetujui</th>
                                        <th className={cn(
                                            "py-4 px-6 w-[220px]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Progres Logbook</th>
                                    </>
                                )}

                                {activeTab === "evaluasi" && (
                                    <>
                                        <th className={cn(
                                            "py-4 px-6 w-[25%]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Nilai Pembimbing (P1)</th>
                                        <th className={cn(
                                            "py-4 px-6 w-[25%]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Nilai Penguji (P2)</th>
                                        <th className={cn(
                                            "py-4 px-6 text-center w-[120px]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Nilai Akhir</th>
                                        <th className={cn(
                                            "py-4 px-6 text-center w-[120px]",
                                            isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                        )}>Huruf Mutu</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className={cn(
                            "divide-y print:divide-black",
                            isLowVision ? "divide-black" : "divide-[#e5e5e5]"
                        )}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={activeTab === "bimbingan" ? 5 : activeTab === "logbook" ? 5 : 6} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#D25026] animate-spin mb-3",
                                                isLowVision && "border-black border-t-black"
                                            )}></div>
                                            <span className={cn(isLowVision && "text-lg font-black text-black")}>Memuat laporan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === "bimbingan" ? 5 : activeTab === "logbook" ? 5 : 6} className={cn(
                                        "py-12 text-center",
                                        isLowVision ? "text-black bg-white font-black text-lg" : "text-[#8696a0] bg-gray-50/50"
                                    )}>
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, idx) => (
                                    <tr key={item.id} className={cn(
                                        "transition-colors print:hover:bg-transparent",
                                        isLowVision ? "hover:bg-slate-100 bg-white" : "hover:bg-gray-50/50"
                                    )}>
                                        <td className={cn(
                                            "py-4 px-6",
                                            isLowVision ? "text-base font-black text-black" : "text-sm text-gray-600 print:text-black"
                                        )}>
                                            {idx + 1}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "font-medium print:text-black",
                                                    isLowVision ? "text-lg font-black text-black" : "text-[#111b21]"
                                                )}>
                                                    {item.nama}
                                                </span>
                                                <span className={cn(
                                                    "text-sm print:text-gray-700",
                                                    isLowVision ? "text-base font-bold text-black mt-0.5" : "text-[#667781]"
                                                )}>
                                                    {item.nim}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Dynamic content rendering based on Tab */}
                                        {activeTab === "bimbingan" && (
                                            <>
                                                <td className={cn(
                                                    "py-4 px-6 text-sm print:text-black",
                                                    isLowVision ? "text-base font-bold text-black" : "text-[#111b21]"
                                                )}>
                                                    {item.judulSkripsi || "-"}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <span className={cn(
                                                            "font-bold text-lg print:text-black",
                                                            isLowVision ? "text-xl font-black text-black" : "text-[#D25026]"
                                                        )}>
                                                            {item.totalBimbinganSelesai}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs print:text-gray-600",
                                                            isLowVision ? "text-sm font-bold text-black" : "text-[#8696a0]"
                                                        )}>
                                                            / {item.totalBimbingan}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold print:bg-transparent print:p-0 print:border-none",
                                                        isLowVision
                                                            ? "bg-white border-2 border-black text-black font-black text-sm"
                                                            : (item.statusProgress.includes("Selesai") ? "bg-[#d9fdd3] text-[#00a884]" :
                                                               item.statusProgress.includes("Aktif") ? "bg-blue-100 text-blue-700" :
                                                               item.statusProgress.includes("Reviu") ? "bg-yellow-100 text-yellow-700" :
                                                               item.statusProgress.includes("Revisi") ? "bg-orange-100 text-orange-700" :
                                                               "bg-gray-100 text-gray-600")
                                                    )}>
                                                        {item.statusProgress}
                                                    </span>
                                                </td>
                                            </>
                                        )}

                                        {activeTab === "logbook" && (
                                            <>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={cn(
                                                        "font-bold text-base",
                                                        isLowVision ? "text-lg font-black text-black" : "text-[#111b21]"
                                                    )}>
                                                        {item.totalLogbook}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={cn(
                                                        "font-bold text-base",
                                                        isLowVision ? "text-lg font-black text-black" : "text-[#00a884]"
                                                    )}>
                                                        {item.totalLogbookApproved}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {(() => {
                                                        const percent = item.totalLogbook > 0 
                                                            ? Math.round((item.totalLogbookApproved / item.totalLogbook) * 100) 
                                                            : 0;
                                                        return (
                                                            <div className="flex flex-col gap-1 w-full max-w-[160px]">
                                                                <div className="flex items-center justify-between text-xs font-semibold">
                                                                    <span className={cn(
                                                                        isLowVision ? "text-sm font-black text-black" : "text-[#54656f]"
                                                                    )}>
                                                                        {percent}%
                                                                    </span>
                                                                    <span className={cn(
                                                                        isLowVision ? "text-sm font-black text-black" : "text-[#8696a0]"
                                                                    )}>
                                                                        {item.totalLogbookApproved}/{item.totalLogbook}
                                                                    </span>
                                                                </div>
                                                                <div className={cn(
                                                                    "w-full rounded-full h-2 overflow-hidden",
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
                                                </td>
                                            </>
                                        )}

                                        {activeTab === "evaluasi" && (
                                            <>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className={cn(
                                                            "flex flex-wrap gap-1 text-xs",
                                                            isLowVision && "text-sm font-black text-black"
                                                        )}>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K1: {formatNilai(item.p1_k1, 0)}
                                                            </span>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K2: {formatNilai(item.p1_k2, 0)}
                                                            </span>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K3: {formatNilai(item.p1_k3, 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={cn(
                                                                "text-[10px] font-semibold uppercase tracking-wide",
                                                                isLowVision ? "text-xs text-black font-black" : "text-[#54656f]"
                                                            )}>
                                                                Dospem:
                                                            </span>
                                                            <span className={cn(
                                                                "text-xs truncate max-w-[120px]",
                                                                isLowVision ? "text-sm text-black font-black" : "text-[#8696a0]"
                                                            )}>
                                                                {item.p1_nama || "-"}
                                                            </span>
                                                        </div>
                                                        <div className={cn("text-xs font-bold mt-0.5", isLowVision && "text-sm font-black")}>
                                                            Total: <span className={cn("text-[#D25026] text-xs font-bold", isLowVision && "text-sm font-black text-black")}>{formatNilai(item.p1_total, 1)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className={cn(
                                                            "flex flex-wrap gap-1 text-xs",
                                                            isLowVision && "text-sm font-black text-black"
                                                        )}>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K1: {formatNilai(item.p2_k1, 0)}
                                                            </span>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K2: {formatNilai(item.p2_k2, 0)}
                                                            </span>
                                                            <span className={cn("px-1.5 py-0.5 rounded font-medium", isLowVision ? "bg-white border border-black" : "bg-slate-100 border border-slate-200")}>
                                                                K3: {formatNilai(item.p2_k3, 0)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <span className={cn(
                                                                "text-[10px] font-semibold uppercase tracking-wide",
                                                                isLowVision ? "text-xs text-black font-black" : "text-[#54656f]"
                                                            )}>
                                                                Penguji:
                                                            </span>
                                                            <span className={cn(
                                                                "text-xs truncate max-w-[120px]",
                                                                isLowVision ? "text-sm text-black font-black" : "text-[#8696a0]"
                                                            )}>
                                                                {item.p2_nama || "-"}
                                                            </span>
                                                        </div>
                                                        <div className={cn("text-xs font-bold mt-0.5", isLowVision && "text-sm font-black")}>
                                                            Total: <span className={cn("text-[#D25026] text-xs font-bold", isLowVision && "text-sm font-black text-black")}>{formatNilai(item.p2_total, 1)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={cn(
                                                        "font-bold text-lg print:text-black",
                                                        item.nilaiAkhir !== null 
                                                            ? (isLowVision ? "text-xl font-black text-black" : "text-[#D25026]")
                                                            : (isLowVision ? "text-base font-black text-black" : "text-gray-400")
                                                    )}>
                                                        {formatNilai(item.nilaiAkhir, 1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {(() => {
                                                        const grade = getGrade(item.nilaiAkhir);
                                                        return (
                                                            <div className="flex justify-center">
                                                                <span className={cn(
                                                                    "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border",
                                                                    isLowVision 
                                                                        ? "border-2 border-black bg-white text-black font-black w-10 h-10 text-base" 
                                                                        : `${grade.bg} ${grade.color} ${grade.color.replace('text-', 'border-')}/30`
                                                                )}>
                                                                    {grade.huruf}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Section (One page/section per student) */}
            <div className="hidden print:block print-section w-full text-black">
                {filteredData.map((item, idx) => (
                    <div key={item.id} className={cn("w-full flex flex-col", idx > 0 && "page-break-before-always mt-8")}>
                        {/* Student Header */}
                        <div className="flex flex-col items-center justify-center mb-6 border-b-2 border-black pb-4 text-center w-full">
                            <h1 className="text-xl font-bold uppercase">Laporan Rekapitulasi Kerja Praktik Mahasiswa</h1>
                            <p className="text-sm font-semibold">Tahun Akademik: {new Date().getFullYear()}</p>
                            <p className="text-base font-bold mt-2">NAMA: {item.nama.toUpperCase()} | NIM: {item.nim}</p>
                            <p className="text-xs text-gray-700 italic max-w-[500px] mt-1">Judul KP: "{item.judulSkripsi || "-"}"</p>
                        </div>

                        {/* Company Details (TempatKP) */}
                        <div className="mb-6 p-3 border border-black rounded bg-slate-50/50">
                            <h3 className="text-xs font-bold uppercase border-b border-black pb-1 mb-2">Identitas Perusahaan / Instansi Magang</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><span className="font-semibold">Nama Perusahaan:</span> {item.tempatKP?.namaPerusahaan || "-"}</div>
                                <div><span className="font-semibold">Telepon/Fax:</span> {item.tempatKP?.tlpFaxPerusahaan || "-"}</div>
                                <div><span className="font-semibold">Alamat Perusahaan:</span> {item.tempatKP?.alamatPerusahaan || "-"}</div>
                                <div><span className="font-semibold">Kontak Pembimbing Lapangan:</span> {item.tempatKP?.kontakPembimbing || "-"}</div>
                            </div>
                        </div>

                        {/* I. Progres Bimbingan */}
                        <div className="mb-6 w-full">
                            <h3 className="text-xs font-bold uppercase mb-2 border-b border-black pb-0.5">I. Uraian Bimbingan Kerja Praktik</h3>
                            <table className="w-full text-left border-collapse border border-black text-[10px]">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-black font-bold">
                                        <th className="py-1.5 px-2 w-[40px] text-center border border-black">No</th>
                                        <th className="py-1.5 px-2 w-[120px] border border-black">Tanggal</th>
                                        <th className="py-1.5 px-2 w-[180px] border border-black">Topik/Bab Bimbingan</th>
                                        <th className="py-1.5 px-2 w-[100px] text-center border border-black">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const approvedBimbingans = (item.bimbingans || []).filter(b => b.status === 'APPROVED');
                                        return (approvedBimbingans.length === 0) ? (
                                            <tr>
                                                <td colSpan={4} className="py-4 text-center border border-black text-gray-500 italic">Belum ada riwayat bimbingan.</td>
                                            </tr>
                                        ) : (
                                            approvedBimbingans.map((b, bIdx) => {
                                                const parsed = parseBimbinganCatatan(b.catatan);
                                                return (
                                                    <tr key={b.id} className="border-b border-black">
                                                        <td className="py-1.5 px-2 text-center border border-black">{bIdx + 1}</td>
                                                        <td className="py-1.5 px-2 border border-black">{new Date(b.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                        <td className="py-1.5 px-2 border border-black font-semibold">{b.topik}</td>
                                                        <td className="py-1.5 px-2 text-center border border-black font-semibold">{parsed.grade !== null ? parsed.grade : "-"}</td>
                                                    </tr>
                                                );
                                            })
                                        );
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        {/* II. Rekapitulasi Logbook */}
                        <div className="mb-6 w-full">
                            <h3 className="text-xs font-bold uppercase mb-2 border-b border-black pb-0.5">II. Uraian Kegiatan Logbook Kerja Praktik</h3>
                            <table className="w-full text-left border-collapse border border-black text-[10px]">
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
                                                <td className="py-1 px-2 border border-black text-center">
                                                    {l.mahasiswaParaf ? (
                                                        <img src={l.mahasiswaParaf} alt="Paraf Dosen" className="max-h-[28px] max-w-[80px] mx-auto object-contain print:block" />
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-1 px-2 border border-black text-center">
                                                    {l.pembimbingParaf ? (
                                                        <img src={l.pembimbingParaf} alt="Paraf Pembimbing Perusahaan" className="max-h-[28px] max-w-[80px] mx-auto object-contain print:block" />
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* III. Penilaian Akhir */}
                        <div className="w-full">
                            <h3 className="text-xs font-bold uppercase mb-2 border-b border-black pb-0.5">III. Laporan Evaluasi & Penilaian Akhir</h3>
                            <table className="w-full text-left border-collapse border border-black text-[10px]">
                                <thead>
                                    <tr className="bg-gray-100 border-b border-black font-bold">
                                        <th className="py-1.5 px-2 border border-black">Nilai Pembimbing (P1)</th>
                                        <th className="py-1.5 px-2 border border-black">Nilai Penguji (P2)</th>
                                        <th className="py-1.5 px-2 w-[100px] text-center border border-black">Nilai Akhir</th>
                                        <th className="py-1.5 px-2 w-[80px] text-center border border-black">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-black">
                                        <td className="py-2 px-2 border border-black">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex gap-1.5 font-semibold">
                                                    <span>K1: {formatNilai(item.p1_k1, 0)}</span>
                                                    <span>K2: {formatNilai(item.p1_k2, 0)}</span>
                                                    <span>K3: {formatNilai(item.p1_k3, 0)}</span>
                                                </div>
                                                <div className="text-[9px] text-gray-500">Dospem: {item.p1_nama || "-"}</div>
                                                <div className="font-bold mt-1">Total P1: {formatNilai(item.p1_total, 1)}</div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 border border-black">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex gap-1.5 font-semibold">
                                                    <span>K1: {formatNilai(item.p2_k1, 0)}</span>
                                                    <span>K2: {formatNilai(item.p2_k2, 0)}</span>
                                                    <span>K3: {formatNilai(item.p2_k3, 0)}</span>
                                                </div>
                                                <div className="text-[9px] text-gray-500">Penguji: {item.p2_nama || "-"}</div>
                                                <div className="font-bold mt-1">Total P2: {formatNilai(item.p2_total, 1)}</div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 text-center border border-black font-bold text-sm">{formatNilai(item.nilaiAkhir, 1)}</td>
                                        <td className="py-2 px-2 text-center border border-black font-extrabold text-sm">{getGrade(item.nilaiAkhir).huruf}</td>
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
                <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-800 transition-all duration-300 animate-in fade-in slide-in-from-top-5 print:hidden">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-700 border-t-white animate-spin" />
                    <div className="flex flex-col text-sm">
                        <span className="font-semibold">Menyiapkan Laporan PDF...</span>
                        <span className="text-xs text-slate-400">Silakan simpan dokumen pada jendela cetak browser.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
