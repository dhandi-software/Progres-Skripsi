import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    FileText, Plus, Trash2, Edit3, 
    Download as DownloadIcon, File as FileIcon,
    MoreVertical, ClipboardList, Eye
} from "lucide-react";
import { useNavigate } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { downloadApi, type Download, type DownloadResponse } from "~/api/downloadApi";
import { UPLOADS_URL } from "~/api/client";
import { Toast } from "~/components/ui/toast";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

export function DownloadDesktop({ title }: { title: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isDosen = user?.role === "dosen";

    const [downloads, setDownloads] = useState<Download[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<DownloadResponse["pagination"] | null>(null);
    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchData = async (currentPage: number) => {
        try {
            setIsLoading(true);
            const response = await downloadApi.getDownloads(currentPage, 10);
            setDownloads(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Fetch Downloads Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await downloadApi.deleteDownload(deletingId);
            setToast({ title: "Materi berhasil dihapus!", variant: "success" });
            fetchData(page);
        } catch (error) {
            setToast({ title: "Gagal menghapus materi.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-50/50">
            {/* Header - EXACT SAME AS ACARA */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 lg:p-12">
                <div>
                     <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timeline Materi & Dokumen</h1>
                     <p className="text-slate-500 text-sm mt-2 font-medium">Daftar unduhan materi kuliah dan panduan akademik.</p>
                </div>
                {isDosen && (
                    <Button 
                        onClick={() => navigate("/dosen/download/create")}
                        className="h-14 px-12 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-sm gap-3 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 w-full lg:w-fit"
                    >
                        <Plus size={20} strokeWidth={3} />
                        Tambah Materi Baru
                    </Button>
                )}
            </div>

            {/* Content - LIST STYLE LIKE ACARA */}
            <div className="flex-1 px-8 lg:px-12 pb-12 w-full">
                <div className="grid grid-cols-1 gap-6 w-full">
                    {isLoading ? (
                        [1,2,3].map(i => (
                            <div key={i} className="h-28 bg-white/50 border border-slate-100 rounded-[32px] animate-pulse" />
                        ))
                    ) : downloads.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100 shadow-sm">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                                 <ClipboardList size={56} />
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Belum Ada Materi Terdaftar</h3>
                             <p className="text-slate-400 mx-auto mt-4 font-medium">Materi atau dokumen yang Anda bagikan akan muncul di sini.</p>
                        </div>
                    ) : (
                        downloads.map(item => (
                            <div 
                                key={item.id} 
                                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 flex items-center justify-between gap-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-primary/10 transition-all duration-300 group w-full relative overflow-hidden"
                            >
                                <div className="absolute inset-y-0 left-0 w-2 bg-slate-50 group-hover:bg-brand-primary transition-colors duration-300" />
                                
                                <div className="flex items-center gap-6 flex-1 min-w-0 ml-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        {item.fileType === "PDF" ? <FileText size={28} /> : <FileIcon size={28} />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-lg lg:text-xl font-black text-slate-900 truncate tracking-tight mb-1">
                                            {item.dosen.nama} membagikan: {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary/60">
                                                DOKUMEN {item.fileType}
                                            </span>
                                            {item.description && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">
                                                        {item.description}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pr-2">
                                    <a 
                                        href={`${UPLOADS_URL}${item.fileUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 text-slate-400 hover:text-[#00bcd4] hover:bg-[#00bcd4]/5 rounded-xl transition-all"
                                        title="Lihat File"
                                    >
                                        <Eye size={20} />
                                    </a>
                                    <button 
                                        onClick={() => downloadApi.downloadFile(item.id, item.title)}
                                        className="p-3 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                                        title="Download File"
                                    >
                                        <DownloadIcon size={20} />
                                    </button>
                                    {isDosen && (
                                        <>
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(`/dosen/download/edit/${item.id}`)}
                                                className="p-3 h-12 w-12 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Edit Materi"
                                            >
                                                <Edit3 size={20} />
                                            </Button>
                                            <Button 
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setDeletingId(item.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-3 h-12 w-12 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Hapus Materi"
                                            >
                                                <Trash2 size={20} />
                                            </Button>
                                        </>
                                    )}
                                    <div className="p-3 text-slate-300">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="p-3 border-none bg-transparent hover:bg-slate-50 rounded-full transition-colors cursor-pointer outline-none">
                                                <MoreVertical size={20} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[50]">
                                                <DropdownMenuItem 
                                                    onClick={() => {
                                                        const url = `${UPLOADS_URL}${item.fileUrl}`;
                                                        window.open(url, "_blank");
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#00bcd4] transition-all font-bold text-sm"
                                                >
                                                    <Eye size={16} />
                                                    Lihat Dokumen
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => downloadApi.downloadFile(item.id, item.title)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-brand-primary transition-all font-bold text-sm"
                                                >
                                                    <DownloadIcon size={16} />
                                                    Unduh Dokumen
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) setPage(page - 1);
                                        }}
                                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            href="#"
                                            isActive={p === page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page < pagination.totalPages) setPage(page + 1);
                                        }}
                                        className={page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-[360px] w-full p-8 animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto shadow-sm">
                            <Trash2 size={28} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center tracking-tight mb-2 uppercase">Hapus Materi?</h3>
                        <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-8 px-2">
                             Tindakan ini tidak dapat dibatalkan. Mahasiswa tidak bisa lagi melihat materi ini di timeline.
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingId(null);
                                }}
                                className="flex-1 h-12 px-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex-1 h-12 px-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 active:scale-95"
                            >
                                Ya, Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-10 right-10 z-[200]">
                    <Toast 
                        title={toast.title} 
                        variant={toast.variant} 
                        onClose={() => setToast(null)} 
                    />
                </div>
            )}
        </div>
    );
}
