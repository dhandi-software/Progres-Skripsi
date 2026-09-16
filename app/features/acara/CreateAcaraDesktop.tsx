import React from "react";
import { 
    Plus, X, Trash2, Edit3, Bold, Italic, Underline, 
    List, ListOrdered, AlignLeft, 
    AlignCenter, AlignRight, Image as ImageIcon, FileText,
    Undo2, Redo2, Strikethrough, ArrowLeft, ChevronRight,
    Indent, Outdent, ChevronDown, Megaphone, BookOpen
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Toast } from "~/components/ui/toast";
import { useCreateAcara } from "~/hooks/useCreateAcara";



export function CreateAcaraDesktop() {
    const {
        navigate,
        id,
        isEditMode,
        routePrefix,
        isUploading,
        toast,
        setToast,
        selectedElement,
        isLoading,
        isTypeDropdownOpen,
        setIsTypeDropdownOpen,
        dropdownRef,
        editorRef,
        mediaInputRef,
        docInputRef,
        formData,
        setFormData,
        activeStyles,
        formatText,
        updateActiveStyles,
        handleEditorFocus,
        handleEditorClick,
        removeSelectedElement,
        handleFileUpload,
        handleSubmit,
    } = useCreateAcara();


    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-white items-center justify-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center animate-in fade-in duration-300">
            <div className="w-full h-full bg-white flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                {/* Decorative Sidebar */}
                <div className="w-full md:w-[30%] bg-slate-900 text-white relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
                    
                    <div className="relative z-10 h-full p-12 overflow-y-auto custom-scrollbar flex flex-col justify-between">
                        <button 
                            onClick={() => navigate(routePrefix)}
                            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] mb-12"
                        >
                            <ArrowLeft size={16} /> Batal & Kembali
                        </button>

                        <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center mb-8 shadow-2xl shadow-brand-primary/40">
                            {isEditMode ? <Edit3 size={32} strokeWidth={3} /> : <Plus size={32} strokeWidth={3} />}
                        </div>
                        <h2 className="text-4xl font-black leading-tight tracking-tight uppercase italic mb-6">
                            {isEditMode ? "Edit Postingan" : "Buat Pengumuman Baru"}
                        </h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                            {isEditMode ? "Perbarui informasi atau instruksi bimbingan Anda." : "Berikan instruksi yang jelas kepada mahasiswa untuk mempermudah bimbingan Anda."}
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">1</div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Pengumuman & Instruksi
                        </p>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-black">2</div>
                                <p className="text-sm font-bold text-slate-300 italic">Tulis Detail Instruksi</p>
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
                            onClick={() => navigate(routePrefix)} 
                            className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
                        >
                            <X size={28} className="text-slate-300 hover:text-slate-600" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 max-w-full">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between ml-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic">Judul Posting</label>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider transition-all border",
                                        formData.title.length >= 140
                                            ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-sm"
                                            : formData.title.length >= 100
                                            ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        {formData.title.length} / 150 Karakter
                                    </span>
                                </div>
                                <input 
                                    required
                                    maxLength={150}
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="Cth: Review Bab 1 - Latar Belakang"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] h-16 px-8 text-lg font-black focus:bg-white focus:border-brand-primary transition-all outline-none shadow-sm"
                                />
                                <p className="text-[11px] text-slate-400 font-medium ml-4">
                                    Sisa: <span className={cn("font-bold", 150 - formData.title.length <= 10 ? "text-rose-500" : "text-slate-600")}>{150 - formData.title.length} Karakter</span>
                                </p>
                            </div>
                            <div className="space-y-3 relative" ref={dropdownRef}>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic ml-2">Tipe Postingan</label>
                                
                                {/* Tombol Trigger Dropdown Custom */}
                                <div 
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] h-16 px-8 flex items-center justify-between cursor-pointer hover:border-brand-primary/30 hover:bg-white transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl">
                                            {formData.type === "ANNOUNCEMENT" ? <Megaphone size={20} /> : <BookOpen size={20} />}
                                        </div>
                                        <span className="text-lg font-black text-slate-900">
                                            {formData.type === "ANNOUNCEMENT" ? "ANNOUNCEMENT / PENGUMUMAN" : "INSTRUKSI / BERITA ACARA"}
                                        </span>
                                    </div>
                                    <ChevronDown 
                                        size={24} 
                                        className={cn("text-slate-300 transition-transform duration-300", isTypeDropdownOpen && "rotate-180 text-brand-primary")} 
                                    />
                                </div>

                                {/* Menu Pilihan (Floating) */}
                                {isTypeDropdownOpen && (
                                    <div className="absolute top-[calc(100%+10px)] left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-3 space-y-2">
                                            <div 
                                                onClick={() => {
                                                    setFormData({...formData, type: "ANNOUNCEMENT"});
                                                    setIsTypeDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                                                    formData.type === "ANNOUNCEMENT" ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "hover:bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", formData.type === "ANNOUNCEMENT" ? "bg-white/20" : "bg-slate-100 text-brand-primary")}>
                                                    <Megaphone size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase italic">📢 Pengumuman</span>
                                                    <span className={cn("text-[10px] font-bold opacity-60", formData.type === "ANNOUNCEMENT" ? "text-white" : "text-slate-400")}>
                                                        Informasi umum, berita, atau pengingat jadwal bimbingan.
                                                    </span>
                                                </div>
                                            </div>

                                            <div 
                                                onClick={() => {
                                                    setFormData({...formData, type: "ASSIGNMENT"});
                                                    setIsTypeDropdownOpen(false);
                                                }}
                                                className={cn(
                                                    "flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all",
                                                    formData.type === "ASSIGNMENT" ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "hover:bg-slate-50 text-slate-600"
                                                )}
                                            >
                                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl", formData.type === "ASSIGNMENT" ? "bg-white/20" : "bg-slate-100 text-brand-primary")}>
                                                    <BookOpen size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase italic">📚 Instruksi / Berita Acara</span>
                                                    <span className={cn("text-[10px] font-bold opacity-60", formData.type === "ASSIGNMENT" ? "text-white" : "text-slate-400")}>
                                                        Catatan penting bimbingan atau instruksi teknis pengerjaan.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] italic ml-2">Detail Pengumuman & Instruksi</label>
                            
                            {/* Rich Text Editor Container */}
                            <div className="border-2 border-slate-100 rounded-[40px] overflow-hidden focus-within:border-brand-primary transition-all group shadow-sm">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-2 p-5 bg-slate-50 border-b-2 border-slate-100 transition-colors group-focus-within:bg-white overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                        <button type="button" onClick={() => formatText("undo")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Undo2 size={18} /></button>
                                        <button type="button" onClick={() => formatText("redo")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all"><Redo2 size={18} /></button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("bold")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.bold ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <Bold size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("italic")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.italic ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <Italic size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("underline")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.underline ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <Underline size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("strikeThrough")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.strikeThrough ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <Strikethrough size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("insertUnorderedList")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.insertUnorderedList ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                            title="Bullet List"
                                        >
                                            <List size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("insertOrderedList")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.insertOrderedList ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                            title="Numbered List"
                                        >
                                            <ListOrdered size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                        <button type="button" onClick={() => formatText("outdent")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Kurangi Indentasi"><Outdent size={18} /></button>
                                        <button type="button" onClick={() => formatText("indent")} className="p-2.5 rounded-xl hover:bg-slate-200 text-slate-500 transition-all" title="Tambah Indentasi (Geser)"><Indent size={18} /></button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r-2 border-slate-200 pr-2">
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("justifyLeft")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.justifyLeft ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <AlignLeft size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("justifyCenter")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.justifyCenter ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <AlignCenter size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("justifyRight")} 
                                            className={cn("p-2.5 rounded-xl transition-all", activeStyles.justifyRight ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "hover:bg-slate-200 text-slate-500")}
                                        >
                                            <AlignRight size={18} />
                                        </button>
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
                                    onKeyUp={updateActiveStyles}
                                    onMouseUp={updateActiveStyles}
                                    onInput={updateActiveStyles}
                                    className="p-8 max-h-[500px] min-h-[400px] overflow-y-auto outline-none text-slate-700 bg-white leading-relaxed prose prose-slate max-w-none prose-img:rounded-3xl prose-img:shadow-xl prose-a:text-brand-primary content-editor custom-scrollbar"
                                    data-placeholder="Tulis instruksi lengkap atau berita acara di sini..."
                                />
                                
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
                                {isEditMode ? "SIMPAN PERUBAHAN" : "PUBLISH KE TIMELINE"}
                                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

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
