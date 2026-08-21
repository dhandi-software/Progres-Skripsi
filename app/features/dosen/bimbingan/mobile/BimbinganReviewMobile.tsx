import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Eye, Download, FileText, Send, Loader2, FileStack, ArrowLeft } from "lucide-react";
import { UPLOADS_URL, getFileUrl } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useNavigate, useLocation, useParams } from "react-router";
import { Toast } from "~/components/ui/toast";

const SharedPdfViewer = lazy(() => import('../../../components/SharedPdfViewer.client').then(m => ({ default: m.SharedPdfViewer })));

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
    const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const fetchData = useCallback(async () => {
        try {
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
                const formatted = annData.map((a: any) => {
                    const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                    return { ...pos, id: String(a.id) };
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
            setAnnotations(prev => [{ ...highlight, id: String(data.id) }, ...prev]);
        } catch (error) {
            console.error("Gagal menyimpan anotasi:", error);
            showToast("Gagal menyimpan anotasi", "destructive");
        }
    }, [reviewingTask]);

    const handleDeleteHighlight = useCallback(async (id: string) => {
        try {
            await bimbinganApi.deleteAnnotation(parseInt(id));
            setAnnotations(prev => prev.filter(a => a.id !== id));
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

    // Force active tab to history if readOnlyMode is true
    useEffect(() => {
        if (readOnlyMode) {
            setActiveTab('history');
        }
    }, [readOnlyMode]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-[#119DA4]" /></div>;
    }

    if (!reviewingTask) {
        return (
            <div className="flex h-screen items-center justify-center flex-col bg-gray-50 p-6">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-700 mb-6">Data tidak ditemukan</h2>
                <button onClick={() => navigate("/dosen/bimbingan")} className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold">Kembali</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-geist">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-50">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}

            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                        {readOnlyMode ? "Arsip Reviu" : "Pemeriksaan Dokumen"}
                    </h3>
                    <p className="text-[10px] text-[#119DA4] font-bold uppercase tracking-wider truncate mt-0.5">
                        {reviewingTask.topik}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                {/* PDF Viewer Section */}
                {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-cyan-50 rounded-lg">
                                    <Eye className="w-4 h-4 text-[#119DA4]" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">Dokumen Utama</span>
                            </div>
                            <a
                                href={getFileUrl(reviewingTask.fileMahasiswa)}
                                target="_blank" rel="noreferrer"
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm flex items-center gap-1.5"
                            >
                                <Download className="w-3 h-3" /> Unduh
                            </a>
                        </div>

                        <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white relative">
                            <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#119DA4]" /></div>}>
                                <SharedPdfViewer
                                    url={getFileUrl(reviewingTask.fileMahasiswa)}
                                    initialHighlights={annotations}
                                    onAddHighlight={readOnlyMode ? undefined : handleAddHighlight}
                                    onDeleteHighlight={readOnlyMode ? undefined : handleDeleteHighlight}
                                    readOnly={readOnlyMode}
                                />
                            </Suspense>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center italic mt-1">Ketuk dan tahan teks untuk memberikan anotasi.</p>
                    </div>
                ) : (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border border-gray-200">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2">Pratinjau Tidak Tersedia</h4>
                        <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
                            File ini (.{reviewingTask.fileMahasiswa?.split('.').pop()}) hanya bisa diperiksa secara offline.
                        </p>
                        <a
                            href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#119DA4] text-white font-bold rounded-xl text-[11px] shadow-lg shadow-cyan-500/20"
                        >
                            <Download className="w-4 h-4" /> Unduh Dokumen
                        </a>
                    </div>
                )}

                {/* Review Actions Section */}
                <div className="bg-white px-5 pt-8 pb-32 border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] mt-4">
                    {/* Tab Headers */}
                    {!readOnlyMode && (
                        <div className="flex items-center mb-6 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100">
                            <button
                                onClick={() => setActiveTab('review')}
                                className={`flex-1 py-2.5 text-[13px] font-bold text-center rounded-lg transition-all ${activeTab === 'review' ? 'bg-white shadow-sm text-[#119DA4]' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Form Keputusan
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 py-2.5 text-[13px] font-bold text-center rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Riwayat Anotasi
                                {previousAnnotations.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px]">
                                        {previousAnnotations.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                    
                    {readOnlyMode && (
                        <h3 className="text-[13px] font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Riwayat Anotasi</h3>
                    )}

                    {activeTab === 'review' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Keputusan Reviu</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setReviewStatus("REVISION")}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-50 bg-gray-50/30'}`}
                                    >
                                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                            {reviewStatus === 'REVISION' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <span className="text-[13px] font-bold text-gray-900 block">Perlu Revisi</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">Mahasiswa akan diminta memperbaiki berdasarkan anotasi Anda.</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setReviewStatus("APPROVED")}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/50' : 'border-gray-50 bg-gray-50/30'}`}
                                    >
                                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                            {reviewStatus === 'APPROVED' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <span className="text-[13px] font-bold text-gray-900 block">Setujui (ACC)</span>
                                            <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">Target progres ini dianggap selesai dan mahasiswa dapat lanjut.</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {reviewStatus === 'APPROVED' && (
                                <div className="space-y-2 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-300">
                                    <label className="block text-xs font-black text-green-950 uppercase tracking-widest">Nilai Bimbingan (Opsional)</label>
                                    <p className="text-[10px] text-green-800 leading-relaxed mb-2">Input nilai pengerjaan bab ini (rentang 0 - 100).</p>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={reviewNilai !== null ? reviewNilai : ""}
                                        onChange={(e) => {
                                            const val = e.target.value === "" ? null : parseInt(e.target.value);
                                            setReviewNilai(val);
                                        }}
                                        placeholder="Contoh: 85"
                                        className="w-full px-4 py-2 bg-white border border-green-200 rounded-xl text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-semibold text-green-900"
                                    />
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Catatan Keseluruhan</label>
                                <textarea
                                    className="w-full rounded-2xl border-gray-100 border-2 p-4 text-sm focus:border-[#119DA4] outline-none transition-all placeholder:text-gray-300 min-h-[120px] bg-gray-50/50"
                                    placeholder="Tuliskan masukan tambahan di sini..."
                                    value={reviewCatatan}
                                    onChange={(e) => setReviewCatatan(e.target.value)}
                                ></textarea>
                            </div>

                            {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                <div className="p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl space-y-3 mt-4">
                                    <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider">Upload Hasil Reviu</label>
                                    <input
                                        type="file"
                                        accept=".doc,.docx,.pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setReviewFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white bg-white border border-blue-200 rounded-xl p-1"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            {!readOnlyMode && <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Catatan dari Draf Sebelumnya</label>}
                            {previousAnnotations.length === 0 ? (
                                <div className="p-6 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                    <p className="text-xs text-gray-500 font-medium">Belum ada riwayat anotasi pada target bimbingan ini.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {previousAnnotations.map((ann, idx) => {
                                        const pos = typeof ann.posisi === 'string' ? JSON.parse(ann.posisi) : (ann.posisi || {});
                                        const quote = pos.content?.text;
                                        const pageNum = pos.position?.pageNumber;

                                        return (
                                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 hover:border-orange-300 transition-colors">
                                                {pageNum && (
                                                    <div className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-[10px] font-bold mb-2">
                                                        Halaman {pageNum}
                                                    </div>
                                                )}
                                                {quote && (
                                                    <div className="pl-3 border-l-2 border-orange-200 mb-3">
                                                        <p className="text-[11px] text-gray-500 italic line-clamp-3">"{quote}"</p>
                                                    </div>
                                                )}
                                                <p className="text-[13px] text-gray-800 font-medium leading-relaxed">{ann.komentar}</p>
                                                {ann.bimbinganVersi && (
                                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                                        <span>Revisi v{ann.bimbinganVersi}</span>
                                                        <span>{ann.tanggalBimbingan && new Date(ann.tanggalBimbingan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            {!readOnlyMode ? (
                <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 sticky bottom-0 shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="py-3.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl active:bg-gray-100"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleReviewSubmit}
                        disabled={uploadingReview}
                        className="py-3.5 text-sm font-bold text-white bg-[#D25026] rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                    >
                        {uploadingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Kirim Reviu
                    </button>
                </div>
            ) : (
                <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-1 gap-3 sticky bottom-0 shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="py-3.5 text-sm font-bold text-gray-500 bg-gray-100 rounded-2xl active:bg-gray-200"
                    >
                        Kembali
                    </button>
                </div>
            )}
        </div>
    );
};
