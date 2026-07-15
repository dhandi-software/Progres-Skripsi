import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    ClipboardList, Send, MessageSquare, 
    Calendar as CalendarIcon, User, Plus, 
    Trash2, Edit3, MoreVertical, ArrowLeft, Users, 
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

export function AcaraDesktop({ title }: { title: string }) {
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

    // -- LOGIKA DEEP LINKING (Lecturer) --
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
                    console.error("Gagal deep link lecturer:", err);
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
                const updatedImg = `<img${p1}src="${src}"${p2}`.replace(/<img /g, '<img class="max-w-[800px] w-full h-auto max-h-[600px] mx-auto block rounded-[32px] my-12 shadow-2xl border border-slate-100 object-contain bg-slate-50/30 hover:scale-[1.01] transition-transform cursor-pointer" ');
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
            
            // Sync with list for comment count
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
            setToast({ title: "Gagal menghapus postingan.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    if (selectedAcara) {
        return (
            <div className="flex flex-col h-full w-full bg-white animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-8 px-16 py-10 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <button 
                        onClick={handleBack}
                        className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#00bcd4] hover:border-[#00bcd4] transition-all duration-300 shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-[#00bcd4] flex items-center justify-center text-white shadow-lg shadow-[#00bcd4]/20">
                        <ClipboardList size={32} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedAcara.title}</h1>
                        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                            <span className="text-sm font-bold text-slate-800">{selectedAcara.user?.role === 'admin' ? 'Admin' : (selectedAcara.user?.mahasiswa?.nama || selectedAcara.user?.dosen?.nama || selectedAcara.user?.username || selectedAcara.dosen.nama || "Sistem")}</span>
                            <span className={cn(
                                "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider leading-none",
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
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-sm text-slate-400 font-medium">
                                {format(new Date(selectedAcara.createdAt), "dd MMM yyyy", { locale: id })} 
                                {selectedAcara.updatedAt !== selectedAcara.createdAt && ` (Diedit ${format(new Date(selectedAcara.updatedAt), "dd MMM yyyy", { locale: id })})`}
                            </span>
                        </div>
                    </div>
                    <div className="relative group/menu">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-3 border-none bg-transparent hover:bg-slate-100 rounded-full transition-colors cursor-pointer outline-none">
                                <MoreVertical className="text-slate-300 group-hover/menu:text-slate-600" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[200]">
                                <DropdownMenuItem 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyLink();
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#00bcd4] transition-all font-bold text-sm"
                                >
                                    <LinkIcon size={16} />
                                    Salin Link
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-16 py-12">
                    <div className="max-w-[1000px]">
                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-800 prose-p:leading-relaxed prose-strong:text-slate-950 prose-a:text-[#00bcd4] prose-a:font-bold">
                            <div 
                                dangerouslySetInnerHTML={{ __html: transformContent(selectedAcara.content) }} 
                            />
                        </div>

                        <hr className="border-slate-100 my-16" />

                        <div className="space-y-12">
                            <div className="flex items-center gap-4">
                                <Users size={26} className="text-slate-400" />
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Komentar Kelas</h3>
                                <span className="text-sm font-bold text-slate-400">({selectedAcara.comments.length})</span>
                            </div>

                            <div className="space-y-10">
                                {selectedAcara.comments.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic font-medium ml-10">Belum ada komentar kelas.</p>
                                ) : (
                                    selectedAcara.comments.map(comment => {
                                        const displayName = comment.user.mahasiswa?.nama || comment.user.dosen?.nama || comment.user.username;
                                        const initial = displayName.charAt(0).toUpperCase();
                                        const hasPhoto = comment.user.photo && comment.user.photo !== "null" && comment.user.photo !== "undefined";
                                        return (
                                            <div key={comment.id} className="flex gap-6 group">
                                                {hasPhoto ? (
                                                    <img 
                                                        src={profileApi.getProfilePhotoUrl(comment.user.photo!)} 
                                                        alt={displayName} 
                                                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-lg border border-slate-200">
                                                        {initial}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                                        <span className="text-sm font-black text-slate-900">
                                                            {displayName}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider leading-none",
                                                            comment.user.role.toUpperCase() === "MAHASISWA" 
                                                                ? "bg-blue-50 text-blue-500 border border-blue-100/50" 
                                                                : comment.user.role.toUpperCase() === "DOSEN" || comment.user.role.toUpperCase() === "KAPRODI"
                                                                ? "bg-purple-50 text-purple-500 border border-purple-100/50"
                                                                : "bg-slate-50 text-slate-500 border border-slate-100"
                                                        )}>
                                                            {comment.user.role.toUpperCase() === "MAHASISWA" ? "Mahasiswa" : comment.user.role.toUpperCase() === "DOSEN" || comment.user.role.toUpperCase() === "KAPRODI" ? "Dosen" : "Staff"}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-400">
                                                            {format(new Date(comment.createdAt), "dd MMM, HH:mm", { locale: id })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <form onSubmit={handleAddComment} className="flex gap-6 mt-16 items-center">
                                {hasUserPhoto ? (
                                    <img 
                                        src={currentUserPhoto} 
                                        alt={myName} 
                                        className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-lg border border-slate-200 shadow-sm">
                                        {myInitial}
                                    </div>
                                )}
                                <div className="flex-1 group relative">
                                    <input 
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Tambahkan komentar kelas..."
                                        className="w-full bg-white border-b-2 border-slate-200 py-4 text-sm font-medium focus:outline-none focus:border-[#00bcd4] transition-all pr-14"
                                    />
                                    <button 
                                        type="submit"
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-slate-300 hover:text-[#00bcd4] transition-colors"
                                    >
                                        <Send size={22} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-50/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 lg:p-12">
                <div>
                     <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timeline Pengumuman & Instruksi</h1>
                     <p className="text-slate-500 text-sm mt-2 font-medium">Daftar pengumuman dan instruksi akademik untuk mahasiswa.</p>
                </div>
                <Button 
                    onClick={() => navigate(`${routePrefix}/create`)}
                    className="h-14 px-8 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-sm gap-3 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 w-full lg:w-fit"
                >
                    <Plus size={20} strokeWidth={3} />
                    Buat Pengumuman Baru
                </Button>
            </div>

            <div className="flex-1 px-8 lg:px-12 pb-12 w-full">
                <div className="grid grid-cols-1 gap-6 w-full">
                    {isLoading ? (
                        [1,2,3].map(i => (
                            <div key={i} className="h-28 bg-white/50 border border-slate-100 rounded-[32px] animate-pulse" />
                        ))
                    ) : acaras.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-100 shadow-sm">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                                 <ClipboardList size={56} />
                             </div>
                             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Belum Ada Posting Terdaftar</h3>
                             <p className="text-slate-400 mx-auto mt-4 font-medium">Pengumuman atau instruksi bimbingan yang Anda buat akan muncul di sini.</p>
                        </div>
                    ) : (
                        acaras.map(item => {
                            const publisherName = item.user?.role === 'admin' ? 'Admin' : (item.user?.mahasiswa?.nama || item.user?.dosen?.nama || item.user?.username || item.dosen?.nama || "Sistem");
                            const publisherRole = item.user?.role || "DOSEN";
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleSelectAcara(item)}
                                    className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 flex items-center justify-between gap-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-primary/10 transition-all duration-300 group cursor-pointer w-full relative overflow-hidden"
                                >
                                    <div className="absolute inset-y-0 left-0 w-2 bg-slate-50 group-hover:bg-brand-primary transition-colors duration-300" />
                                    
                                    <div className="flex items-center gap-6 flex-1 min-w-0 ml-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0 group-hover:scale-110 transition-transform duration-500">
                                            <ClipboardList size={28} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                                <span className="text-sm font-black text-slate-800 tracking-tight leading-none">
                                                    {publisherName}
                                                </span>
                                                <span className={cn(
                                                    "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider leading-none",
                                                    publisherRole.toUpperCase() === "MAHASISWA" 
                                                        ? "bg-blue-50 text-blue-500 border border-blue-100/50" 
                                                        : publisherRole.toUpperCase() === "DOSEN" || publisherRole.toUpperCase() === "KAPRODI"
                                                        ? "bg-purple-50 text-purple-500 border border-purple-100/50"
                                                        : publisherRole.toUpperCase() === "ADMIN"
                                                        ? "bg-red-50 text-red-500 border border-red-100/50"
                                                        : "bg-slate-50 text-slate-500 border border-slate-100"
                                                )}>
                                                    {publisherRole.toUpperCase() === "MAHASISWA" ? "Mahasiswa" : publisherRole.toUpperCase() === "DOSEN" || publisherRole.toUpperCase() === "KAPRODI" ? "Dosen" : publisherRole.toUpperCase() === "ADMIN" ? "Admin" : "Staff"}
                                                </span>
                                            </div>
                                            <h3 className="text-lg lg:text-xl font-black text-slate-900 truncate tracking-tight mb-1">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary/60">
                                                {item.type === "ASSIGNMENT" ? "Instruksi" : "Pengumuman"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pr-2">
                                    {item.comments.length > 0 && (
                                        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                            <MessageSquare size={14} />
                                            <span className="text-[11px] font-bold">{item.comments.length}</span>
                                        </div>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`${routePrefix}/edit/${item.id}`);
                                        }}
                                        className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                        title="Edit Postingan"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeletingId(item.id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Hapus Postingan"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="p-3 text-slate-300">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="p-3 border-none bg-transparent hover:bg-slate-50 rounded-full transition-colors cursor-pointer outline-none">
                                                <MoreVertical size={20} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-[50]">
                                                <DropdownMenuItem 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCopySpecificLink(item.id);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 hover:text-[#00bcd4] transition-all font-bold text-sm"
                                                >
                                                    <LinkIcon size={16} />
                                                    Salin Link
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>

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

            {showDeleteModal && (
                <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-[360px] w-full p-8 animate-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-6 mx-auto shadow-sm">
                            <Trash2 size={28} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center tracking-tight mb-2 uppercase">Hapus Postingan?</h3>
                        <p className="text-xs text-slate-500 text-center font-medium leading-relaxed mb-8 px-2">
                             Tindakan ini tidak dapat dibatalkan. Mahasiswa tidak bisa lagi melihat postingan ini di timeline.
                        </p>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingId(null);
                                }}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                                Batal
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex-1 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 active:scale-95"
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
