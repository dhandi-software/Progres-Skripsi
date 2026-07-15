import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    Plus, Trash2, Edit3, 
    Download as DownloadIcon, File as FileIcon,
    MoreVertical, FileText, ClipboardList, Eye, ArrowLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
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

export function DownloadMobile({ title }: { title: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const routePrefix = location.pathname.startsWith("/admin") 
        ? "/admin/download" 
        : location.pathname.startsWith("/staf")
        ? "/staf/download"
        : "/dosen/download";
    const canManage = ["dosen", "dosen_pembimbing", "kaprodi", "staf", "staf_univ", "admin"].includes(user?.role?.toLowerCase() || "");

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
            const response = await downloadApi.getDownloads(currentPage, 15);
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
            setToast({ title: "Berhasil dihapus!", variant: "success" });
            fetchData(page);
        } catch (error) {
            setToast({ title: "Gagal hapus.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-white pb-24">
            {/* Header Mobile */}

            <div className="flex flex-col gap-2 p-8 pb-4">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Timeline Materi</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">Daftar unduhan materi kuliah & panduan.</p>
            </div>

            {/* List - MATCH ACARA STYLE */}
            <div className="flex-1 px-8 space-y-4">
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-[24px] animate-pulse" />)
                ) : downloads.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Belum ada materi.</p>
                    </div>
                ) : (
                    downloads.map(item => (
                        <div 
                            key={item.id} 
                            className="bg-white border border-slate-100 rounded-[28px] p-5 flex items-center gap-4 active:scale-95 transition-all shadow-sm group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0">
                                {item.fileType === "PDF" ? <FileText size={24} /> : <FileIcon size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 truncate mb-0.5">{item.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(item.createdAt), "dd MMM", { locale: id })}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-black text-[#00bcd4]/60 uppercase">
                                        DOKUMEN {item.fileType}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 shrink-0">
                                <div className="flex items-center gap-2">
                                    <a 
                                        href={`${UPLOADS_URL}${item.fileUrl}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#00bcd4] active:scale-90 transition-all border border-slate-100"
                                        title="Lihat File"
                                    >
                                        <Eye size={16} />
                                    </a>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadApi.downloadFile(item.id, item.title);
                                        }}
                                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-brand-primary active:scale-90 transition-all border border-slate-100 cursor-pointer"
                                        title="Download File"
                                    >
                                        <DownloadIcon size={16} />
                                    </button>
                                </div>
                                {canManage && (
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`${routePrefix}/edit/${item.id}`);
                                            }}
                                            className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 active:scale-90 transition-all border border-blue-100"
                                        >
                                            <Edit3 size={16} />
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(item.id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 active:scale-90 transition-all border border-red-100"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center pb-8 border-t border-slate-50 pt-8">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) setPage(page - 1);
                                        }}
                                        className={page === 1 ? "pointer-events-none opacity-20" : "active:scale-90"}
                                    />
                                </PaginationItem>
                                
                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                                    <PaginationItem key={p}>
                                        <PaginationLink
                                            href="#"
                                            isActive={p === page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(p);
                                            }}
                                            className="w-8 h-8 text-xs"
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
                                        className={page === pagination.totalPages ? "pointer-events-none opacity-20" : "active:scale-90"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Floating Action Button - MATCH ACARA */}
            {canManage && (
                <Button 
                    onClick={() => navigate(`${routePrefix}/create`)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-brand-primary/40 active:scale-90 transition-all z-50 border-none"
                >
                    <Plus size={28} strokeWidth={3} />
                </Button>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full max-w-sm p-8 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
                            <Trash2 size={28} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center tracking-tight mb-3 uppercase">Hapus Materi?</h3>
                        <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-8">
                            Tindakan ini tidak dapat dikembalikan. Mahasiswa tidak bisa lagi melihat materi ini.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                variant="destructive"
                                onClick={handleDelete}
                                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600 active:bg-red-700 text-white shadow-lg shadow-red-600/20"
                            >
                                Ya, Hapus Materi
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingId(null);
                                }}
                                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 text-slate-500 active:bg-slate-50"
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-10 left-6 right-6 z-[300]">
                    <Toast title={toast.title} variant={toast.variant} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    );
}
