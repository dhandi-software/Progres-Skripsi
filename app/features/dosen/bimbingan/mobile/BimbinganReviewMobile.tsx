import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { Eye, Download, FileText, Send, Loader2, FileStack, ArrowLeft, MessageSquare, CheckCircle2, AlertCircle, Sparkles, ChevronUp, ChevronDown, X, Trash2, Upload, FileUp } from "lucide-react";
import { UPLOADS_URL, getFileUrl } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useNavigate, useLocation, useParams } from "react-router";
import { Toast } from "~/components/ui/toast";

const SharedPdfViewer = lazy(() => import('~/features/components/SharedPdfViewer.client').then(m => ({ default: m.SharedPdfViewer })));

const parseCatatan = (catatan: string) => {
    if (!catatan) return { nilai: null, text: "" };
    const match = catatan.match(/^\[NILAI:\s*(\d+)\]\s*(.*)$/s);
    if (match) {
        return { nilai: parseInt(match[1]), text: match[2] };
    }
    return { nilai: null, text: catatan };
};

interface BimbinganReviewMobileProps {
    mahasiswaId: string;
    taskId: number;
}

export const BimbinganReviewMobile: React.FC<BimbinganReviewMobileProps> = ({ mahasiswaId, taskId }) => {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isReadOnly = location.state?.isReadOnly || false;

    const [loading, setLoading] = useState(true);
    const [reviewingTask, setReviewingTask] = useState<any>(null);
    const [studentName, setStudentName] = useState("");
    const [reviewStatus, setReviewStatus] = useState("REVISION");
    const [reviewCatatan, setReviewCatatan] = useState("");
    const [reviewNilai, setReviewNilai] = useState<number | null>(null);
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [previousAnnotations, setPreviousAnnotations] = useState<any[]>([]);
    const [uploadingReview, setUploadingReview] = useState(false);
    const [sheetMode, setSheetMode] = useState<'none' | 'annotations' | 'decision'>('none');
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

    const scrollViewerRef = useRef<any>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const students = await bimbinganApi.getDosenBimbinganStudents();
            const student = students.find((s: any) => s.mahasiswa.nim === mahasiswaId);
            if (student) setStudentName(student.mahasiswa.nama);

            const tasks = await bimbinganApi.getBimbinganByMahasiswa(mahasiswaId);
            const task = tasks.find((t: any) => String(t.id) === String(taskId));

            if (task) {
                setReviewingTask(task);
                const parsed = parseCatatan(task.catatan);
                if (parsed.text && parsed.text !== "Task Assigned") {
                    setReviewCatatan(parsed.text);
                }
                setReviewNilai(parsed.nilai);
                setReviewStatus(task.status === 'APPROVED' ? 'APPROVED' : "REVISION");

                if (task.status === 'SUBMITTED' && !task.isReadDosen) {
                    try {
                        await bimbinganApi.markAsRead(task.id);
                    } catch (e) { }
                }

                const annData = await bimbinganApi.getAnnotations(task.id);
                const formatted = (annData || []).map((a: any) => {
                    const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                    const position = pos?.position || pos;
                    const content = pos?.content || { text: "" };
                    const comment = pos?.comment || { text: a.komentar };
                    return {
                        ...pos,
                        id: String(a.id),
                        position,
                        content,
                        comment,
                        komentar: a.komentar,
                        pageNumber: position?.pageNumber || pos?.pageNumber || 1
                    };
                });
                setAnnotations(formatted);

                // Fetch previous annotations
                const prevAnnData = await bimbinganApi.getPreviousAnnotations(task.id);
                setPreviousAnnotations(prevAnnData || []);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat data", "destructive");
        } finally {
            setLoading(false);
        }
    }, [mahasiswaId, taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddHighlight = useCallback(async (highlight: any) => {
        if (!reviewingTask) return;
        try {
            const data = await bimbinganApi.createAnnotation({
                bimbinganId: reviewingTask.id,
                komentar: highlight.comment.text,
                warna: "#FFFF00",
                posisi: highlight
            });
            const newAnn = {
                ...highlight,
                id: String(data.id),
                komentar: highlight.comment.text,
                position: highlight.position || highlight,
                content: highlight.content || { text: "" },
                comment: highlight.comment || { text: highlight.comment.text },
                pageNumber: highlight.position?.pageNumber || 1
            };
            setAnnotations(prev => [newAnn, ...prev]);
            showToast("Anotasi berhasil ditambahkan!", "success");
        } catch (error) {
            console.error("Gagal menyimpan anotasi:", error);
            showToast("Gagal menyimpan anotasi", "destructive");
        }
    }, [reviewingTask]);

    const handleDeleteHighlight = useCallback(async (id: string) => {
        try {
            await bimbinganApi.deleteAnnotation(parseInt(id));
            setAnnotations(prev => prev.filter(a => a.id !== id));
            showToast("Anotasi telah dihapus", "default");
        } catch (error) {
            console.error("Gagal menghapus anotasi:", error);
        }
    }, []);

    const handleReviewSubmit = async () => {
        if (!reviewingTask) return;

        if (reviewStatus === 'APPROVED' && reviewNilai !== null && (reviewNilai < 0 || reviewNilai > 100)) {
            showToast("Nilai bimbingan harus berada di rentang 0 - 100", "destructive");
            return;
        }

        setUploadingReview(true);
        try {
            const finalCatatan = (reviewStatus === 'APPROVED' && reviewNilai !== null && reviewNilai !== undefined)
                ? `[NILAI: ${reviewNilai}] ${reviewCatatan}`
                : reviewCatatan;
            await bimbinganApi.uploadRevisiDosen(reviewingTask.id, reviewFile, reviewStatus, finalCatatan);
            showToast("Hasil reviu berhasil disimpan!", "success");
            setTimeout(() => {
                navigate("/dosen/bimbingan");
            }, 1500);
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan reviu", "destructive");
            setUploadingReview(false);
        }
    };

    const readOnlyMode = isReadOnly || (reviewStatus === 'APPROVED' && reviewingTask?.status === 'APPROVED');
    const pdfUrl = reviewingTask?.fileMahasiswa ? getFileUrl(reviewingTask.fileMahasiswa) : "";

    if (loading) {
        return (
            <div className="flex flex-col h-screen w-screen bg-slate-950 items-center justify-center text-white font-geist">
                <Loader2 className="w-10 h-10 animate-spin text-[#119DA4] mb-3" />
                <p className="text-xs font-semibold text-slate-400">Memuat Dokumen Mahasiswa...</p>
            </div>
        );
    }

    if (!reviewingTask) {
        return (
            <div className="flex flex-col h-screen w-screen bg-slate-950 items-center justify-center p-6 text-center text-white font-geist">
                <FileText className="w-12 h-12 text-slate-500 mb-3" />
                <h2 className="text-base font-bold text-slate-200">Data Tidak Ditemukan</h2>
                <button 
                    onClick={() => navigate("/dosen/bimbingan")} 
                    className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-screen overflow-hidden font-geist">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-[250]">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}

            {/* Mobile Header Bar */}
            <div className="px-3 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white shadow-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => navigate('/dosen/bimbingan')}
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0 border border-slate-700/60"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="overflow-hidden">
                        <h2 className="text-xs font-extrabold text-white truncate max-w-[140px]">
                            {studentName || "Mahasiswa"}
                        </h2>
                        <p className="text-[9px] text-[#119DA4] font-bold truncate max-w-[140px]">
                            {reviewingTask.topik}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        reviewingTask.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                        {reviewingTask.status === 'APPROVED' ? 'ACC' : 'Perlu Reviu'}
                    </span>
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs flex items-center justify-center border border-slate-700"
                            title="Unduh PDF"
                        >
                            <Download size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* Fullscreen PDF Canvas View */}
            <div className="flex-1 h-[calc(100vh-112px)] w-full relative overflow-hidden bg-slate-950 p-1">
                {pdfUrl ? (
                    <Suspense fallback={
                        <div className="flex h-full items-center justify-center bg-slate-950 text-white">
                            <Loader2 className="w-8 h-8 animate-spin text-[#119DA4]" />
                        </div>
                    }>
                        <SharedPdfViewer
                            url={pdfUrl}
                            initialHighlights={annotations}
                            onAddHighlight={readOnlyMode ? undefined : handleAddHighlight}
                            onDeleteHighlight={readOnlyMode ? undefined : handleDeleteHighlight}
                            readOnly={readOnlyMode}
                            showSidebar={false}
                            scrollRef={(scrollTo) => { scrollViewerRef.current = scrollTo; }}
                        />
                    </Suspense>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                        Dokumen ini bukan format PDF.
                    </div>
                )}
            </div>

            {/* Mobile Control Toolbar */}
            <div className="h-14 bg-slate-900 border-t border-slate-800 px-3 flex items-center gap-2 shrink-0 text-white z-20">
                <button
                    onClick={() => setSheetMode(sheetMode === 'annotations' ? 'none' : 'annotations')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                        sheetMode === 'annotations' 
                            ? 'bg-[#119DA4]/20 text-[#119DA4] border-[#119DA4]/50' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                >
                    <MessageSquare size={14} />
                    <span>Coretan ({annotations.length})</span>
                </button>

                {!readOnlyMode && (
                    <button
                        onClick={() => setSheetMode(sheetMode === 'decision' ? 'none' : 'decision')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                            sheetMode === 'decision'
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-[#119DA4] text-slate-950 hover:bg-[#0f8b92]'
                        }`}
                    >
                        <Send size={14} />
                        <span>Kirim Reviu</span>
                    </button>
                )}
            </div>

            {/* Bottom Sheet Modal */}
            {sheetMode !== 'none' && (
                <div className="fixed inset-x-0 bottom-0 top-14 z-[150] bg-slate-950/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300 font-geist">
                    {/* Header */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {sheetMode === 'annotations' ? (
                                <>
                                    <Sparkles className="w-4 h-4 text-[#119DA4]" />
                                    <h3 className="text-xs font-extrabold text-white">Daftar Coretan & Anotasi ({annotations.length})</h3>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 text-emerald-400" />
                                    <h3 className="text-xs font-extrabold text-white">Form Keputusan & Revisi Dosen</h3>
                                </>
                            )}
                        </div>
                        <button
                            onClick={() => setSheetMode('none')}
                            className="p-1 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {sheetMode === 'annotations' && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Ketuk item untuk melompat ke posisi pada dokumen PDF
                                </p>

                                {annotations.length === 0 ? (
                                    <div className="p-4 bg-slate-900 rounded-xl text-center text-xs text-slate-500 italic border border-slate-800">
                                        Belum ada coretan / anotasi visual yang dibuat. Ketuk & tahan teks pada PDF di layar untuk membuat coretan baru.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {annotations.map((ann, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (scrollViewerRef.current) {
                                                        scrollViewerRef.current(ann);
                                                    }
                                                    setSheetMode('none');
                                                }}
                                                className="group bg-slate-900 border border-slate-800 active:border-[#119DA4] rounded-xl p-3.5 text-xs space-y-1.5 cursor-pointer relative"
                                            >
                                                <div className="flex items-center justify-between text-[10px] text-[#119DA4] font-bold">
                                                    <span>Catatan #{idx + 1}</span>
                                                    {ann.pageNumber && (
                                                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                                                            Halaman {ann.pageNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Quoted text snippet from document */}
                                                {(ann.content?.text || ann.quote) && (
                                                    <blockquote className="border-l-2 border-amber-400 pl-2.5 py-1 text-xs text-amber-200/90 italic bg-amber-500/10 rounded-r-lg mb-2 line-clamp-3 break-words whitespace-normal font-serif">
                                                        "{ann.content?.text || ann.quote}"
                                                    </blockquote>
                                                )}

                                                <p className="text-slate-200 leading-relaxed font-medium">
                                                    {ann.komentar || (ann.comment && ann.comment.text) || "Anotasi Visual Dosen"}
                                                </p>

                                                {!readOnlyMode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteHighlight(ann.id);
                                                        }}
                                                        className="mt-2 text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                                                    >
                                                        <Trash2 size={12} /> Hapus Coretan Ini
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {sheetMode === 'decision' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-2">Keputusan Reviu</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setReviewStatus("REVISION")}
                                            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                                reviewStatus === 'REVISION'
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                            }`}
                                        >
                                            <AlertCircle size={15} /> Perlu Perbaikan
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setReviewStatus("APPROVED")}
                                            className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                                                reviewStatus === 'APPROVED'
                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                                                    : 'bg-slate-900 text-slate-400 border-slate-800'
                                            }`}
                                        >
                                            <CheckCircle2 size={15} /> Disetujui (ACC)
                                        </button>
                                    </div>
                                </div>

                                {reviewStatus === 'APPROVED' && (
                                    <div className="animate-in fade-in duration-200">
                                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Nilai Draf Bimbingan (0 - 100)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={reviewNilai !== null ? reviewNilai : ''}
                                            onChange={(e) => setReviewNilai(e.target.value === '' ? null : Number(e.target.value))}
                                            placeholder="Masukkan nilai (contoh: 85)"
                                            className="w-full text-xs p-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-[#119DA4]"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Catatan Evaluasi Untuk Mahasiswa</label>
                                    <textarea
                                        rows={4}
                                        value={reviewCatatan}
                                        onChange={(e) => setReviewCatatan(e.target.value)}
                                        placeholder="Ketik catatan perbaikan atau feedback untuk mahasiswa..."
                                        className="w-full text-xs p-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-[#119DA4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Unggah Dokumen Perbaikan (Opsional)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={(e) => setReviewFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="mobile-review-file"
                                        />
                                        <label
                                            htmlFor="mobile-review-file"
                                            className="w-full p-3 bg-slate-900 border border-dashed border-slate-700 hover:border-[#119DA4] rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-300 cursor-pointer"
                                        >
                                            <FileUp size={16} className="text-[#119DA4]" />
                                            <span>{reviewFile ? reviewFile.name : "Pilih file perbaikan dari HP"}</span>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={uploadingReview}
                                    onClick={handleReviewSubmit}
                                    className="w-full py-3 bg-[#119DA4] hover:bg-[#0f8b92] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4"
                                >
                                    {uploadingReview ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Menyimpan Reviu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Simpan & Kirim Reviu Dosen</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
