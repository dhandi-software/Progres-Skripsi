import React from "react";
import { Search, Download } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CetakLaporanDocument } from "../components/CetakLaporanDocument";
import { useLaporan } from "~/hooks/useLaporan";
import { getGrade, formatNilai } from "~/features/dosen/penilaian/types/penilaian";
import { Button } from "~/components/ui/button";

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
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 print:hidden">
                <div className="flex flex-col">
                    <h1 className={cn(
                        "font-serif tracking-tight",
                        isLowVision ? "text-3xl font-black text-black" : "text-[24px] font-bold text-[#0f1f3d]"
                    )}>
                        {title || "Laporan Akhir Mahasiswa"}
                    </h1>
                    <p className={cn(
                        "mt-1",
                        isLowVision ? "text-black font-extrabold text-base" : "text-[#666666] text-xs md:text-sm font-normal"
                    )}>
                        Rekapitulasi seluruh mahasiswa bimbingan yang telah disetujui judulnya (Desktop View).
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Button 
                        onClick={handleExportCSV}
                        variant="outline"
                        size="sm"
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2 rounded-none transition-colors font-medium text-xs tracking-wide",
                            "bg-white border-[#d0d0cc] text-[#444444] hover:bg-gray-50"
                        )}
                    >
                        <Download size={15} />
                        Export CSV
                    </Button>
                    <Button 
                        onClick={handlePrint}
                        size="sm"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-none transition-colors font-semibold text-xs tracking-wide bg-[#1c3a6b] text-white hover:bg-[#142b50]"
                    >
                        <Download size={15} />
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Main Content Container (Screen view - Hidden during printing) */}
            <div className={cn(
                "w-full flex-1 print:hidden flex flex-col gap-3",
                isLowVision 
                    ? "bg-white border-4 border-black p-4" 
                    : "bg-transparent"
            )}>
                {/* Search Bar */}
                <div className={cn(
                    "bg-white border border-[#e0e0da] px-4 py-1.5 flex items-center gap-2.5 print:hidden",
                    isLowVision && "border-2 border-black"
                )}>
                    <Search className={cn(
                        "w-4 h-4 shrink-0",
                        isLowVision ? "text-black" : "text-[#888888]"
                    )} />
                    <input 
                        type="text" 
                        placeholder="Cari berdasarkan nama atau NIM..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full py-1.5 bg-transparent outline-none text-xs md:text-sm placeholder:text-[rgba(51,51,51,0.5)] text-[#333333]",
                            isLowVision && "font-black text-black"
                        )}
                    />
                </div>

                {/* Table Data */}
                <div className={cn(
                    "overflow-x-auto w-full flex-1 bg-white border border-[#e0e0da]",
                    isLowVision && "border-2 border-black"
                )}>
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className={cn(
                                "bg-[#fafaf8] border-b border-[#e0e0da]",
                                isLowVision && "bg-slate-100 border-black"
                            )}>
                                <th className="py-3 px-3 text-center border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[45px]">NO</th>
                                <th className="py-3 px-3.5 border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[240px] min-w-[220px]">NAMA / NIM</th>
                                <th className="py-3 px-2 text-center border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[80px]">LOGBOOK DIISI</th>
                                <th className="py-3 px-2 text-center border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[95px]">LOGBOOK DISETUJUI</th>
                                <th className="py-3 px-3.5 border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[150px]">PROGRES LOGBOOK</th>
                                <th className="py-3 px-3.5 border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[230px] min-w-[220px]">NILAI PEMBIMBING (P1)</th>
                                <th className="py-3 px-3.5 border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[230px] min-w-[220px]">NILAI PENGUJI (P2)</th>
                                <th className="py-3 px-3 text-center border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[90px]">NILAI AKHIR</th>
                                <th className="py-3 px-3 text-center border-r border-[#ebebe7] text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[95px]">HURUF MUTU</th>
                                <th className="py-3 px-3 text-center text-[11px] font-bold text-[#444444] uppercase tracking-wider w-[105px]">TANGGAL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebebe7]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#1c3a6b] animate-spin mb-3"></div>
                                            <span className="text-sm font-medium text-gray-600">Memuat laporan...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-xs md:text-sm text-[#777777] bg-white">
                                        Data tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, idx) => {
                                    const percent = item.totalLogbook > 0 
                                        ? Math.round((item.totalLogbookApproved / item.totalLogbook) * 100) 
                                        : 0;
                                    const grade = getGrade(item.nilaiAkhir);

                                    return (
                                        <tr key={item.id} className="bg-white hover:bg-[#fafaf8] transition-colors border-b border-[#ebebe7]">
                                            {/* NO */}
                                            <td className="py-3.5 px-3.5 text-center border-r border-[#ebebe7] text-xs font-semibold text-[#1c3a6b]">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* NAMA / NIM */}
                                            <td className="py-3.5 px-3.5 border-r border-[#ebebe7]">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-[#1a1a1a] leading-snug">
                                                        {item.nama}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#666666] mt-0.5">
                                                        {item.nim}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* LOGBOOK DIISI */}
                                            <td className="py-3.5 px-3.5 text-center border-r border-[#ebebe7] text-xs font-semibold text-[#333333]">
                                                {item.totalLogbook}
                                            </td>

                                            {/* LOGBOOK DISETUJUI */}
                                            <td className="py-3.5 px-3.5 text-center border-r border-[#ebebe7]">
                                                <span className={cn(
                                                    "text-xs font-bold",
                                                    item.totalLogbookApproved > 0 ? "text-[#1e7e48]" : "text-[#aaaaaa]"
                                                )}>
                                                    {item.totalLogbookApproved}
                                                </span>
                                            </td>

                                            {/* PROGRES LOGBOOK */}
                                            <td className="py-3.5 px-3.5 border-r border-[#ebebe7] min-w-[140px]">
                                                <div className="flex flex-col gap-1.5 w-full">
                                                    <div className="flex items-center justify-between text-[11px] font-medium text-[#666666]">
                                                        <span>{percent}%</span>
                                                        <span>{item.totalLogbookApproved}/{item.totalLogbook}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-[#e8e8e4] rounded-[2px] overflow-hidden">
                                                        <div 
                                                            className={cn(
                                                                "h-full rounded-[2px] transition-all duration-300",
                                                                percent > 0 ? "bg-[#1e7e48]" : "bg-[#ddd]"
                                                            )}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* NILAI PEMBIMBING (P1) */}
                                            <td className="py-3.5 px-3.5 border-r border-[#ebebe7] min-w-[220px]">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="flex gap-1.5 items-center">
                                                        {[
                                                            { label: "K1", val: item.p1_k1 },
                                                            { label: "K2", val: item.p1_k2 },
                                                            { label: "K3", val: item.p1_k3 },
                                                        ].map((kItem, kIdx) => (
                                                            <div 
                                                                key={kIdx}
                                                                className={cn(
                                                                    "px-3 py-1.5 min-w-[48px] text-center flex flex-col items-center justify-center gap-0.5 border rounded-[4px] transition-colors",
                                                                    kItem.val !== null 
                                                                        ? "bg-[#f0f5fc] border-[#c8d8f0]" 
                                                                        : "bg-[#fafaf8] border-[#e0e0da]"
                                                                )}
                                                            >
                                                                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                                                                    {kItem.label}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs font-bold leading-none",
                                                                    kItem.val !== null ? "text-[#1c3a6b]" : "text-[#aaaaaa]"
                                                                )}>
                                                                    {kItem.val !== null ? kItem.val : "—"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="text-[#666666] font-medium truncate max-w-[160px]" title={item.p1_nama || ""}>
                                                            {item.p1_nama || "-"}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            item.p1_total !== null ? "text-[#1c3a6b]" : "text-[#cccccc]"
                                                        )}>
                                                            {item.p1_total !== null ? formatNilai(item.p1_total, 1) : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* NILAI PENGUJI (P2) */}
                                            <td className="py-3.5 px-3.5 border-r border-[#ebebe7] min-w-[220px]">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <div className="flex gap-1.5 items-center">
                                                        {[
                                                            { label: "K1", val: item.p2_k1 },
                                                            { label: "K2", val: item.p2_k2 },
                                                            { label: "K3", val: item.p2_k3 },
                                                        ].map((kItem, kIdx) => (
                                                            <div 
                                                                key={kIdx}
                                                                className={cn(
                                                                    "px-3 py-1.5 min-w-[48px] text-center flex flex-col items-center justify-center gap-0.5 border rounded-[4px] transition-colors",
                                                                    kItem.val !== null 
                                                                        ? "bg-[#f0f5fc] border-[#c8d8f0]" 
                                                                        : "bg-[#fafaf8] border-[#e0e0da]"
                                                                )}
                                                            >
                                                                <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                                                                    {kItem.label}
                                                                </span>
                                                                <span className={cn(
                                                                    "text-xs font-bold leading-none",
                                                                    kItem.val !== null ? "text-[#1c3a6b]" : "text-[#aaaaaa]"
                                                                )}>
                                                                    {kItem.val !== null ? kItem.val : "—"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="text-[#666666] font-medium truncate max-w-[160px]" title={item.p2_nama || ""}>
                                                            {item.p2_nama || "Belum ditentukan"}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs font-bold",
                                                            item.p2_total !== null ? "text-[#1c3a6b]" : "text-[#cccccc]"
                                                        )}>
                                                            {item.p2_total !== null ? formatNilai(item.p2_total, 1) : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* NILAI AKHIR */}
                                            <td className="py-3.5 px-3.5 text-center border-r border-[#ebebe7]">
                                                <span className={cn(
                                                    "text-xs md:text-sm font-bold",
                                                    item.nilaiAkhir !== null ? "text-[#1a1a1a]" : "text-[#cccccc]"
                                                )}>
                                                    {item.nilaiAkhir !== null ? formatNilai(item.nilaiAkhir, 1) : "—"}
                                                </span>
                                            </td>

                                            {/* HURUF MUTU */}
                                            <td className="py-3.5 px-3.5 text-center border-r border-[#ebebe7]">
                                                {item.nilaiAkhir !== null ? (
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold bg-[#f0f5fc] text-[#1c3a6b] border border-[#c8d8f0] rounded-[3px]">
                                                        {grade.huruf}
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-[#e0e0da] text-xs font-medium text-[#aaaaaa] mx-auto">
                                                        ?
                                                    </div>
                                                )}
                                            </td>

                                            {/* TANGGAL */}
                                            <td className="py-3.5 px-3.5 text-center text-xs font-medium text-[#555555]">
                                                {item.tanggalPenilaian ? format(new Date(item.tanggalPenilaian), "dd MMM yyyy", { locale: localeId }) : "—"}
                                            </td>
                                        </tr>
                                    );
                                })
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
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Sebelumnya
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    variant={currentPage === i + 1 ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg transition-colors border",
                                        currentPage === i + 1
                                            ? "bg-[#1c3a6b] text-white border-[#1c3a6b] hover:bg-[#142b50]"
                                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Selanjutnya
                        </Button>
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
