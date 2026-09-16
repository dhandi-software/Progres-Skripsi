import React from "react";
import { ArrowLeft, Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon, FileText, Trash2, Outdent, Indent, ChevronDown, Megaphone, BookOpen } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Toast } from "~/components/ui/toast";
import { useCreateAcara } from "~/hooks/useCreateAcara";


export function CreateAcaraMobile() {
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
                <div className="w-10 h-10 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(routePrefix)} 
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all font-geist"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-none">
                            {isEditMode ? "Edit Postingan" : "Posting Baru"}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Pengumuman & Instruksi
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
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul Posting</label>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border",
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
                            placeholder="Cth: Review Bab 1"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-16 px-6 text-base font-black focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-400 font-medium ml-2">
                            Sisa: <span className={cn("font-bold", 150 - formData.title.length <= 10 ? "text-rose-500" : "text-slate-600")}>{150 - formData.title.length} Karakter</span>
                        </p>
                    </div>

                    {/* Selector Tipe Postingan Premium (Mobile) */}
                    <div className="space-y-3 relative" ref={dropdownRef}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Postingan</label>
                        <div 
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-16 px-6 flex items-center justify-between active:bg-white transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    {formData.type === "ANNOUNCEMENT" ? <Megaphone size={18} /> : <BookOpen size={18} />}
                                </div>
                                <span className="text-sm font-black text-slate-900 leading-none">
                                    {formData.type === "ANNOUNCEMENT" ? "Pengumuman" : "Instruksi"}
                                </span>
                            </div>
                            <ChevronDown size={20} className={cn("text-slate-300 transition-transform", isTypeDropdownOpen && "rotate-180 text-brand-primary")} />
                        </div>

                        {/* Menu Floating untuk Mobile */}
                        {isTypeDropdownOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1">
                                    <div 
                                        onClick={() => {
                                            setFormData({...formData, type: "ANNOUNCEMENT"});
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-4 rounded-2xl transition-all",
                                            formData.type === "ANNOUNCEMENT" ? "bg-brand-primary text-white" : "active:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <Megaphone size={18} />
                                        <span className="font-black text-xs uppercase italic">📢 Pengumuman</span>
                                    </div>
                                    <div 
                                        onClick={() => {
                                            setFormData({...formData, type: "ASSIGNMENT"});
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-4 rounded-2xl transition-all",
                                            formData.type === "ASSIGNMENT" ? "bg-brand-primary text-white" : "active:bg-slate-50 text-slate-600"
                                        )}
                                    >
                                        <BookOpen size={18} />
                                        <span className="font-black text-xs uppercase italic">📚 Instruksi</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe & Detail</label>
                        
                        <div className="border-2 border-slate-100 rounded-[32px] overflow-hidden focus-within:border-brand-primary transition-all group bg-slate-50">
                            <div className="flex items-center gap-1 p-3 bg-white border-b-2 border-slate-100 overflow-x-auto no-scrollbar">
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }} 
                                    className={cn("p-2 rounded-xl transition-all", activeStyles.bold ? "bg-brand-primary/10 text-brand-primary" : "active:bg-slate-100 text-slate-500")}
                                >
                                    <Bold size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }} 
                                    className={cn("p-2 rounded-xl transition-all", activeStyles.italic ? "bg-brand-primary/10 text-brand-primary" : "active:bg-slate-100 text-slate-500")}
                                >
                                    <Italic size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }} 
                                    className={cn("p-2 rounded-xl transition-all", activeStyles.underline ? "bg-brand-primary/10 text-brand-primary" : "active:bg-slate-100 text-slate-500")}
                                >
                                    <Underline size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); formatText("insertUnorderedList"); }} 
                                    className={cn("p-2 rounded-xl transition-all", activeStyles.insertUnorderedList ? "bg-brand-primary/10 text-brand-primary" : "active:bg-slate-100 text-slate-500")}
                                >
                                    <List size={16} />
                                </button>
                                <button 
                                    type="button" 
                                    onMouseDown={(e) => { e.preventDefault(); formatText("insertOrderedList"); }} 
                                    className={cn("p-2 rounded-xl transition-all", activeStyles.insertOrderedList ? "bg-brand-primary/10 text-brand-primary" : "active:bg-slate-100 text-slate-500")}
                                >
                                    <ListOrdered size={16} />
                                </button>
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

                            <div 
                                ref={editorRef}
                                contentEditable
                                onFocus={handleEditorFocus}
                                onClick={handleEditorClick}
                                onKeyUp={updateActiveStyles}
                                onMouseUp={updateActiveStyles}
                                onInput={updateActiveStyles}
                                className="p-6 min-h-[300px] outline-none text-slate-700 text-base leading-relaxed prose prose-slate max-w-none prose-img:rounded-2xl content-editor"
                                data-placeholder="Tulis pengumuman atau instruksi di sini..."
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
                        {isUploading && <p className="text-[10px] font-black text-brand-primary animate-pulse py-2">Mengunggah file...</p>}
                    </div>
                </div>
            </div>

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
