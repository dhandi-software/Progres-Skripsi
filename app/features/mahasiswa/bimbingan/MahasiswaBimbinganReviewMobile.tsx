import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { ArrowLeft, BookOpen, Download, FileText, Loader2, MessageSquare, CheckCircle2, AlertCircle, Sparkles, ChevronUp, ChevronDown, X } from "lucide-react";
import { UPLOADS_URL, getFileUrl } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useNavigate } from "react-router";
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

interface MahasiswaBimbinganReviewMobileProps {
    taskId: number;
}

export const MahasiswaBimbinganReviewMobile: React.FC<MahasiswaBimbinganReviewMobileProps> = ({ taskId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<any>(null);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [isNotesOpen, setIsNotesOpen] = useState(false);
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

    const scrollViewerRef = useRef<any>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const fetchData = useCallback(async () => {
        if (!taskId) return;
        try {
            setLoading(true);
            const allTasks = await bimbinganApi.getMahasiswaAllTasks();
            const foundTask = allTasks.find((t: any) => String(t.id) === String(taskId));

            if (foundTask) {
                setTask(foundTask);
                const annData = await bimbinganApi.getAnnotations(foundTask.id);
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
            } else {
                showToast("Tugas bimbingan tidak ditemukan.", "destructive");
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal memuat data review bimbingan", "destructive");
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen w-screen bg-slate-950 items-center justify-center text-white font-geist">
                <Loader2 className="w-10 h-10 animate-spin text-[#00bcd4] mb-3" />
                <p className="text-xs font-semibold text-slate-400">Memuat Dokumen & Review Dosen...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col h-screen w-screen bg-slate-950 items-center justify-center p-6 text-center text-white font-geist">
                <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
                <h2 className="text-base font-bold text-slate-200">Dokumen Tidak Ditemukan</h2>
                <p className="text-xs text-slate-400 mt-1 mb-5">Tugas bimbingan dengan ID ini tidak tersedia.</p>
                <button
                    onClick={() => navigate('/mahasiswa/bimbingan')}
                    className="px-4 py-2 bg-[#00bcd4] text-slate-950 font-bold rounded-xl text-xs"
                >
                    Kembali ke Bimbingan
                </button>
            </div>
        );
    }

    const parsedCatatan = parseCatatan(task.catatan);
    const pdfUrl = task.fileMahasiswa ? getFileUrl(task.fileMahasiswa) : "";

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col w-screen h-screen overflow-hidden font-geist">
            {toastProps && (
                <div className="fixed top-4 right-4 z-[200]">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}

            {/* Top Navigation Bar */}
            <div className="px-3 h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white shadow-md">
                <div className="flex items-center gap-2 overflow-hidden">
                    <button 
                        onClick={() => navigate('/mahasiswa/bimbingan')} 
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg flex items-center justify-center transition-all shrink-0 border border-slate-700/60"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="overflow-hidden">
                        <h2 className="text-xs font-extrabold text-white truncate max-w-[150px]">
                            {task.topik}
                        </h2>
                        <p className="text-[9px] text-[#00bcd4] font-bold">Anotasi & Review Dosen</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        task.status === 'APPROVED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : task.status === 'REVISION' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                        {task.status === 'APPROVED' ? 'Disetujui' : task.status === 'REVISION' ? 'Revisi' : 'Review'}
                    </span>
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-2 bg-[#00bcd4] text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center"
                            title="Unduh File"
                        >
                            <Download size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* Mobile PDF View Canvas */}
            <div className="flex-1 h-[calc(100vh-112px)] w-full relative overflow-hidden bg-slate-950 p-1">
                {pdfUrl ? (
                    <Suspense fallback={
                        <div className="flex h-full items-center justify-center bg-slate-950 text-white">
                            <Loader2 className="w-8 h-8 animate-spin text-[#00bcd4]" />
                        </div>
                    }>
                        <SharedPdfViewer
                            url={pdfUrl}
                            initialHighlights={annotations}
                            readOnly={true}
                            showSidebar={false}
                            scrollRef={(scrollTo) => { scrollViewerRef.current = scrollTo; }}
                        />
                    </Suspense>
                ) : (
                    <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                        Tidak ada file PDF yang diunggah.
                    </div>
                )}
            </div>

            {/* Bottom Drawer Bar for Notes */}
            <div className="h-14 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0 text-white z-20">
                <button
                    onClick={() => setIsNotesOpen(!isNotesOpen)}
                    className="flex-1 flex items-center justify-between py-2 text-xs font-bold text-slate-200"
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#00bcd4]" />
                        <span>Lihat Catatan ({annotations.length})</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-[#00bcd4]">
                        <span>{isNotesOpen ? "Tutup" : "Buka Catatan"}</span>
                        {isNotesOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </div>
                </button>
            </div>

            {/* Expandable Bottom Sheet for Notes */}
            {isNotesOpen && (
                <div className="fixed inset-x-0 bottom-0 top-14 z-[150] bg-slate-950/95 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300 font-geist">
                    <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#00bcd4]" />
                            <h3 className="text-xs font-extrabold text-white">Catatan & Anotasi Dosen</h3>
                        </div>
                        <button
                            onClick={() => setIsNotesOpen(false)}
                            className="p-1 text-slate-400 hover:text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Lecturer Feedback */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Evaluasi Dosen</h4>
                            {parsedCatatan.text ? (
                                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                    "{parsedCatatan.text}"
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Belum ada catatan evaluasi tertulis.</p>
                            )}
                            {parsedCatatan.nilai !== null && (
                                <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Nilai Draf:</span>
                                    <span className="font-extrabold text-amber-400">{parsedCatatan.nilai} / 100</span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Notes List */}
                        <div>
                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Daftar Coretan (Ketuk untuk melompat)</p>
                            {annotations.length === 0 ? (
                                <div className="p-3 bg-slate-900 rounded-lg text-center text-xs text-slate-500 italic">
                                    Tidak ada tanda visual / paraf pada halaman.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {annotations.map((ann, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (scrollViewerRef.current) {
                                                    scrollViewerRef.current(ann);
                                                }
                                                setIsNotesOpen(false);
                                            }}
                                            className="bg-slate-900 border border-slate-800 active:border-[#00bcd4] rounded-xl p-3 text-xs space-y-1"
                                        >
                                            <div className="flex items-center justify-between text-[10px] text-[#00bcd4] font-bold mb-1">
                                                <span>Catatan #{idx + 1}</span>
                                                {ann.pageNumber && <span>Halaman {ann.pageNumber}</span>}
                                            </div>

                                            {/* Quoted text snippet from document */}
                                            {(ann.content?.text || ann.quote) && (
                                                <blockquote className="border-l-2 border-amber-400 pl-2 py-0.5 text-xs text-amber-200/90 italic bg-amber-500/10 rounded-r-lg mb-1.5 line-clamp-2 break-words whitespace-normal font-serif">
                                                    "{ann.content?.text || ann.quote}"
                                                </blockquote>
                                            )}

                                            <p className="text-slate-200 leading-relaxed">
                                                {ann.komentar || (ann.comment && ann.comment.text) || "Anotasi Visual Dosen"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
