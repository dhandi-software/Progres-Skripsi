import { useNavigate } from "react-router";
import { Copy, FileText, CheckCircle, XCircle, Clock, Pencil, Search, SlidersHorizontal, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CustomSelect } from "~/components/ui/custom-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import type { Pengajuan, User } from "~/api/types";

interface DesktopProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    sortOrder: "TERBARU" | "TERLAMA";
    setSortOrder: (order: "TERBARU" | "TERLAMA") => void;
    paginatedList: Pengajuan[];
    handleDownloadPDF: () => void;
    loading: boolean;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    handlePageChange: (page: number) => void;
    filteredListLength: number;
}

export function PeninjauanDesktop({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sortOrder,
    setSortOrder,
    paginatedList,
    handleDownloadPDF,
    loading,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    filteredListLength
}: DesktopProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Controls */}
            <div className="flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold mb-1 text-gray-800 font-['Noto_Sans']">Daftar Peninjauan Judul</h1>
                     <p className="text-sm text-gray-500 font-['Noto_Sans']">Kelola permohonan peninjauan judul Kerja Praktik/Tugas Akhir mahasiswa.</p>
                </div>
            </div>

            {/* Filters Area */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 font-['Noto_Sans']">
                <div className="flex gap-3 w-full md:w-auto">
                    {/* Status Filter */}
                    <div className="w-[150px]">
                        <CustomSelect
                            options={[
                                { label: "Semua Status", value: "ALL" },
                                { label: "Pending", value: "PENDING" },
                                { label: "Disetujui", value: "APPROVED" },
                            ]}
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val || "ALL")}
                            placeholder="Pilih Status"
                        />
                    </div>

                    {/* Sort */}
                    <div className="w-[140px]">
                        <CustomSelect
                            options={[
                                { label: "Terbaru", value: "TERBARU" },
                                { label: "Terlama", value: "TERLAMA" },
                            ]}
                            value={sortOrder}
                            onChange={(val) => setSortOrder(val as any || "TERBARU")}
                            placeholder="Urutkan"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            placeholder="Cari nama, nim, judul..." 
                            className="pl-9 bg-gray-50/50 border-gray-200 focus-visible:ring-brand-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Native Print & Custom Download PDF */}
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handleDownloadPDF} className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm w-10 h-10 transition-colors">
                                        <Download className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Unduh PDF</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100">
                                <th className="px-6 py-4 w-[25%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Nama Mahasiswa</th>
                                <th className="px-6 py-4 w-[25%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Judul</th>
                                <th className="px-6 py-4 w-[15%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Peminatan</th>
                                <th className="px-6 py-4 w-[8%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Semester</th>
                                <th className="px-6 py-4 w-[10%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Tahun Akademik</th>

                                <th className="px-6 py-4 w-[8%] text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                                <th className="px-6 py-4 w-[5%] text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedList.map((item) => (
                                <tr key={`row-${item.id}`} className="hover:bg-gray-50/50 transition-colors bg-white group">
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 relative bg-green-100 rounded-full flex-shrink-0 flex items-center justify-center border border-green-200">
                                                 <span className="text-green-700 font-bold text-sm tracking-widest">{item.mahasiswa.nama.substring(0,2).toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="text-sm font-bold font-['Noto_Sans'] text-gray-900 leading-tight">{item.mahasiswa.nama}</span>
                                                    {item.status === 'PENDING' && (
                                                        <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-normal font-['Noto_Sans'] text-gray-400 mt-1">NIM: {item.mahasiswa.nim}</span>

                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-top text-[13px] leading-relaxed text-gray-800 line-clamp-3" title={item.judul}>
                                        {item.judul}
                                    </td>
                                    <td className="px-6 py-5 align-top">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold font-['Noto_Sans'] tracking-wide border border-blue-100 whitespace-nowrap">{item.peminatan}</span>
                                    </td>
                                    <td className="px-6 py-5 align-top text-sm font-medium font-['Noto_Sans'] text-gray-700">{item.semester}</td>
                                    <td className="px-6 py-5 align-top text-sm font-medium font-['Noto_Sans'] text-gray-700">{item.tahunAkademik}</td>
                                    <td className="px-6 py-5 align-top">
                                        {item.status === 'APPROVED' ? (
                                            <div className="inline-flex px-3 py-1.5 bg-white rounded-md border border-gray-200 items-center justify-center" title="Disetujui">
                                                <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider font-['Noto_Sans']">VERIFIED</span>
                                            </div>
                                        ) : item.status === 'REJECTED' ? (
                                            <div className="inline-flex px-3 py-1.5 bg-white rounded-md border border-gray-200 items-center justify-center" title="Ditolak">
                                                <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider font-['Noto_Sans']">REJECTED</span>
                                            </div>
                                        ) : item.status === 'REVISION' ? (
                                            <div className="inline-flex px-3 py-1.5 bg-white rounded-md border border-gray-200 items-center justify-center" title="Revisi">
                                                <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider font-['Noto_Sans']">REVISION</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex px-3 py-1.5 bg-white rounded-md border border-gray-200 items-center justify-center" title="Menunggu Tinjauan">
                                                <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider font-['Noto_Sans']">PENDING</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 align-top text-center">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => navigate(`/dosen/peninjauan/${item.id}`)}
                                            title="Tinjau Formulir"
                                            className="text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 bg-white border border-gray-200 rounded-full shadow-sm w-9 h-9 flex justify-center items-center mx-auto transition-transform hover:scale-105"
                                        >
                                            <Pencil size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 font-['Noto_Sans'] text-sm">
                                        Belum ada data peninjauan judul.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Standardized Pagination Component */}
            {filteredListLength > itemsPerPage && !loading && (
                <div className="mt-4 mb-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                 if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                                     if (Math.abs(page - currentPage) === 3) return <PaginationEllipsis key={`ellipsis-${page}`} />;
                                     return null;
                                 }

                                 return (
                                    <PaginationItem key={page}>
                                        <PaginationLink 
                                            href="#" 
                                            isActive={currentPage === page}
                                            onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                 )
                            })}

                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
