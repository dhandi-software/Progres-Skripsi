"use client";

import React from "react";
import { 
    Users, User, FileText, Search, GraduationCap,
    ArrowRight, Loader2, Info, BarChart3, ChevronRight,
    X, Download, Clock, CheckCircle2, FileStack, History as HistoryIcon,
    Menu, Filter
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import { useProdiBimbingan } from "~/hooks/useProdiBimbingan";

export function MonitoringMobile() {
    const { setOpenMobile } = useSidebar();
    const {
        data,
        isLoading,
        searchQuery,
        setSearchQuery,
        selectedDosen,
        setSelectedDosen,
        sortConfig,
        setSortConfig,
        currentPage,
        setCurrentPage,
        selectedStudentForHistory,
        setSelectedStudentForHistory,
        history,
        isHistoryLoading,
        fetchHistory,
        filteredData,
        totalPages,
        paginatedData,
        isDownloading,
        isDownloadingAll,
        handleDownloadProgress,
        handleDownloadAllProgress
    } = useProdiBimbingan();

    return (
        <div className="min-h-screen bg-white pb-20 font-geist">
            {/* Mobile Header */}
            <div className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setOpenMobile(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-50">
                        <Menu size={24} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">Monitoring</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bimbingan Dosen</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari dosen atau mahasiswa..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="animate-spin" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Memuat Data...</p>
                    </div>
                ) : (
                    <div className="w-full">
                        {!selectedDosen ? (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3 mb-6">
                                    <div className="flex bg-white rounded-[20px] p-1.5 border border-slate-200 shadow-sm shrink-0 overflow-x-auto w-full">
                                        <button 
                                            onClick={() => setSortConfig({ key: 'nama', direction: sortConfig.key === 'nama' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                                            className={cn("px-4 py-2.5 rounded-[16px] text-xs font-bold transition-all whitespace-nowrap flex-1", sortConfig.key === 'nama' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Nama {sortConfig.key === 'nama' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                        <button 
                                            onClick={() => setSortConfig({ key: 'progress', direction: sortConfig.key === 'progress' && sortConfig.direction === 'desc' ? 'asc' : 'desc'})}
                                            className={cn("px-4 py-2.5 rounded-[16px] text-xs font-bold transition-all whitespace-nowrap flex-1", sortConfig.key === 'progress' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Progres {sortConfig.key === 'progress' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                    </div>
                                    <Button onClick={handleDownloadAllProgress} disabled={isDownloadingAll} variant="outline" className="w-full gap-2 rounded-[16px] text-xs font-bold border-brand-primary text-brand-primary hover:bg-brand-primary/5 py-3 h-auto disabled:opacity-70">
                                        {isDownloadingAll ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {isDownloadingAll ? 'Menyiapkan PDF...' : 'Download Semua Data Dosen'}
                                    </Button>
                                </div>

                                {paginatedData.map((dosenData) => (
                                    <div 
                                        key={dosenData.dosen.id}
                                        onClick={() => setSelectedDosen(dosenData)}
                                        className="p-5 rounded-[28px] bg-white border border-slate-100 text-slate-900 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[16px] bg-slate-50 flex items-center justify-center font-black text-slate-700 border border-slate-100">
                                                    {dosenData.dosen.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-800 line-clamp-1">{dosenData.dosen.nama}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {dosenData.totalStudents} Mahasiswa
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300" />
                                        </div>

                                        <div className="space-y-1.5 mb-2 mt-2 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-700">
                                                <span>Skor Progres</span>
                                                <span>{dosenData.activeProgress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-primary" style={{ width: `${dosenData.activeProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="pt-8 pb-4 w-full flex justify-center">
                                        <Pagination>
                                            <PaginationContent className="gap-1">
                                                <PaginationItem>
                                                    <PaginationPrevious 
                                                        onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} 
                                                        className={cn("px-2.5", currentPage === 1 ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white")}
                                                    />
                                                </PaginationItem>
                                                
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink 
                                                            onClick={() => setCurrentPage(i + 1)}
                                                            isActive={currentPage === i + 1}
                                                            className={cn("cursor-pointer font-bold", currentPage !== i + 1 && "bg-white border border-slate-100 hover:bg-slate-50")}
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}
                                                
                                                <PaginationItem>
                                                    <PaginationNext 
                                                        onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} 
                                                        className={cn("px-2.5", currentPage === totalPages ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white")}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        ) : !selectedStudentForHistory ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={() => setSelectedDosen(null)}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
                                    >
                                        <ChevronRight size={16} className="rotate-180" /> Kembali
                                    </button>
                                    
                                    <Button onClick={handleDownloadProgress} disabled={isDownloading} size="sm" className="gap-1.5 rounded-full text-[10px] text-white font-bold bg-slate-800 shadow-sm disabled:opacity-70">
                                        {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {isDownloading ? '...' : 'PDF'}
                                    </Button>
                                </div>
                                
                                <div className="bg-brand-primary/5 p-6 rounded-[32px] border border-brand-primary/10">
                                    <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{selectedDosen.dosen.nama}</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedDosen.totalStudents} Mahasiswa Bimbingan</p>
                                </div>
                                
                                <div className="space-y-3">
                                    {selectedDosen.students.map((student, idx) => {
                                        const activeTask = student.mahasiswa?.bimbingan?.[0];
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => fetchHistory(student)}
                                                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-[14px] flex items-center justify-center text-slate-700 font-black border border-slate-100">
                                                        {student.mahasiswa.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1 line-clamp-1">{student.mahasiswa.nama}</p>
                                                        <p className="text-[10px] font-mono text-slate-500">{student.mahasiswa.nim}</p>
                                                        <p className="text-[10px] font-bold text-brand-primary mt-1">{student.mahasiswa?._count?.bimbingan || 0} Kali Bimbingan</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-3 border border-slate-100">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 overflow-hidden line-clamp-1">
                                                        <FileText size={14} className="shrink-0 text-brand-primary" />
                                                        <span className="truncate">{activeTask?.topik || "Belum ada target"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                                        activeTask?.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                        activeTask?.status === 'SUBMITTED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        activeTask?.status === 'REVISION' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-white text-slate-400 border-slate-200"
                                                    )}>
                                                        {activeTask?.status || "PENDING"}
                                                    </span>
                                                    
                                                    <div className="text-[10px] font-bold text-brand-primary flex items-center gap-1">
                                                        Riwayat <ArrowRight size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <button 
                                    onClick={() => setSelectedStudentForHistory(null)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
                                >
                                    <ChevronRight size={16} className="rotate-180" /> Kembali
                                </button>
                                
                                <div className="bg-white rounded-[32px] shadow-sm p-6 border border-slate-100">
                                    <div className="mb-6 border-b border-slate-100 pb-5">
                                        <h3 className="text-lg font-black text-slate-900">{selectedStudentForHistory.nama}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detail Bimbingan — {selectedStudentForHistory.nim}</p>
                                    </div>

                                    {isHistoryLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                                            <Loader2 className="animate-spin" size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Memuat Riwayat...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.length > 0 ? history.map((item, idx) => (
                                                <div key={item.id} className="relative pl-8 before:absolute before:left-3 before:top-4 before:bottom-[-20px] before:w-0.5 before:bg-slate-100 last:before:hidden">
                                                    <div className={cn(
                                                        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                                                        item.status === 'APPROVED' ? "bg-emerald-500" : "bg-brand-primary"
                                                    )}>
                                                        <span className="text-[8px] font-black text-white">V{item.versi}</span>
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="font-black text-xs text-slate-900 leading-tight">{item.topik}</h5>
                                                            <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase border",
                                                                item.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                                            )}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium italic mb-4 leading-relaxed">"{item.catatan || "Tidak ada catatan."}"</p>
                                                        
                                                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                            {item.fileMahasiswa && <span className="text-brand-primary flex items-center gap-1.5"><Download size={12} /> Draft</span>}
                                                            {item.fileDosen && <span className="text-emerald-500 flex items-center gap-1.5"><Download size={12} /> Reviu</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-10 text-slate-300 font-black uppercase tracking-widest text-[10px]">Belum Ada Riwayat</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
