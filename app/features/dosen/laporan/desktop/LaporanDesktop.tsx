import React from "react";
import { Search, Download } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CetakLaporanDocument } from "../components/CetakLaporanDocument";
import { useLaporan } from "../hooks/useLaporan";
import { getGrade, formatNilai } from "../types/laporan";

export function LaporanDesktop({ title }: { title?: string }) {
    const {
        laporanData,
        filteredData,
        paginatedData,
        isLoading,
        searchQuery,
        setSearchQuery,
        isLowVision,
        showDownloadToast,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        handlePrint,
        handleExportCSV,
    } = useLaporan();




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
                                
                                {/* Merged Columns */}
                                <th className={cn(
                                    "py-4 px-6 text-center",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Logbook Diisi</th>
                                <th className={cn(
                                    "py-4 px-6 text-center",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Logbook Disetujui</th>
                                <th className={cn(
                                    "py-4 px-6 w-[180px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Progres Logbook</th>
                                <th className={cn(
                                    "py-4 px-6 w-[280px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Nilai Pembimbing (P1)</th>
                                <th className={cn(
                                    "py-4 px-6 w-[280px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Nilai Penguji (P2)</th>
                                <th className={cn(
                                    "py-4 px-6 text-center w-[100px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Nilai Akhir</th>
                                <th className={cn(
                                    "py-4 px-6 text-center w-[100px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Huruf Mutu</th>
                                <th className={cn(
                                    "py-4 px-6 text-center w-[120px]",
                                    isLowVision ? "font-black text-base" : "font-semibold text-sm"
                                )}>Tanggal</th>
                            </tr>
                        </thead>
                        <tbody className={cn(
                            "divide-y print:divide-black",
                            isLowVision ? "divide-black" : "divide-[#e5e5e5]"
                        )}>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#D25026] animate-spin mb-3",
                                                isLowVision && "border-black border-t-black"
                                            )}></div>
                                            <span className={cn(isLowVision && "text-lg font-black text-black")}>Memuat laporan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className={cn(
                                        "py-12 text-center",
                                        isLowVision ? "text-black bg-white font-black text-lg" : "text-[#8696a0] bg-gray-50/50"
                                    )}>
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, idx) => (
                                    <tr key={item.id} className={cn(
                                        "transition-colors print:hover:bg-transparent",
                                        isLowVision ? "hover:bg-slate-100 bg-white" : "hover:bg-gray-50/50"
                                    )}>
                                        <td className={cn(
                                            "py-4 px-6",
                                            isLowVision ? "text-base font-black text-black" : "text-sm text-gray-600 print:text-black"
                                        )}>
                                            {(currentPage - 1) * itemsPerPage + idx + 1}
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
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className={cn(
                                                            "flex gap-1.5 text-sm font-semibold",
                                                            isLowVision && "text-base font-black text-black"
                                                        )}>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-blue-50 text-blue-700")}>
                                                                K1: {formatNilai(item.p1_k1, 0)}
                                                            </span>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-emerald-50 text-emerald-700")}>
                                                                K2: {formatNilai(item.p1_k2, 0)}
                                                            </span>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-purple-50 text-purple-700")}>
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
                                                                "text-xs truncate w-[180px]",
                                                                isLowVision ? "text-sm text-black font-black" : "text-[#8696a0]"
                                                            )} title={item.p1_nama || ""}>
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
                                                            "flex gap-1.5 text-sm font-semibold",
                                                            isLowVision && "text-base font-black text-black"
                                                        )}>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-blue-50 text-blue-700")}>
                                                                K1: {formatNilai(item.p2_k1, 0)}
                                                            </span>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-emerald-50 text-emerald-700")}>
                                                                K2: {formatNilai(item.p2_k2, 0)}
                                                            </span>
                                                            <span className={cn("px-2 py-1 rounded whitespace-nowrap", isLowVision ? "bg-white border border-black" : "bg-purple-50 text-purple-700")}>
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
                                                                "text-xs truncate w-[180px]",
                                                                isLowVision ? "text-sm text-black font-black" : "text-[#8696a0]"
                                                            )} title={item.p2_nama || ""}>
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
                                                <td className={cn(
                                                    "py-4 px-6 text-center text-sm",
                                                    isLowVision ? "text-base font-bold text-black" : "text-gray-600 font-medium print:text-black"
                                                )}>
                                                    {item.tanggalPenilaian ? format(new Date(item.tanggalPenilaian), "dd MMM yyyy", { locale: localeId }) : "-"}
                                                </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4 print:hidden">
                    <span className="text-sm text-slate-500 font-medium">
                        Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center text-sm font-bold rounded-lg transition-colors border",
                                        currentPage === i + 1
                                            ? "bg-[#D25026] text-white border-[#D25026]"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            )}

            {/* Print Section (One page/section per student) */}
            <CetakLaporanDocument data={laporanData} />


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
        </>
    );
}
