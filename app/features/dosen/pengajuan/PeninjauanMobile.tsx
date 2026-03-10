import { useNavigate } from "react-router";
import { Download, Pencil, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CustomSelect } from "~/components/ui/custom-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import type { Pengajuan } from "~/api/types";

interface MobileProps {
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

export function PeninjauanMobile({
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
}: MobileProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6 relative font-['Noto_Sans']">
            {/* Header Area */}
            <div className="flex flex-col gap-1">
                 <h1 className="text-xl font-bold text-gray-800">Daftar Peninjauan Judul</h1>
                 <p className="text-xs text-gray-500">Kelola permohonan peninjauan judul Kerja Praktik/Tugas Akhir mahasiswa.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
                 {/* Search */}
                 <div className="relative w-full">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <Input 
                         placeholder="Cari nama, nim, judul..." 
                         className="pl-9 bg-white border-gray-200 focus-visible:ring-brand-primary/20 h-11 shadow-sm"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                     />
                 </div>
                 
                 {/* Filters */}
                 <div className="flex gap-3">
                     <div className="w-1/2">
                         <CustomSelect 
                             value={filterStatus}
                             onChange={(val) => setFilterStatus(val)}
                             options={[
                                 { value: "ALL", label: "Semua" },
                                 { value: "PENDING", label: "Pending" },
                                 { value: "APPROVED", label: "Disetujui" },
                                 { value: "REJECTED", label: "Ditolak" }
                             ]}
                             placeholder="Status"
                         />
                     </div>

                     <div className="w-1/2">
                         <CustomSelect 
                             value={sortOrder}
                             onChange={(val) => setSortOrder(val as any)}
                             options={[
                                 { value: "TERBARU", label: "Terbaru" },
                                 { value: "TERLAMA", label: "Terlama" }
                             ]}
                             placeholder="Urutkan"
                         />
                     </div>
                 </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="flex flex-col gap-4 pb-20">
                {paginatedList.map((item) => (
                    <div key={`mobile-card-${item.id}`} className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4 font-['Noto_Sans'] relative hover:border-brand-primary/20 transition-colors">
                        {/* Status Badge Top Right */}
                        <div className="absolute top-5 right-5">
                            {item.status === 'APPROVED' ? (
                                <div className="inline-flex px-2.5 py-1 bg-white border border-gray-200 rounded-md items-center">
                                    <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider">VERIFIED</span>
                                </div>
                            ) : item.status === 'REJECTED' ? (
                                <div className="inline-flex px-2.5 py-1 bg-white border border-gray-200 rounded-md items-center">
                                    <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider">REJECTED</span>
                                </div>
                            ) : (
                                <div className="inline-flex px-2.5 py-1 bg-white border border-gray-200 rounded-md items-center">
                                    <span className="text-gray-800 text-[10px] font-bold uppercase tracking-wider">PENDING</span>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-start gap-4 pr-[80px]">
                            <div className="w-10 h-10 relative bg-green-100 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border border-green-200">
                                <span className="text-green-700 font-bold text-sm tracking-widest">{item.mahasiswa.nama.substring(0,2).toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <span className="text-sm font-bold text-gray-900 line-clamp-1">{item.mahasiswa.nama}</span>
                                <span className="text-xs text-gray-400 mt-1">NIM: {item.mahasiswa.nim}</span>
                                <span className="text-[11px] text-gray-400 line-clamp-1">{item.mahasiswa.jurusan}</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100"></div>

                        {/* Judul & Peminatan */}
                        <div className="flex flex-col gap-1.5 text-sm font-medium font-['Noto_Sans'] text-gray-800">
                            <div className="flex gap-2">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest min-w-[70px] mt-0.5">Judul</span>
                                <span className="text-gray-400 font-bold mt-0.5">:</span>
                                <span className="leading-relaxed line-clamp-2 text-[13px]">{item.judul}</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest min-w-[70px]">Peminatan</span>
                                <span className="text-gray-400 font-bold">:</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold font-['Noto_Sans'] tracking-wide border border-blue-100 whitespace-nowrap">{item.peminatan}</span>
                            </div>
                        </div>

                        {/* Academic Details Grid */}
                        <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-100 py-3 mt-1">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Semester</span>
                                <span className="text-xs font-semibold text-gray-800">{item.semester}</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tahun Akademik</span>
                                <span className="text-xs font-semibold text-gray-800">{item.tahunAkademik}</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-1">
                            <Button 
                                variant="outline" 
                                className="w-full text-gray-700 border-gray-200 bg-white hover:bg-gray-50 text-sm font-bold h-11 shadow-sm rounded-xl"
                                onClick={() => navigate(`/dosen/peninjauan/${item.id}`)}
                            >
                                <Pencil size={16} className="mr-2 text-gray-500" />
                                Tinjau Formulir
                            </Button>
                        </div>
                    </div>
                ))}
                
                {paginatedList.length === 0 && (
                    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-sm font-medium text-gray-500 font-['Noto_Sans'] mb-4">
                        Belum ada data peninjauan judul.
                    </div>
                )}
            </div>
            
            {/* Standardized Pagination Component */}
            {filteredListLength > itemsPerPage && !loading && (
                <div className="mt-2 mb-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50 text-xs px-2" : "text-xs px-2"}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                 if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                                     if (Math.abs(page - currentPage) === 2) return <PaginationEllipsis key={`ellipsis-${page}`} />;
                                     return null;
                                 }

                                 return (
                                    <PaginationItem key={page}>
                                        <PaginationLink 
                                            href="#" 
                                            isActive={currentPage === page}
                                            onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                            className="w-8 h-8 text-xs"
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
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50 text-xs px-2" : "text-xs px-2"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* FAB Download (Mobile Only) */}
            <div className="fixed bottom-[80px] right-6 md:hidden z-20">
                <Button 
                    onClick={handleDownloadPDF} 
                    className="w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-brand-primary hover:bg-brand-primary-hover hover:-translate-y-1 transition-all duration-300"
                    size="icon"
                >
                    <Download className="w-6 h-6 text-white" />
                </Button>
            </div>
        </div>
    );
}
