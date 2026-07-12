import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Loader2, Search, ChevronLeft, AlertCircle } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "~/components/ui/pagination";
import { useNavigate } from "react-router";

const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

export function BimbinganMobile() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Semua");

    // List Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
    const paginatedStudents = students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const fetchStudents = async (currentSearch = searchQuery, currentStatus = statusFilter) => {
        try {
            const data = await bimbinganApi.getDosenBimbinganStudents(currentSearch, currentStatus);
            setStudents(data || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    // Use debounce for search query
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents(searchQuery, statusFilter);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch immediately on status change
    useEffect(() => {
        fetchStudents(searchQuery, statusFilter);
        setCurrentPage(1);
    }, [statusFilter]);

    const handleStudentClick = (student: any) => {
        navigate(`/dosen/bimbingan/${student.mahasiswa.nim}`, { state: { student } });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#119DA4]" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist relative">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => window.history.back()}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1">Daftar Bimbingan</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* Search and Filter Controls */}
                <div className="flex flex-col gap-3 px-1">
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Daftar Mahasiswa ({students.length})
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#119DA4] focus:ring-1 focus:ring-[#119DA4] transition-all"
                            />
                        </div>
                        <div className="w-[140px]">
                            <CustomSelect
                                options={[
                                    { label: "Semua", value: "Semua" },
                                    { label: "Belum Target", value: "Belum Ditargetkan" },
                                    { label: "Perlu Revisi", value: "Perlu Revisi" },
                                    { label: "Tunggu Reviu", value: "Menunggu Reviu" },
                                    { label: "Dikerjakan", value: "Sedang Dikerjakan" },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val || "Semua")}
                                placeholder="Status"
                                className="py-2 px-3 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[250px]">
                        {searchQuery || statusFilter !== "Semua" ? (
                            <>
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <Search className="w-6 h-6 text-gray-300" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Data Tidak Ditemukan</h3>
                                <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                                    Tidak ada mahasiswa yang sesuai dengan kata kunci atau filter status.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(""); setStatusFilter("Semua"); }}
                                    className="mt-5 px-4 py-2 text-xs font-bold text-[#119DA4] bg-[#119DA4]/10 hover:bg-[#119DA4]/20 rounded-xl transition-colors"
                                >
                                    Hapus Filter
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <Users className="w-6 h-6 text-gray-300" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Belum ada mahasiswa</h3>
                                <p className="text-xs text-gray-500">
                                    Mahasiswa yang disetujui akan muncul di sini.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {paginatedStudents.map((pengajuan, idx) => {
                            const mhs = pengajuan.mahasiswa;
                            const bimbinganList = mhs.bimbingan || [];
                            const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                            return (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    {/* Mhs Info */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex flex-col gap-1 items-start">
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight">{mhs.nama}</h3>
                                                {activeTask?.status === 'SUBMITTED' && (
                                                    <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-mono text-gray-500 mt-0.5">{mhs.nim}</p>
                                        </div>
                                        <button
                                            onClick={() => handleStudentClick(pengajuan)}
                                            className="px-3 py-1.5 bg-[#119DA4] text-white text-[10px] font-bold rounded-lg shrink-0"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>

                                    {/* Judul & Progres */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                                        <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">
                                            {pengajuan.judul}
                                        </p>
                                    </div>

                                    {/* Current Task */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Target Saat Ini</span>
                                        {activeTask ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 border border-orange-100">
                                                    <FileText className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 leading-tight mb-1">{activeTask.topik}</span>
                                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${activeTask.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                        {getStatusPenilaian(activeTask.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Belum ada tugas</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="pt-2 flex justify-center pb-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === i + 1}
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
}
