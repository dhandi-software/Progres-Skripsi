import React from "react";
import { Users, FileText } from "lucide-react";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "~/components/ui/pagination";
import { getStatusPenilaian } from "../../utils/bimbinganUtils";

interface StudentTableProps {
    students: any[];
    paginatedStudents: any[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    handleStudentClick: (student: any) => void;
    selectedStudent: any;
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    paginatedStudents,
    currentPage,
    totalPages,
    setCurrentPage,
    handleStudentClick,
    selectedStudent
}) => {
    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#119DA4]/10 rounded-xl text-[#119DA4]">
                        <Users className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">
                        Daftar Mahasiswa Bimbingan ({students.length})
                    </h2>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada mahasiswa</h3>
                    <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                        Saat judul pengajuan disetujui, mahasiswa otomatis masuk ke daftar bimbingan aktif Anda.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] uppercase tracking-[0.1em] text-gray-400 font-bold">
                                <th className="p-5 pl-8 w-1/4">Nama & NIM</th>
                                <th className="p-5 w-1/3">Judul Disetujui</th>
                                <th className="p-5 w-1/4">Target Saat Ini</th>
                                <th className="p-5 pr-8 text-right w-[150px]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedStudents.map((pengajuan, idx) => {
                                const mhs = pengajuan.mahasiswa;
                                const bimbinganList = mhs.bimbingan || [];
                                const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                                return (
                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-all duration-300">
                                        <td className="p-5 pl-8 align-top">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className="font-bold text-gray-900 leading-tight group-hover:text-[#119DA4] transition-colors">{mhs.nama}</span>
                                                {activeTask?.status === 'SUBMITTED' && (
                                                    <span className="bg-red-50 text-red-600 text-[9px] px-2 py-0.5 rounded-lg border border-red-100 font-black uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-gray-400 font-mono mt-1.5">{mhs.nim}</div>
                                        </td>
                                        <td className="p-5 align-top">
                                            <p className="text-sm font-medium text-gray-600 line-clamp-3 leading-relaxed">
                                                {pengajuan.judul}
                                            </p>
                                        </td>
                                        <td className="p-5 align-top">
                                            {activeTask ? (
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100/50">
                                                        <FileText className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[13px] font-bold text-gray-800 leading-tight">{activeTask.topik}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full ${activeTask.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'} shadow-sm shadow-current/20`} />
                                                            {getStatusPenilaian(activeTask.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-gray-400 font-bold bg-gray-50/80 py-2 px-4 border border-gray-100 rounded-xl inline-block">Batas Belum Diatur</span>
                                            )}
                                        </td>
                                        <td className="p-5 pr-8 align-top text-right">
                                            <button 
                                                onClick={() => handleStudentClick(pengajuan)}
                                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-[#119DA4] hover:text-[#119DA4] text-gray-600 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
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
            {totalPages > 1 && !selectedStudent && (
                <div className="p-5 border-t border-gray-50 flex justify-end bg-gray-50/30">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage - 1) }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-white hover:shadow-sm transition-all"}
                                />
                            </PaginationItem>
                            {Array.from({length: totalPages}).map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink 
                                        href="#" 
                                        isActive={currentPage === i + 1}
                                        onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}
                                        className={currentPage === i + 1 ? "bg-[#119DA4] text-white hover:bg-[#119DA4] shadow-md shadow-cyan-500/20" : "hover:bg-white hover:shadow-sm transition-all"}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(currentPage + 1) }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-white hover:shadow-sm transition-all"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};
