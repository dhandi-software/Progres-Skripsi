import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    ClipboardList, Send, MessageSquare, 
    Calendar as CalendarIcon, User, Plus, 
    X, Trash2, Edit3, ChevronRight, 
    Info, Bold, Italic, Underline, 
    List, ListOrdered, AlignLeft, 
    AlignCenter, AlignRight, Image as ImageIcon, FileText,
    Undo2, Redo2, Strikethrough, MoreVertical, ArrowLeft, CheckCircle2, Users, ChevronDown,
    Indent, Outdent
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { acaraApi } from "~/api/acaraApi";
import type { Acara } from "~/api/acaraApi";
import { UPLOADS_URL } from "~/api/client";
import { Toast } from "~/components/ui/toast";

export function AcaraDesktop({ title }: { title: string }) {
    const { user } = useAuth();
    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAcara, setSelectedAcara] = useState<Acara | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingAcara, setEditingAcara] = useState<Acara | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    
    // Editor State
    const editorRef = useRef<HTMLDivElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "ASSIGNMENT"
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await acaraApi.getAcara();
            setAcaras(data);
        } catch (error) {
            console.error("Fetch Acara Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Fungsi untuk melakukan formatting teks (Bold, Italic, dll) di dalam editor contentEditable
    const formatText = (command: string, value: string = "") => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
        }
    };

    // Memastikan baris baru di editor menggunakan tag <p> (paragraf) bukan <div>
    const handleEditorFocus = () => {
        if (editorRef.current) {
            document.execCommand("defaultParagraphSeparator", false, "p");
        }
    };

    // Menangani klik pada editor untuk mendeteksi pilihan gambar/media
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG") {
            // Hapus highlight dari elemen sebelumnya jika ada
            if (selectedElement) selectedElement.style.outline = "none";
            
            setSelectedElement(target);
            // Beri highlight warna biru/biru sian pada gambar yang dipilih
            target.style.outline = "4px solid #00bcd4"; 
            target.style.outlineOffset = "4px";
        } else {
            if (selectedElement) selectedElement.style.outline = "none";
            setSelectedElement(null);
        }
    };

    // Fungsi untuk menghapus elemen (gambar) yang sedang dipilih dari editor
    const removeSelectedElement = () => {
        if (selectedElement) {
            selectedElement.remove();
            setSelectedElement(null);
        }
    };

    // Mengunggah file (gambar/dokumen) dan memasukkannya ke dalam editor sebagai HTML
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'DOC') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const res = await acaraApi.uploadFile(file);
            const absoluteUrl = `${UPLOADS_URL.replace(/\/$/, '')}${res.url}`;
            
            if (editorRef.current) {
                editorRef.current.focus();
                if (type === 'IMAGE') {
                    // Menyisipkan gambar dengan rasio memanjang (landscape) menggunakan aspect-video
                    const img = `<img src="${absoluteUrl}" alt="${res.originalName}" class="w-full aspect-video object-cover rounded-2xl my-8 shadow-xl transition-all cursor-pointer" />`;
                    document.execCommand("insertHTML", false, img);
                } else {
                    // Menyisipkan link dokumen dengan styling tombol yang bersih
                    const link = `<a href="${absoluteUrl}" target="_blank" class="inline-flex items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[#00bcd4] font-bold no-underline my-2 hover:bg-slate-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ${res.originalName}
                    </a>`;
                    document.execCommand("insertHTML", false, link);
                }
            }
        } catch (error) {
            alert("Gagal mengunggah file.");
        } finally {
            setIsUploading(false);
            if (mediaInputRef.current) mediaInputRef.current.value = "";
            if (docInputRef.current) docInputRef.current.value = "";
        }
    };

    // Menangani aksi pengiriman form (Buat baru atau Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = editorRef.current?.innerHTML || "";
        try {
            if (editingAcara) {
                // Mode Edit: Update data yang sudah ada
                await acaraApi.updateAcara(editingAcara.id, { ...formData, content });
                setToast({ title: "Berhasil memperbarui postingan!", variant: "success" });
            } else {
                // Mode Buat Baru
                await acaraApi.createAcara({ ...formData, content });
                setToast({ title: "Berhasil mempublish postingan ke timeline!", variant: "success" });
            }
            setIsCreating(false);
            setEditingAcara(null);
            setFormData({ title: "", content: "", type: "ASSIGNMENT" });
            fetchData();
        } catch (error) {
            setToast({ title: "Gagal menyimpan postingan.", variant: "destructive" });
        }
    };

    // Fungsi untuk memicu mode Edit
    const startEdit = (e: React.MouseEvent, item: Acara) => {
        e.stopPropagation(); // Mencegah terbukanya tampilan detail
        setEditingAcara(item);
        setFormData({
            title: item.title,
            content: item.content,
            type: item.type
        });
        setIsCreating(true);
        // Konten editor diisi setelah modal terbuka di dalam useEffect atau saat terbuka
    };

    // Mengisi konten editor saat masuk mode edit
    useEffect(() => {
        if (isCreating && editingAcara && editorRef.current) {
            editorRef.current.innerHTML = editingAcara.content;
        }
    }, [isCreating, editingAcara]);

    // Transformasi konten HTML agar path gambar menggunakan URL absolut dan memiliki rasio landscape
    const transformContent = (content: string) => {
        if (!content) return "";
        const baseUploads = UPLOADS_URL.replace(/\/$/, "");
        return content
            .replace(/src="\/uploads\//g, `src="${baseUploads}/uploads/`)
            .replace(/href="\/uploads\//g, `href="${baseUploads}/uploads/`)
            // Memastikan gambar yang sudah ada juga mendapatkan rasio memanjang (landscape)
            .replace(/<img /g, '<img class="max-w-[800px] mx-auto block aspect-video object-cover rounded-[32px] my-12 shadow-2xl border border-slate-100" ');
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAcara || !newComment.trim()) return;
        try {
            const comment = await acaraApi.addComment(selectedAcara.id, newComment);
            setSelectedAcara({
                ...selectedAcara,
                comments: [...selectedAcara.comments, comment]
            });
            setNewComment("");
        } catch (error) {
            alert("Gagal menambah komentar.");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await acaraApi.deleteAcara(deletingId);
            if (selectedAcara?.id === deletingId) setSelectedAcara(null);
            setToast({ title: "Postingan berhasil dihapus!", variant: "success" });
            fetchData();
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
                {/* Header Detail - Mengikuti gaya Google Classroom dengan ikon sirkular dan judul besar */}
                <div className="flex items-center gap-8 px-16 py-10 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <button 
                        onClick={() => setSelectedAcara(null)}
                        className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#00bcd4] hover:border-[#00bcd4] transition-all duration-300 shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-16 h-16 rounded-full bg-[#00bcd4] flex items-center justify-center text-white shadow-lg shadow-[#00bcd4]/20">
                        <ClipboardList size={32} />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedAcara.title}</h1>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm font-bold text-slate-500">{selectedAcara.dosen.nama}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <span className="text-sm text-slate-400 font-medium">
                                {format(new Date(selectedAcara.createdAt), "dd MMM yyyy", { locale: id })} 
                                {selectedAcara.updatedAt !== selectedAcara.createdAt && ` (Diedit ${format(new Date(selectedAcara.updatedAt), "dd MMM yyyy", { locale: id })})`}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <MoreVertical className="text-slate-300 ml-auto cursor-pointer hover:text-slate-600 transition-colors" />
                    </div>
                </div>

                {/* Area Konten Detail */}
                <div className="flex-1 overflow-y-auto px-16 py-12">
                    <div className="max-w-[1000px]">
                        {/* Konten Utama - Menggunakan prose untuk styling HTML dari editor */}

                        {/* Konten Utama - Menggunakan prose untuk styling HTML dari editor */}
                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-800 prose-p:leading-relaxed prose-strong:text-slate-950 prose-a:text-[#00bcd4] prose-a:font-bold">
                            <div 
                                dangerouslySetInnerHTML={{ __html: transformContent(selectedAcara.content) }} 
                            />
                        </div>

                        {/* Garis Pembatas Paragraf/Bagian Bagian */}
                        <hr className="border-slate-100 my-16" />

                        {/* Bagian Komentar Kelas */}
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
                                    selectedAcara.comments.map(comment => (
                                        <div key={comment.id} className="flex gap-6 group">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-lg border border-slate-200">
                                                {comment.user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1.5">
                                                    <span className="text-sm font-black text-slate-900">
                                                    {comment.user.mahasiswa?.nama || comment.user.dosen?.nama || comment.user.username}
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
                                    ))
                                )}
                            </div>

                            {/* Form Tambah Komentar - Input border-bottom yang elegan */}
                            <form onSubmit={handleAddComment} className="flex gap-6 mt-16 items-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-lg border border-slate-200 shadow-sm">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
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
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 lg:p-12">
                <div>
                     <h1 className="text-3xl font-black text-slate-900 tracking-tight">Timeline Kegiatan & Berita Acara</h1>
                     <p className="text-slate-500 text-sm mt-2 font-medium">Daftar assignment, postingan, dan instruksi akademik untuk mahasiswa.</p>
                </div>
                <Button 
                    onClick={() => setIsCreating(true)}
                    className="h-14 px-8 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-sm gap-3 shadow-xl shadow-brand-primary/20 transition-all active:scale-95 w-full lg:w-fit"
                >
                    <Plus size={20} strokeWidth={3} />
                    Buat Berita Acara Baru
                </Button>
            </div>

            {/* Main Content Area */}
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
                             <p className="text-slate-400 mx-auto mt-4 font-medium">Berita acara, assignment, atau pengumuman yang Anda buat akan muncul di sini.</p>
                        </div>
                    ) : (
                        acaras.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedAcara(item)}
                                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 flex items-center justify-between gap-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-brand-primary/10 transition-all duration-300 group cursor-pointer w-full relative overflow-hidden"
                            >
                                {/* Group Backdrop (Google Classroom look) */}
                                <div className="absolute inset-y-0 left-0 w-2 bg-slate-50 group-hover:bg-brand-primary transition-colors duration-300" />
                                
                                <div className="flex items-center gap-6 flex-1 min-w-0 ml-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0 group-hover:scale-110 transition-transform duration-500">
                                        <ClipboardList size={28} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <h3 className="text-lg lg:text-xl font-black text-slate-900 truncate tracking-tight mb-1">
                                            {item.dosen.nama} memposting tugas baru: {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-400">
                                                {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary/60">
                                                {item.type === "ASSIGNMENT" ? "Berita Acara" : "Pengumuman"}
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
                                        onClick={(e) => startEdit(e, item)}
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
                                        <MoreVertical size={20} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[8px] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full h-full bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                        {/* Decorative Sidebar */}
                        <div className="w-full md:w-[30%] bg-slate-900 p-12 text-white relative flex flex-col justify-between overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
                            
                            <div className="relative z-10">
                                <button 
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingAcara(null);
                                        setFormData({ title: "", content: "", type: "ASSIGNMENT" });
                                    }}
                                    className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] mb-12"
                                >
                                    <ArrowLeft size={16} /> Batal & Kembali
                                </button>

                                <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center mb-8 shadow-2xl shadow-brand-primary/40">
                                    {editingAcara ? <Edit3 size={32} strokeWidth={3} /> : <Plus size={32} strokeWidth={3} />}
                                </div>
                                <h2 className="text-4xl font-black leading-tight tracking-tight uppercase italic mb-6">
                                    {editingAcara ? "Edit Postingan" : "Buat Posting Baru"}
                                </h2>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                                    {editingAcara ? "Perbarui informasi atau instruksi bimbingan Anda." : "Berikan instruksi yang jelas kepada mahasiswa untuk mempermudah bimbingan Anda."}
                                </p>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">1</div>
                                        <p className="text-sm font-bold text-slate-300 italic">Tentukan Judul & Tipe</p>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">2</div>
                                        <p className="text-sm font-bold text-slate-300 italic">Tulis Detail Berita Acara</p>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">3</div>
                                        <p className="text-sm font-bold text-slate-300 italic">Publish ke Timeline</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Editor Postingan Pintar v1.0</span>
                                <button 
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingAcara(null);
                                        setFormData({ title: "", content: "", type: "ASSIGNMENT" });
                                    }} 
                                    className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                                >
                                    <X size={28} className="text-slate-300 hover:text-slate-600" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10 max-w-full">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic ml-2">Judul Posting</label>
                                        <input 
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            placeholder="Cth: Review Bab 1 - Latar Belakang"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] h-16 px-8 text-lg font-black focus:bg-white focus:border-brand-primary transition-all outline-none shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic ml-2">Tipe Postingan</label>
                                        <select 
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] h-16 px-8 text-lg font-black focus:bg-white focus:border-brand-primary transition-all outline-none appearance-none shadow-sm"
                                        >
                                            <option value="ASSIGNMENT">📚 ASSIGNMENT / TUGAS</option>
                                            <option value="ANNOUNCEMENT">📢 PENGUMUMAN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic ml-2">Detail Berita Acara & Instruksi</label>
                                    
                                    {/* Rich Text Editor Container */}
                                    <div className="border-2 border-slate-100 rounded-[40px] overflow-hidden focus-within:border-brand-primary transition-all group shadow-sm">
                                        {/* Toolbar */}
                                        <div className="flex flex-wrap items-center gap-2 p-5 bg-slate-50 border-b-2 border-slate-100 transition-colors group-focus-within:bg-white overflow-x-auto no-scrollbar">
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button type="button" onClick={() => formatText("undo")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Undo2 size={18} /></button>
                                                <button type="button" onClick={() => formatText("redo")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Redo2 size={18} /></button>
                                            </div>
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button type="button" onClick={() => formatText("bold")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Bold size={18} /></button>
                                                <button type="button" onClick={() => formatText("italic")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Italic size={18} /></button>
                                                <button type="button" onClick={() => formatText("underline")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Underline size={18} /></button>
                                                <button type="button" onClick={() => formatText("strikeThrough")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Strikethrough size={18} /></button>
                                            </div>
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button type="button" onClick={() => formatText("insertUnorderedList")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Bullet List"><List size={18} /></button>
                                                <button type="button" onClick={() => formatText("insertOrderedList")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Numbered List"><ListOrdered size={18} /></button>
                                            </div>
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button type="button" onClick={() => formatText("outdent")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Kurangi Indentasi"><Outdent size={18} /></button>
                                                <button type="button" onClick={() => formatText("indent")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Tambah Indentasi (Geser)"><Indent size={18} /></button>
                                            </div>
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button type="button" onClick={() => formatText("justifyLeft")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><AlignLeft size={18} /></button>
                                                <button type="button" onClick={() => formatText("justifyCenter")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><AlignCenter size={18} /></button>
                                                <button type="button" onClick={() => formatText("justifyRight")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><AlignRight size={18} /></button>
                                            </div>
                                            <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                                <button 
                                                    type="button" 
                                                    onClick={removeSelectedElement} 
                                                    disabled={!selectedElement}
                                                    className={cn(
                                                        "p-2.5 rounded-xl transition-all",
                                                        selectedElement ? "bg-red-50 text-red-500 hover:bg-red-100" : "text-slate-300 cursor-not-allowed"
                                                    )}
                                                    title="Hapus Media Terpilih"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    type="button" 
                                                    onClick={() => mediaInputRef.current?.click()} 
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                                >
                                                    <ImageIcon size={14} className="text-[#00bcd4]" /> Media
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => docInputRef.current?.click()} 
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                                >
                                                    <FileText size={14} className="text-blue-500" /> Dokumen
                                                </button>
                                            </div>
                                        </div>

                                        {/* ContentEditable Editor */}
                                        <div 
                                            ref={editorRef}
                                            contentEditable
                                            onFocus={handleEditorFocus}
                                            onClick={handleEditorClick}
                                            className="p-8 max-h-[500px] min-h-[400px] overflow-y-auto outline-none text-slate-700 bg-white leading-relaxed prose prose-slate max-w-none prose-img:rounded-3xl prose-img:shadow-xl prose-a:text-brand-primary content-editor custom-scrollbar"
                                            data-placeholder="Tulis instruksi lengkap atau berita acara di sini..."
                                        />
                                        
                                        {/* CSS to handle placeholder */}
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            [contenteditable]:empty:before {
                                                content: attr(data-placeholder);
                                                color: #94a3b8;
                                                pointer-events: none;
                                                font-weight: 500;
                                            }
                                        `}} />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={mediaInputRef} 
                                        className="hidden" 
                                        accept=".jpg,.jpeg,.png"
                                        onChange={(e) => handleFileUpload(e, 'IMAGE')} 
                                    />
                                    <input 
                                        type="file" 
                                        ref={docInputRef} 
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => handleFileUpload(e, 'DOC')} 
                                    />
                                    {isUploading && (
                                        <div className="flex items-center gap-3 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 animate-pulse">
                                            <div className="w-2 h-2 rounded-full bg-brand-primary" />
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Sedang mengunggah file ke server...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button 
                                        type="submit" 
                                        className="h-14 px-10 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-primary/20 transition-all active:scale-95 group uppercase tracking-widest"
                                    >
                                        {editingAcara ? "SIMPAN PERUBAHAN" : "PUBLISH KE TIMELINE"}
                                        <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-10 right-10 z-[200]">
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
