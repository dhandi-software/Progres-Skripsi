import React, { useEffect, useState } from "react";
import { 
    Plus, X, Trash2, Edit3, FileText,
    ArrowLeft, ChevronRight, Loader2, FileUp,
    AlertCircle, File as FileIcon, CheckCircle2,
    ShieldCheck, HardDrive, Eye
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui/button";
import { downloadApi } from "~/api/downloadApi";
import { UPLOADS_URL } from "~/api/client";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";

export function CreateDownloadDesktop() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);
    
    const [formData, setFormData] = useState({
        title: "",
        fileUrl: "",
        fileType: "",
        fileName: ""
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchDetail = async () => {
                try {
                    const response = await downloadApi.getDownloadById(parseInt(id));
                    setFormData({
                        title: response.title,
                        fileUrl: response.fileUrl,
                        fileType: response.fileType,
                        fileName: response.fileUrl.split('/').pop() || "Dokumen Tersimpan"
                    });
                } catch (error) {
                    setToast({ title: "Gagal memuat data materi.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetail();
        }
    }, [id, isEditMode]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        
        if (!allowedTypes.includes(file.type)) {
            setToast({ title: "Hanya file PDF atau Word yang diperbolehkan.", variant: "destructive" });
            return;
        }

        try {
            setIsUploading(true);
            const res = await downloadApi.uploadFile(file);
            setFormData(prev => ({
                ...prev,
                fileUrl: res.url,
                fileType: file.type.includes("pdf") ? "PDF" : "WORD",
                fileName: file.name
            }));
            setToast({ title: "File berhasil diunggah!", variant: "success" });
        } catch (error) {
            setToast({ title: "Gagal mengunggah file.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            setToast({ title: "Judul materi wajib diisi.", variant: "destructive" });
            return;
        }

        if (!formData.fileUrl) {
            setToast({ title: "Anda belum mengunggah file.", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                title: formData.title,
                fileUrl: formData.fileUrl,
                fileType: formData.fileType
            };

            if (isEditMode && id) {
                await downloadApi.updateDownload(parseInt(id), payload);
                setToast({ title: "Materi berhasil diperbarui!", variant: "success" });
            } else {
                await downloadApi.createDownload(payload);
                setToast({ title: "Materi berhasil ditambahkan!", variant: "success" });
            }
            
            setTimeout(() => navigate("/dosen/download"), 1200);
        } catch (error: any) {
            setToast({ 
                title: error.response?.data?.message || "Gagal menyimpan materi.", 
                variant: "destructive" 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-white items-center justify-center">
                <Loader2 size={40} className="text-brand-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-500">
            
            {/* Kolom Kiri (Sidebar Informasi) */}
            <div className="w-full md:w-[35%] bg-slate-900 text-white p-12 md:p-16 flex flex-col relative shrink-0">
                {/* Tombol Batal & Kembali */}
                <Button 
                    onClick={() => navigate("/dosen/download")}
                    className="flex items-center gap-3 bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white transition-all font-black uppercase tracking-widest text-[12px] w-fit px-10 h-14 rounded-full group shadow-2xl"
                >
                    <ArrowLeft size={20} className="text-white group-hover:-translate-x-1 transition-transform" strokeWidth={3} /> 
                    <span className="text-white">Batal & Kembali</span>
                </Button>

                {/* Konten Dinamis di Tengah */}
                <div className="flex-1 flex flex-col justify-center">
                    <div className="w-20 h-20 rounded-[32px] bg-brand-primary flex items-center justify-center mb-10 shadow-2xl shadow-brand-primary/20">
                        {isEditMode ? <Edit3 size={36} strokeWidth={2.5} /> : <Plus size={40} strokeWidth={3} />}
                    </div>
                    
                    <h2 className="text-5xl font-black leading-tight tracking-tighter uppercase mb-6">
                        {isEditMode ? "EDIT MATERI" : "TAMBAH MATERI"}
                    </h2>
                    
                    <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-[400px]">
                        {isEditMode 
                            ? "Perbarui informasi materi atau ganti file dokumen yang telah Anda publikasikan sebelumnya." 
                            : "Unggah dokumen materi kuliah, modul, atau panduan akademik baru untuk mahasiswa bimbingan Anda."
                        }
                    </p>
                </div>

                {/* Footer Sidebar (Optional Info) */}
                <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-[28px] backdrop-blur-sm">
                    <ShieldCheck size={24} className="text-brand-primary" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white">Sistem Terenkripsi</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Dokumen Anda tersimpan dengan aman di server.</p>
                    </div>
                </div>
            </div>

            {/* Kolom Kanan (Area Form) */}
            <div className="flex-1 bg-white p-12 md:p-20 relative flex flex-col justify-center overflow-y-auto custom-scrollbar">
                
                <form onSubmit={handleSubmit} className="w-full h-full flex flex-col max-w-none">
                    {/* Header Konteks */}
                    <div className="mb-16">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] block mb-2">Document Management System</span>
                        <div className="h-1 w-12 bg-slate-100 rounded-full" />
                    </div>

                    <div className="flex-1 space-y-16">
                        {/* Judul Dokumen */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 tracking-wide ml-1">Judul Dokumen</label>
                            <input 
                                required
                                value={formData.title}
                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Masukkan judul materi di sini..."
                                className="w-full bg-slate-50 border-none rounded-3xl h-20 px-8 text-2xl font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none placeholder:text-slate-200"
                            />
                        </div>

                        {/* Dropzone (PDF/Word) */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-500 tracking-wide ml-1">Unggah File (PDF/WORD)</label>
                            
                            <div className="relative group/upload">
                                <input 
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                />
                                
                                <div className={cn(
                                    "w-full min-h-[300px] border-2 border-dashed rounded-[48px] flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden",
                                    formData.fileUrl 
                                        ? "border-[#FFD9CC] bg-[#FFF8F5]" // Peach/Pastel touch
                                        : "border-slate-100 bg-slate-50 hover:border-brand-primary hover:bg-white"
                                )}>
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 size={40} className="text-brand-primary animate-spin" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memproses File...</p>
                                        </div>
                                    ) : formData.fileUrl ? (
                                        /* Status 'Berhasil' (Edit/Loaded) */
                                        <div className="flex flex-col items-center text-center p-10 animate-in zoom-in-95 duration-500">
                                            <div className="w-20 h-20 rounded-full bg-brand-primary text-white flex items-center justify-center mb-6 shadow-xl shadow-brand-primary/20">
                                                {formData.fileType === "PDF" ? <FileText size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2 truncate max-w-[80%]">{formData.fileName}</h4>
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] italic mb-6">File Berhasil Dimuat</p>
                                            
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = formData.fileUrl.startsWith('http') 
                                                        ? formData.fileUrl 
                                                        : `${UPLOADS_URL}${formData.fileUrl}`;
                                                    window.open(url, "_blank");
                                                }}
                                                className="h-10 px-6 rounded-xl border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 gap-2 relative z-30"
                                            >
                                                <Eye size={14} /> Lihat File
                                            </Button>
                                        </div>
                                    ) : (
                                        /* Status 'Kosong' (Create) */
                                        <div className="flex flex-col items-center text-center p-10">
                                            <div className="w-20 h-20 rounded-[32px] bg-white border border-slate-100 flex items-center justify-center mb-6 text-slate-200 group-hover/upload:text-brand-primary transition-colors">
                                                <FileUp size={40} />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-400 mb-2">Seret & lepas file di sini</h4>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Atau klik untuk mencari di folder perangkat</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi di Kanan Bawah */}
                    <div className="mt-20 flex justify-end pb-10 pr-10">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || isUploading || !formData.title || !formData.fileUrl}
                            className="h-16 px-14 bg-brand-primary hover:bg-slate-900 text-white rounded-[28px] font-black text-lg gap-4 shadow-2xl shadow-brand-primary/40 transition-all active:scale-95 w-fit border-none"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : isEditMode ? (
                                <>
                                    <Edit3 size={20} strokeWidth={3} />
                                    Simpan Perubahan
                                </>
                            ) : (
                                <>
                                    <Plus size={20} strokeWidth={3} />
                                    Unggah Materi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {toast && (
                <div className="fixed top-12 right-12 z-[300] animate-in slide-in-from-top-12 duration-500">
                    <Toast title={toast.title} variant={toast.variant} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    );
}
