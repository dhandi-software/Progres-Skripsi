import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Loader2, BookOpen, Search } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "~/components/ui/pagination";
import { useNavigate } from "react-router";

import { UPLOADS_URL } from "~/api/client";
import { useAuth } from "~/hooks/useAuth";
import { io } from "socket.io-client";

const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

export function BimbinganDesktop() {
    const { user } = useAuth();
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

    // Real-time updates
    useEffect(() => {
        if (!user) return;
        const socket = io(UPLOADS_URL);
        socket.emit("join", user.id);
        
        socket.on("bimbingan_submitted", () => {
            fetchStudents(searchQuery, statusFilter);
        });

        return () => {
            socket.disconnect();
        };
    }, [user, searchQuery, statusFilter]);

    const handleStudentClick = (student: any) => {
        // Navigate to detail route and pass student data as state
        navigate(`/dosen/bimbingan/${student.mahasiswa.nim}`, { state: { student } });
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#119DA4]" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-geist relative pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-[#119DA4]" />
                    Manajemen Bimbingan
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Pantau mahasiswa bimbingan aktif dan berikan target/tugas progres pengerjaan laporan secara terpusat.
                </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Daftar Mahasiswa Bimbingan ({students.length})
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[250px]">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama atau NIM..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#119DA4] focus:ring-1 focus:ring-[#119DA4] transition-all"
                            />
                        </div>
                        <div className="w-full md:w-[200px]">
                            <CustomSelect
                                options={[
                                    { label: "Semua Status", value: "Semua" },
                                    { label: "Belum Ditargetkan", value: "Belum Ditargetkan" },
                                    { label: "Perlu Revisi", value: "Perlu Revisi" },
                                    { label: "Menunggu Reviu", value: "Menunggu Reviu" },
                                    { label: "Sedang Dikerjakan", value: "Sedang Dikerjakan" },
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val || "Semua")}
                                placeholder="Pilih Status"
                            />
                        </div>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
                        {searchQuery || statusFilter !== "Semua" ? (
                            <>
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">Data Tidak Ditemukan</h3>
                                <p className="text-sm text-gray-500 w-full">
                                    Tidak ada mahasiswa yang sesuai dengan kata kunci atau filter status yang Anda pilih.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(""); setStatusFilter("Semua"); }}
                                    className="mt-6 px-4 py-2 text-sm font-bold text-[#119DA4] bg-[#119DA4]/10 hover:bg-[#119DA4]/20 rounded-xl transition-colors"
                                >
                                    Hapus Filter
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                    <Users className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">Belum ada mahasiswa</h3>
                                <p className="text-sm text-gray-500 w-full">
                                    Mahasiswa yang pengajuan judulnya telah disetujui akan muncul di sini.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="p-4 pl-6 w-[20%]">Nama & NIM</th>
                                    <th className="p-4 w-[30%]">Judul Disetujui</th>
                                    <th className="p-4 w-[15%] text-center">Total Bimbingan</th>
                                    <th className="p-4 w-[20%]">Target Saat Ini</th>
                                    <th className="p-4 pr-6 text-right w-[150px]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedStudents.map((pengajuan, idx) => {
                                    const mhs = pengajuan.mahasiswa;
                                    const bimbinganList = mhs.bimbingan || [];
                                    const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 pl-6 align-top">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <span className="font-bold text-gray-900 leading-tight">{mhs.nama}</span>
                                                    {activeTask?.status === 'SUBMITTED' && (
                                                        <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{mhs.nim}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="text-sm font-medium text-gray-700 line-clamp-3 leading-relaxed">
                                                    {pengajuan.judul}
                                                </p>
                                            </td>
                                            <td className="p-4 align-top text-center">
                                                <div className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100">
                                                    {bimbinganList.length} Kali
                                                </div>
                                            </td>
                                            <td className="p-4 align-top">
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
                                                    <span className="text-xs text-gray-400 italic bg-gray-50 py-1.5 px-3 border border-gray-100 rounded-md">Belum ada target aktif</span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 align-top text-right">
                                                <button
                                                    onClick={() => handleStudentClick(pengajuan)}
                                                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                                                >
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-end">
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
