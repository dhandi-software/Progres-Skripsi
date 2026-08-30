import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { ArrowLeft, BookOpen, Download, FileText, Loader2, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import { UPLOADS_URL, getFileUrl } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useNavigate, useParams } from "react-router";
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

export const MahasiswaBimbinganReview: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams();

    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<any>(null);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

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
                    return { ...pos, id: String(a.id), komentar: a.komentar };
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
            <div className="flex flex-col h-screen w-screen bg-slate-900 items-center justify-center text-white">
                <Loader2 className="w-10 h-10 animate-spin text-[#00bcd4] mb-3" />
                <p className="text-sm font-semibold text-slate-400">Memuat Dokumen & Anotasi Dosen...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex flex-col h-screen w-screen bg-slate-50 items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <h2 className="text-lg font-bold text-slate-800">Dokumen Tidak Ditemukan</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6">Tugas bimbingan dengan ID ini tidak tersedia.</p>
                <button
                    onClick={() => navigate('/mahasiswa/bimbingan')}
                    className="px-5 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs"
                >
                    Kembali ke Dashboard Bimbingan
                </button>
            </div>
        );
    }

    const parsedCatatan = parseCatatan(task.catatan);
    const pdfUrl = task.fileMahasiswa ? getFileUrl(task.fileMahasiswa) : "";

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col w-screen h-screen overflow-hidden font-geist">
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
            <div className="px-6 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-white shadow-xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/mahasiswa/bimbingan')} 
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700/60 shadow-sm"
                    >
                        <ArrowLeft size={16} /> Kembali ke Bimbingan
                    </button>
                    <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
                    <div className="hidden sm:block">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <span>Anotasi & Review Dosen:</span>
                            <span className="text-[#00bcd4]">{task.topik}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        task.status === 'APPROVED' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : task.status === 'REVISION' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                        {task.status === 'APPROVED' ? '✔ Disetujui (ACC)' : task.status === 'REVISION' ? '⚠ Perlu Perbaikan' : 'Menunggu Review'}
                    </span>
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#00bcd4] hover:bg-[#00acc1] text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all"
                        >
                            <Download size={14} /> Unduh File
                        </a>
                    )}
                </div>
            </div>

            {/* Split Screen Content */}
            <div className="flex-1 h-[calc(100vh-64px)] w-full flex flex-col lg:flex-row overflow-hidden bg-slate-950">
                {/* Left Panel: Full PDF Canvas */}
                <div className="flex-1 h-full w-full relative overflow-hidden bg-slate-950 p-2 lg:p-3 flex flex-col">
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
                            />
                        </Suspense>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 text-sm">
                            Tidak ada file PDF yang diunggah untuk tugas ini.
                        </div>
                    )}
                </div>

                {/* Right Panel: Lecturer Comments & Annotation Notes List */}
                <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col h-[40vh] lg:h-full shrink-0">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#00bcd4]" />
                            <h3 className="text-sm font-extrabold text-white">Catatan & Anotasi Dosen</h3>
                        </div>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                            {annotations.length} Catatan
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                        {/* Lecturer Feedback Section */}
                        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4 shadow-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Evaluasi Dosen Pembimbing</h4>
                            {parsedCatatan.text ? (
                                <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                    "{parsedCatatan.text}"
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 italic">Belum ada catatan evaluasi tertulis dari dosen.</p>
                            )}
                            {parsedCatatan.nilai !== null && (
                                <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center text-xs">
                                    <span className="font-semibold text-slate-400">Nilai Draf:</span>
                                    <span className="font-extrabold text-amber-400 text-sm">{parsedCatatan.nilai} / 100</span>
                                </div>
                            )}
                        </div>

                        {/* Annotations List */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                                <span>Daftar Anotasi Dokumen</span>
                            </h4>
                            {annotations.length === 0 ? (
                                <div className="p-4 bg-slate-800/40 rounded-xl text-center text-xs text-slate-500 italic border border-slate-800">
                                    Tidak ada tanda visual / paraf pada halaman PDF.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {annotations.map((ann, idx) => (
                                        <div key={idx} className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 shadow-sm text-xs space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] text-[#00bcd4] font-bold">
                                                <span>Catatan #{idx + 1}</span>
                                                {ann.position?.pageNumber && <span>Halaman {ann.position.pageNumber}</span>}
                                            </div>
                                            <p className="text-slate-200 leading-relaxed font-medium">
                                                {ann.komentar || (ann.comment && ann.comment.text) || "Anotasi Visual Dosen"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col gap-2">
                        {pdfUrl && (
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="w-full py-2.5 bg-[#00bcd4] hover:bg-[#00acc1] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                                <Download size={15} /> Unduh File Ber-anotasi (PDF)
                            </a>
                        )}
                        <button
                            onClick={() => navigate('/mahasiswa/bimbingan')}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
                        >
                            <ArrowLeft size={15} /> Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
