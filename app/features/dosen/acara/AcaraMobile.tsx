import React, { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { 
    ClipboardList, Send, MessageSquare, 
    ArrowLeft, Plus, X, Trash2, Edit3, 
    Calendar as CalendarIcon, CheckCircle2, Info, ChevronRight,
    Bold, Italic, Underline, List, ListOrdered, AlignLeft, 
    AlignCenter, AlignRight, Image as ImageIcon, FileText,
    Undo2, Redo2, Strikethrough, Users, ChevronDown,
    Indent, Outdent
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { acaraApi } from "~/api/acaraApi";
import type { Acara } from "~/api/acaraApi";
import { UPLOADS_URL } from "~/api/client";
import { Toast } from "~/components/ui/toast";

export function AcaraMobile({ title }: { title: string }) {
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

    // Fungsi untuk memformat teks (Bold, Italic, dll) di editor mobile
    const formatText = (command: string, value: string = "") => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
        }
    };

    // Memastikan baris baru menggunakan tag <p> untuk struktur yang benar
    const handleEditorFocus = () => {
        if (editorRef.current) {
            document.execCommand("defaultParagraphSeparator", false, "p");
        }
    };

    // Deteksi klik pada gambar untuk memberikan highlight pilihan hapus
    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG") {
            if (selectedElement) selectedElement.style.outline = "none";
            setSelectedElement(target);
            target.style.outline = "4px solid #00bcd4"; // Warna biru sian
            target.style.outlineOffset = "2px";
        } else {
            if (selectedElement) selectedElement.style.outline = "none";
            setSelectedElement(null);
        }
    };

    // Menghapus gambar/elemen yang sedang dipilih
    const removeSelectedElement = () => {
        if (selectedElement) {
            selectedElement.remove();
            setSelectedElement(null);
        }
    };

    // Mengunggah gambar/dokumen dan memasukkannya ke editor mobile
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
                    // Rasio memanjang (landscape) dengan aspect-video
                    const img = `<img src="${absoluteUrl}" alt="${res.originalName}" class="w-full aspect-video object-cover rounded-2xl my-4 shadow-lg cursor-pointer" />`;
                    document.execCommand("insertHTML", false, img);
                } else {
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

    // Menangani pengiriman form (Buat baru atau Update) di Mobile
    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        const content = editorRef.current?.innerHTML || "";
        try {
            if (editingAcara) {
                await acaraApi.updateAcara(editingAcara.id, { ...formData, content });
                setToast({ title: "Berhasil diperbarui!", variant: "success" });
            } else {
                await acaraApi.createAcara({ ...formData, content });
                setToast({ title: "Berhasil dipublish!", variant: "success" });
            }
            setIsCreating(false);
            setEditingAcara(null);
            setFormData({ title: "", content: "", type: "ASSIGNMENT" });
            fetchData();
        } catch (error) {
            setToast({ title: "Gagal menyimpan.", variant: "destructive" });
        }
    };

    // Fungsi untuk memicu mode Edit di Mobile
    const startEdit = (e: React.MouseEvent, item: Acara) => {
        e.stopPropagation();
        setEditingAcara(item);
        setFormData({
            title: item.title,
            content: item.content,
            type: item.type
        });
        setIsCreating(true);
    };

    // Mengisi konten editor saat masuk mode edit mobile
    useEffect(() => {
        if (isCreating && editingAcara && editorRef.current) {
            editorRef.current.innerHTML = editingAcara.content;
        }
    }, [isCreating, editingAcara]);

    // Transformasi path gambar menjadi absolut & memaksa rasio memanjang di mobile
    const transformContent = (content: string) => {
        if (!content) return "";
        const baseUploads = UPLOADS_URL.replace(/\/$/, "");
        return content
            .replace(/src="\/uploads\//g, `src="${baseUploads}/uploads/`)
            .replace(/href="\/uploads\//g, `href="${baseUploads}/uploads/`)
            .replace(/<img /g, '<img class="w-full aspect-video object-cover rounded-2xl my-8 shadow-lg border border-slate-100" ');
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAcara || !newComment.trim()) return;
        try {
            const comment = await acaraApi.addComment(selectedAcara.id, newComment);
            
            // Perbarui data acara terpilih agar komentar baru langsung muncul
            const updatedAcara = {
                ...selectedAcara,
                comments: [...selectedAcara.comments, comment]
            };
            setSelectedAcara(updatedAcara);
            setNewComment("");

            // Sinkronkan daftar utama agar jumlah komentarnya bertambah (tanpa reload)
            setAcaras(prev => prev.map(item => 
                item.id === selectedAcara.id ? updatedAcara : item
            ));
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
            setToast({ title: "Gagal menghapus.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    if (selectedAcara) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
                {/* Header Navbar */}
                {/* Header Navbar - Style Google Classroom Mobile */}
                <div className="flex items-center gap-4 px-6 h-20 border-b border-slate-100 shrink-0">
                    <button 
                        onClick={() => setSelectedAcara(null)}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[#00bcd4] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#00bcd4]/20">
                        <ClipboardList size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-slate-900 truncate tracking-tight">{selectedAcara.title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                            {selectedAcara.dosen.nama} • {format(new Date(selectedAcara.createdAt), "dd MMM", { locale: id })}
                        </p>
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

                {/* Content Scrollable */}
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
                                selectedAcara.comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-black text-xs border border-slate-200">
                                            {comment.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[11px] font-black text-slate-900 truncate">
                                                    {comment.user.mahasiswa?.nama || comment.user.dosen?.nama || comment.user.username}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-300">{format(new Date(comment.createdAt), "HH:mm", { locale: id })}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Comment Input - Elegant Classroom Style */}
                <div className="fixed bottom-14 left-6 right-6 z-[150] animate-in fade-in slide-in-from-bottom duration-700">
                    <form 
                        onSubmit={handleAddComment} 
                        className="flex gap-3 items-center bg-white/95 backdrop-blur-md border border-slate-200/50 p-2.5 pl-3 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.03] max-w-[500px] mx-auto"
                    >
                        <div className="w-9 h-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 font-black text-xs border border-brand-primary/20 shadow-inner">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
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
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Daftar postingan bimbingan & assignment.</p>
            </div>

            <div className="flex-1 px-8 space-y-4">
                {isLoading ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-slate-50 rounded-[24px] animate-pulse" />)
                ) : acaras.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                            <ClipboardList size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Belum ada postingan.</p>
                    </div>
                ) : (
                    acaras.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedAcara(item)}
                            className="bg-white border border-slate-100 rounded-[28px] p-5 flex items-center gap-4 active:scale-95 transition-all shadow-sm group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#00bcd4]/10 flex items-center justify-center text-[#00bcd4] shrink-0">
                                <ClipboardList size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 truncate mb-0.5">{item.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">{format(new Date(item.createdAt), "dd MMM", { locale: id })}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-bold text-[#00bcd4]/60 uppercase">
                                        {item.type === "ASSIGNMENT" ? "Berita Acara" : "Pengumuman"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {item.comments.length > 0 && (
                                    <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100/50">
                                        <MessageSquare size={12} />
                                        <span className="text-[10px] font-black">{item.comments.length}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => startEdit(e, item)}
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
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button 
                onClick={() => setIsCreating(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-brand-primary text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-brand-primary/40 active:scale-90 transition-all z-50"
            >
                <Plus size={28} strokeWidth={3} />
            </button>

            {isCreating && (
                <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
                    <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 shrink-0">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingAcara(null);
                                    setFormData({ title: "", content: "", type: "ASSIGNMENT" });
                                }} 
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all font-geist"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-lg font-black text-slate-900 leading-none">
                                    {editingAcara ? "Edit Postingan" : "Posting Baru"}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Berita Acara & Instruksi
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={handleSubmit}
                            className="h-10 px-6 bg-brand-primary rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 active:scale-95"
                        >
                            Publish
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Posting</label>
                                <input 
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Cth: Review Bab 1"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-16 px-6 text-base font-black focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe & Detail</label>
                                
                                {/* Rich Text Editor Container Mobile */}
                                <div className="border-2 border-slate-100 rounded-[32px] overflow-hidden focus-within:border-brand-primary transition-all group bg-slate-50">
                                    {/* Toolbar Mobile */}
                                    <div className="flex items-center gap-1 p-3 bg-white border-b-2 border-slate-100 overflow-x-auto no-scrollbar">
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><Bold size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><Italic size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><Underline size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("insertUnorderedList"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><List size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("insertOrderedList"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><ListOrdered size={16} /></button>
                                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("outdent"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><Outdent size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); formatText("indent"); }} className="p-2 rounded-xl active:bg-slate-100 text-slate-500"><Indent size={16} /></button>
                                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); mediaInputRef.current?.click(); }} className="p-2 rounded-xl active:bg-slate-100 text-brand-primary"><ImageIcon size={16} /></button>
                                        <button type="button" onMouseDown={(e) => { e.preventDefault(); docInputRef.current?.click(); }} className="p-2 rounded-xl active:bg-slate-100 text-blue-500"><FileText size={16} /></button>
                                        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                        <button 
                                            type="button" 
                                            onClick={removeSelectedElement} 
                                            disabled={!selectedElement}
                                            className={cn(
                                                "p-2 rounded-xl active:bg-red-50",
                                                selectedElement ? "text-red-500" : "text-slate-200"
                                            )}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* ContentEditable Editor Mobile */}
                                    <div 
                                        ref={editorRef}
                                        contentEditable
                                        onFocus={handleEditorFocus}
                                        onClick={handleEditorClick}
                                        className="p-6 min-h-[300px] outline-none text-slate-700 text-base leading-relaxed prose prose-slate max-w-none prose-img:rounded-2xl content-editor"
                                        data-placeholder="Tulis instruksi di sini..."
                                    />
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
                                {isUploading && <p className="text-[10px] font-black text-brand-primary animate-pulse py-2">Mengunggah file...</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal Mobile */}
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

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-24 left-6 right-6 z-[300]">
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
