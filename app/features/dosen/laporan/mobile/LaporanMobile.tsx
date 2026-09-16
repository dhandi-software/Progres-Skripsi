import React from "react";
import { Search, Download } from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CetakLaporanDocument } from "../components/CetakLaporanDocument";
import { useLaporan } from "~/hooks/useLaporan";
import { getGrade, formatNilai } from "~/features/dosen/penilaian/types/penilaian";
import { Button } from "~/components/ui/button";

export function LaporanMobile({ title }: { title?: string }) {
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

                <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button 
                        onClick={handleExportCSV}
                        variant="outline"
                        className="flex flex-col items-center justify-center gap-1 h-auto p-2.5 rounded-lg transition-colors font-semibold text-xs shadow-sm bg-white border border-[#d1d7db] text-[#54656f] hover:bg-gray-50"
                    >
                        <Download size={16} />
                        <span>Export CSV</span>
                    </Button>
                    <Button 
                        onClick={handlePrint}
                        className="flex flex-col items-center justify-center gap-1 h-auto p-2.5 rounded-lg transition-colors font-semibold text-xs shadow-sm bg-[#1c3a6b] text-white hover:bg-[#142b50]"
                    >
                        <Download size={16} />
                        <span>Download PDF</span>
                    </Button>
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
                                    isLowVision ? "text-lg font-black text-black" : "text-base font-bold text-slate-950"
                                )}>
                                    {item.nama}
                                </span>
                                <span className={cn(
                                    "text-xs font-medium",
                                    isLowVision ? "text-sm font-extrabold text-black" : "text-slate-600"
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
