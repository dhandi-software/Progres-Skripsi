import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    ClipboardList, Send, MessageSquare, 
    ArrowLeft, Plus, Trash2, Edit3, 
    MoreVertical, Users, 
    Link as LinkIcon, Check
} from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { acaraApi } from "~/api/acaraApi";
import { profileApi } from "~/api/profileApi";
import type { Acara, AcaraResponse } from "~/api/acaraApi";
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
import { sanitizeHtml } from "~/lib/sanitize";

export function AcaraMobile({ title }: { title: string }) {
    const { user } = useAuth();
    const currentUserPhoto = typeof window !== "undefined" ? (localStorage.getItem("userPhoto") || user?.photo) : user?.photo;
    const hasUserPhoto = currentUserPhoto && currentUserPhoto !== "null" && currentUserPhoto !== "undefined" && currentUserPhoto !== "/images/avatar.svg";
    const myName = user?.name || user?.username || "?";
    const myInitial = myName.charAt(0).toUpperCase();
    const navigate = useNavigate();
    const location = useLocation();
    const routePrefix = location.pathname.startsWith("/admin") 
        ? "/admin/acara" 
        : location.pathname.startsWith("/staf")
        ? "/staf/acara"
        : "/dosen/acara";

    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAcara, setSelectedAcara] = useState<Acara | null>(null);
    const [newComment, setNewComment] = useState("");
    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<AcaraResponse["pagination"] | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [isCopying, setIsCopying] = useState(false);
    
    const fetchData = async (currentPage: number) => {
        try {
            setIsLoading(true);
            const response = await acaraApi.getAcara(currentPage, 10);
            setAcaras(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Fetch Acara Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    // -- LOGIKA DEEP LINKING (Lecturer Mobile) --
    useEffect(() => {
        const postId = searchParams.get("post");
        if (postId && !selectedAcara) {
            const id = parseInt(postId);
            const localMatch = acaras.find(a => a.id === id);
            if (localMatch) {
                setSelectedAcara(localMatch);
            } else if (!isLoading && acaras.length > 0) {
                acaraApi.getAcaraById(id).then(data => {
                    setSelectedAcara(data);
                }).catch(err => {
                    console.error("Gagal deep link dosen mobile:", err);
                    setSearchParams({});
                });
            }
        }
    }, [searchParams, acaras.length, isLoading]);

    const transformContent = (content: string) => {
        if (!content) return "";
        const baseUploads = UPLOADS_URL.replace(/\/$/, "");
        const transformed = content
            .replace(/src="\/uploads\//g, `src="${baseUploads}/uploads/`)
            .replace(/href="\/uploads\//g, `href="${baseUploads}/uploads/`)
            .replace(/<img([^>]*)src="([^">]+)"([^>]*)>/g, (match, p1, src, p2) => {
                const updatedImg = `<img${p1}src="${src}"${p2}`.replace(/<img /g, '<img class="w-full h-auto max-h-[400px] rounded-2xl my-8 shadow-lg border border-slate-100 object-contain bg-slate-50/30 hover:scale-[1.02] transition-transform cursor-pointer" ');
                return `<a href="${src}" target="_blank" rel="noopener noreferrer">${updatedImg}</a>`;
            });
        
        return sanitizeHtml(transformed);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAcara || !newComment.trim()) return;
        try {
            const comment = await acaraApi.addComment(selectedAcara.id, newComment);
            
            const updatedAcara = {
                ...selectedAcara,
                comments: [...selectedAcara.comments, comment]
            };
            setSelectedAcara(updatedAcara);
            setNewComment("");

            setAcaras(prev => prev.map(item => 
                item.id === selectedAcara.id ? updatedAcara : item
            ));
        } catch (error) {
            alert("Gagal menambah komentar.");
        }
    };

    const handleSelectAcara = (item: Acara) => {
        setSelectedAcara(item);
        setSearchParams({ post: item.id.toString() });
    };

    const handleBack = () => {
        setSelectedAcara(null);
        setSearchParams({});
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?post=${selectedAcara?.id}`;
        navigator.clipboard.writeText(url);
        setIsCopying(true);
        setToast({ title: "Link berhasil disalin!", variant: "success" });
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleCopySpecificLink = (id: number) => {
        const url = `${window.location.origin}${window.location.pathname}?post=${id}`;
        navigator.clipboard.writeText(url);
        setIsCopying(true);
        setToast({ title: "Link berhasil disalin!", variant: "success" });
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await acaraApi.deleteAcara(deletingId);
            if (selectedAcara?.id === deletingId) setSelectedAcara(null);
            setToast({ title: "Postingan berhasil dihapus!", variant: "success" });
            fetchData(page);
        } catch (error) {
            setToast({ title: "Gagal menghapus.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    if (selectedAcara) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-4 px-6 h-20 border-b border-slate-100 shrink-0">
                    <button 
                        onClick={handleBack}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00bcd4] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#00bcd4]/20">
                        <ClipboardList size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-slate-900 truncate tracking-tight">{selectedAcara.title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 flex items-center gap-1.5 flex-wrap">
                            <span>{selectedAcara.user?.role === 'admin' ? 'Admin' : (selectedAcara.user?.mahasiswa?.nama || selectedAcara.user?.dosen?.nama || selectedAcara.user?.username || selectedAcara.dosen.nama || "Sistem")}</span>
                            <span className={cn(
                                "text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none",
                                (selectedAcara.user?.role || "DOSEN").toUpperCase() === "MAHASISWA" 
                                    ? "bg-blue-50 text-blue-500 border border-blue-100/50" 
                                    : (selectedAcara.user?.role || "DOSEN").toUpperCase() === "DOSEN" || (selectedAcara.user?.role || "DOSEN").toUpperCase() === "KAPRODI"
                                    ? "bg-purple-50 text-purple-500 border border-purple-100/50"
                                    : (selectedAcara.user?.role || "DOSEN").toUpperCase() === "ADMIN"
                                    ? "bg-red-50 text-red-500 border border-red-100/50"
                                    : "bg-slate-50 text-slate-500 border border-slate-100"
                            )}>
                                {(selectedAcara.user?.role || "DOSEN").toUpperCase() === "MAHASISWA" ? "Mahasiswa" : (selectedAcara.user?.role || "DOSEN").toUpperCase() === "DOSEN" || (selectedAcara.user?.role || "DOSEN").toUpperCase() === "KAPRODI" ? "Dosen" : (selectedAcara.user?.role || "DOSEN").toUpperCase() === "ADMIN" ? "Admin" : "Staff"}
                            </span>
                            <span>• {format(new Date(selectedAcara.createdAt), "dd MMM", { locale: id })}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-2 border-none bg-transparent active:bg-slate-100 rounded-full outline-none">
                                <MoreVertical size={20} className="text-slate-400" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[200]">
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyLink();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl active:bg-slate-50 text-slate-600 font-bold text-sm"
                                >
                                    <LinkIcon size={16} />
                                    Salin Link
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <button 
                        onClick={() => {
                            setDeletingId(selectedAcara.id);
                            setShowDeleteModal(true);
                        }}
                        className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 active:scale-95 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
                    <div 
                        className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-800 prose-p:leading-relaxed prose-strong:text-slate-950 prose-a:text-[#00bcd4] prose-a:font-bold text-sm mb-12"
                        dangerouslySetInnerHTML={{ __html: transformContent(selectedAcara.content) }} 
                    />

                    <hr className="border-slate-100 my-10" />

                    <div className="space-y-6 mb-24">
                        <div className="flex items-center gap-3">
                            <MessageSquare size={18} className="text-slate-400" />
                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Komentar Kelas</h3>
                        </div>

                        <div className="space-y-6">
                            {selectedAcara.comments.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">Belum ada komentar.</p>
                            ) : (
                                selectedAcara.comments.map(comment => {
                                    const displayName = comment.user.mahasiswa?.nama || comment.user.dosen?.nama || comment.user.username;
                                    const initial = displayName.charAt(0).toUpperCase();
                                    const hasPhoto = comment.user.photo && comment.user.photo !== "null" && comment.user.photo !== "undefined";
                                    return (
                                        <div key={comment.id} className="flex gap-3">
                                            {hasPhoto ? (
                                                <img 
                                                    src={profileApi.getProfilePhotoUrl(comment.user.photo!)} 
                                                    alt={displayName} 
                                                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-xs border border-slate-200">
                                                    {initial}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-[11px] font-black text-slate-900 truncate">
                                                        {displayName}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none",
                                                        comment.user.role.toUpperCase() === "MAHASISWA" 
                                                            ? "bg-blue-50 text-blue-500 border border-blue-100/50" 
                                                            : comment.user.role.toUpperCase() === "DOSEN" || comment.user.role.toUpperCase() === "KAPRODI"
                                                            ? "bg-purple-50 text-purple-500 border border-purple-100/50"
                                                            : "bg-slate-50 text-slate-500 border border-slate-100"
                                                    )}>
                                                        {comment.user.role.toUpperCase() === "MAHASISWA" ? "Mhs" : comment.user.role.toUpperCase() === "DOSEN" || comment.user.role.toUpperCase() === "KAPRODI" ? "Dosen" : "Staff"}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300">{format(new Date(comment.createdAt), "HH:mm", { locale: id })}</span>
                                                </div>
                                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-14 left-6 right-6 z-[150] animate-in fade-in slide-in-from-bottom duration-700">
                    <form 
                        onSubmit={handleAddComment} 
                        className="flex gap-3 items-center bg-white/95 backdrop-blur-md border border-slate-200/50 p-2.5 pl-3 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03] max-w-[500px] mx-auto"
                    >
                        {hasUserPhoto ? (
                            <img 
                                src={currentUserPhoto} 
                                alt={myName} 
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-brand-primary/20 shadow-inner" 
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-black text-xs border border-brand-primary/20 shadow-inner">
                                {myInitial}
                            </div>
                        )}
                        <div className="flex-1 relative group">
                            <input 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Tulis komentar..."
                                className="w-full bg-transparent border-none py-2 text-[13px] font-medium focus:outline-none placeholder:text-slate-400 pr-10"
                            />
                            <button 
                                type="submit" 
                                className={cn(
                                    "absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300",
                                    newComment.trim() ? "text-white bg-brand-primary shadow-lg shadow-brand-primary/30 scale-110" : "text-slate-300"
                                )}
                            >
                                <Send size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-white pb-24">
            <div className="flex flex-col gap-2 p-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengumuman & Instruksi</h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Daftar pengumuman & instruksi bimbingan.</p>
            </div>

            <div className="flex-1 px-8 space-y-4">
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-[24px] animate-pulse" />)
                ) : acaras.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Belum ada pengumuman.</p>
                    </div>
                ) : (
                    acaras.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => handleSelectAcara(item)}
                            className="bg-white border border-slate-100 rounded-[28px] p-5 flex items-center gap-4 active:scale-95 transition-all shadow-sm group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0">
                                <ClipboardList size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <span className="text-[10px] font-black text-slate-800 leading-none">
                                        {item.user?.role === 'admin' ? 'Admin' : (item.user?.mahasiswa?.nama || item.user?.dosen?.nama || item.user?.username || item.dosen?.nama || "Sistem")}
                                    </span>
                                    <span className={cn(
                                        "text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none scale-90 origin-left",
                                        (item.user?.role || "DOSEN").toUpperCase() === "MAHASISWA" 
                                            ? "bg-blue-50 text-blue-500 border border-blue-100/50" 
                                            : (item.user?.role || "DOSEN").toUpperCase() === "DOSEN" || (item.user?.role || "DOSEN").toUpperCase() === "KAPRODI"
                                            ? "bg-purple-50 text-purple-500 border border-purple-100/50"
                                            : (item.user?.role || "DOSEN").toUpperCase() === "ADMIN"
                                            ? "bg-red-50 text-red-500 border border-red-100/50"
                                            : "bg-slate-50 text-slate-500 border border-slate-100"
                                    )}>
                                        {(item.user?.role || "DOSEN").toUpperCase() === "MAHASISWA" ? "Mahasiswa" : (item.user?.role || "DOSEN").toUpperCase() === "DOSEN" || (item.user?.role || "DOSEN").toUpperCase() === "KAPRODI" ? "Dosen" : (item.user?.role || "DOSEN").toUpperCase() === "ADMIN" ? "Admin" : "Staff"}
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 truncate mb-0.5">{item.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(item.createdAt), "dd MMM", { locale: id })}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-bold text-[#00bcd4]/60 uppercase">
                                        {item.type === "ASSIGNMENT" ? "Instruksi" : "Pengumuman"}
                                    </span>
                                </div>
                            </div>
                             <div className="flex items-center gap-1 group/item">
                                {item.comments.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100/50">
                                        <MessageSquare size={12} />
                                        <span className="text-[10px] font-black">{item.comments.length}</span>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`${routePrefix}/edit/${item.id}`);
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-500 active:scale-90 transition-all"
                                        title="Edit"
                                    >
                                        <Edit3 size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingId(item.id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 active:scale-90 transition-all"
                                        title="Hapus"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="p-2 border-none bg-transparent active:bg-slate-100 rounded-full outline-none" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical size={18} className="text-slate-300 group-hover/item:text-slate-400" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[50]">
                                            <DropdownMenuItem 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopySpecificLink(item.id);
                                                }}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl active:bg-slate-50 text-slate-600 font-bold text-sm"
                                            >
                                                <LinkIcon size={16} />
                                                Salin Link
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))
                )}

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

            <button 
                onClick={() => navigate(`${routePrefix}/create`)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-brand-primary/40 active:scale-90 transition-all z-50"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl w-full max-w-sm p-8 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto">
                            <Trash2 size={28} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center tracking-tight mb-3 uppercase">Hapus Postingan?</h3>
                        <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-8">
                            Informasi ini tidak dapat dikembalikan. Mahasiswa tidak bisa lagi melihat tugas ini.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button 
                                variant="destructive"
                                onClick={handleDelete}
                                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-600 active:bg-red-700 text-white shadow-lg shadow-red-600/20"
                            >
                                Ya, Hapus Postingan
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
