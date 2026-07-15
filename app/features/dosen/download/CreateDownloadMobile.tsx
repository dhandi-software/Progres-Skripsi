import React, { useEffect, useState } from "react";
import { 
    Plus, X, Trash2, Edit3, FileText,
    ArrowLeft, ChevronRight, Loader2, FileUp,
    AlertCircle, CheckCircle2
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { downloadApi } from "~/api/downloadApi";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";

export function CreateDownloadMobile() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const routePrefix = location.pathname.startsWith("/admin") 
        ? "/admin/download" 
        : location.pathname.startsWith("/staf")
        ? "/staf/download"
        : "/dosen/download";
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
                    setToast({ title: "Gagal memuat data.", variant: "destructive" });
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

        try {
            setIsUploading(true);
            const res = await downloadApi.uploadFile(file);
            setFormData(prev => ({
                ...prev,
                fileUrl: res.url,
                fileType: file.type.includes("pdf") ? "PDF" : "WORD",
                fileName: file.name
            }));
            setToast({ title: "File diunggah!", variant: "success" });
        } catch (error) {
            setToast({ title: "Gagal upload.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            setToast({ title: "Isi judul materi.", variant: "destructive" });
            return;
        }

        if (!formData.fileUrl) {
            setToast({ title: "Unggah file materi.", variant: "destructive" });
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
                setToast({ title: "Berhasil diperbarui!", variant: "success" });
            } else {
                await downloadApi.createDownload(payload);
                setToast({ title: "Berhasil diunggah!", variant: "success" });
            }
            setTimeout(() => navigate(routePrefix), 1200);
        } catch (error: any) {
            setToast({ title: "Gagal menyimpan.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-white items-center justify-center">
                <Loader2 size={32} className="text-brand-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-hidden">
            {/* Header Mobile */}
            <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => navigate(routePrefix)} 
                        className="h-10 px-4 rounded-full bg-slate-50 flex items-center gap-2 text-slate-400 active:scale-90 border border-slate-100 shadow-sm border-none"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Batal</span>
                    </Button>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-none uppercase">
                            {isEditMode ? "Edit Materi" : "Tambah Baru"}
                        </h2>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            Content Management
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || isUploading || !formData.title || !formData.fileUrl}
                    className="h-10 px-8 bg-brand-primary rounded-xl font-bold text-[9px] uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 active:scale-90 border-none flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                        <>
                            {isEditMode ? <Edit3 size={14} /> : <Plus size={14} />}
                            {isEditMode ? "Simpan" : "Unggah"}
                        </>
                    )}
                </Button>
            </div>

            {/* Content Mobile */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul Dokumen</label>
                        <input 
                            required
                            value={formData.title}
                            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Cth: Materi Minggu 1"
                            className="w-full bg-slate-50 border-none rounded-2xl h-14 px-5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unggah Dokumen (PDF/WORD)</label>
                        <div className="relative">
                            <input 
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className={cn(
                                    "absolute inset-0 opacity-0 z-10",
                                    isUploading && "pointer-events-none"
                                )}
                            />
                            <div className={cn(
                                "w-full rounded-[32px] border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center",
                                formData.fileUrl 
                                    ? "border-[#FFD9CC] bg-[#FFF8F5]" 
                                    : "border-slate-100 bg-slate-50"
                            )}>
                                {isUploading ? (
                                    <Loader2 size={24} className="text-brand-primary animate-spin" />
                                ) : formData.fileUrl ? (
                                    <div className="animate-in zoom-in-95">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-primary/20">
                                            {formData.fileType === "PDF" ? <FileText size={24} /> : <CheckCircle2 size={24} />}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-900 truncate w-full px-4 mb-1">{formData.fileName}</p>
                                        <p className="text-[8px] font-black text-brand-primary uppercase tracking-widest italic">Berhasil Dimuat</p>
                                    </div>
                                ) : (
                                    <>
                                        <FileUp size={28} className="text-slate-200 mb-2" />
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ketuk Pilih File</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-900 rounded-[28px] shadow-lg shadow-slate-900/10">
                    <AlertCircle size={20} className="text-brand-primary shrink-0" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        Dokumen akan dibagikan secara aman ke mahasiswa bimbingan Anda.
                    </p>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-10 left-6 right-6 z-[300]">
                    <Toast title={toast.title} variant={toast.variant} onClose={() => setToast(null)} />
                </div>
            )}
        </div>
    );
}
