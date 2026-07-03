import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Eye, Download, FileText, Send, Loader2, FileStack, ArrowLeft } from "lucide-react";
import { UPLOADS_URL } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useNavigate } from "react-router";
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

interface BimbinganReviewDesktopProps {
    mahasiswaId: string;
    taskId: number;
}

export const BimbinganReviewDesktop: React.FC<BimbinganReviewDesktopProps> = ({ mahasiswaId, taskId }) => {
    const navigate = useNavigate();
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
            // Fetch student info to get the name (optional, if we want it)
            const students = await bimbinganApi.getDosenBimbinganStudents();
            const student = students.find((s: any) => s.mahasiswa.nim === mahasiswaId);
            if (student) setStudentName(student.mahasiswa.nama);

            // Fetch tasks for the student
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

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-10 h-10 animate-spin text-[#119DA4]" /></div>;
    }

    if (!reviewingTask) {
        return (
            <div className="flex h-screen items-center justify-center flex-col bg-gray-50 gap-4">
                <FileText className="w-16 h-16 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-700">Data tidak ditemukan</h2>
                <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold">Kembali</button>
            </div>
        );
    }

    const isApprovedReadOnly = reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED';

    return (
        <div className="min-h-screen bg-gray-50/50 font-geist flex flex-col">
            {toastProps && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}

            <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/dosen/bimbingan")}
                        className="p-2 -ml-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {isApprovedReadOnly ? "Arsip Dokumen Ter-ACC" : "Pemeriksaan Bimbingan"}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            {studentName && <span className="font-medium">{studentName}</span>}
                            {studentName && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                            <span className="font-bold text-[#119DA4]">{reviewingTask.topik}</span>
                            {reviewingTask.keteranganProgres && (
                                <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>Progres: {reviewingTask.keteranganProgres}</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col xl:flex-row bg-gray-50/50">
                {/* Document Viewer Area */}
                {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex-1 border-r border-gray-200 bg-gray-100 p-8 overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2.5">
                                <div className="p-1.5 bg-cyan-50 rounded-lg">
                                    <Eye className="w-4 h-4 text-[#119DA4]" />
                                </div>
                                Live Document Viewer & Annotation
                            </h4>
                            <a
                                href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                                target="_blank" rel="noreferrer"
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Buka Eksternal
                            </a>
                        </div>
                        <div className="h-[calc(100vh-200px)] min-h-[600px] rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                            <Suspense fallback={<div className="flex h-full items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-[#119DA4]" /></div>}>
                                <SharedPdfViewer
                                    url={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                                    initialHighlights={annotations}
                                    onAddHighlight={handleAddHighlight}
                                    onDeleteHighlight={handleDeleteHighlight}
                                    readOnly={isApprovedReadOnly}
                                />
                            </Suspense>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-12 flex flex-col items-center justify-center bg-gray-50">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                            <FileText className="w-12 h-12 text-gray-300" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-800 mb-3 text-center">Pratinjau Tidak Tersedia</h4>
                        <p className="text-base text-gray-500 text-center mb-8 max-w-md leading-relaxed">
                            Dokumen ini (<strong className="text-gray-700">.{reviewingTask.fileMahasiswa?.split('.').pop()}</strong>) tidak dapat di-preview dan dianotasi langsung. Fitur Live Annotation mendukung file <strong className="text-[#119DA4]">.pdf</strong>.
                        </p>
                        <a
                            href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                            target="_blank" rel="noreferrer"
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#119DA4] text-white font-bold rounded-2xl text-base shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <Download className="w-5 h-5" /> Unduh Draf untuk Diperiksa
                        </a>
                    </div>
                )}

                {/* Sidebar Actions */}
                {!isApprovedReadOnly && (
                    <div className="w-full xl:w-[400px] flex flex-col shrink-0 bg-white shadow-inner overflow-hidden border-l border-gray-200">
                        {/* Tab Headers */}
                        <div className="flex items-center border-b border-gray-200 bg-gray-50/50">
                            <button
                                onClick={() => setActiveTab('review')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === 'review' ? 'border-[#119DA4] text-[#119DA4] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                            >
                                Form Keputusan
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                            >
                                Riwayat Anotasi
                                {previousAnnotations.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px]">
                                        {previousAnnotations.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {activeTab === 'review' ? (
                                <>
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-800 ml-1">Keputusan Reviu</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio" name="status" value="REVISION"
                                                    checked={reviewStatus === "REVISION"}
                                                    onChange={() => setReviewStatus("REVISION")}
                                                    className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-gray-900 block">Perlu Revisi</span>
                                                    <span className="text-[11px] text-gray-500 mt-1 block leading-relaxed">Mahasiswa harus memperbaiki dokumen berdasarkan masukan Anda.</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/50 shadow-md' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'}`}>
                                                <input
                                                    type="radio" name="status" value="APPROVED"
                                                    checked={reviewStatus === "APPROVED"}
                                                    onChange={() => setReviewStatus("APPROVED")}
                                                    className="mt-1 w-5 h-5 text-green-600 focus:ring-green-600"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-gray-900 block">Disetujui (ACC Target)</span>
                                                    <span className="text-[11px] text-gray-500 mt-1 block leading-relaxed">Target bab ini selesai dan mahasiswa dapat lanjut ke tahap berikutnya.</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-6 flex-1">
                                        {reviewStatus === 'APPROVED' && (
                                            <div className="space-y-2 p-5 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-300">
                                                <label className="block text-sm font-bold text-green-900 ml-1">Nilai Bimbingan (Opsional)</label>
                                                <p className="text-xs text-green-700/80 leading-relaxed ml-1 mb-2">Input nilai pengerjaan bab ini (rentang 0 - 100).</p>
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
                                                    className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-semibold text-green-900"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 mb-3 ml-1">Catatan Keseluruhan (Opsional)</label>
                                            <textarea
                                                className="w-full rounded-2xl border-gray-100 border-2 p-5 text-sm focus:ring-4 focus:ring-[#119DA4]/10 focus:border-[#119DA4] outline-none transition-all placeholder:text-gray-400 min-h-[160px] bg-gray-50/50 resize-y"
                                                placeholder="Berikan masukan menyeluruh di luar anotasi PDF..."
                                                value={reviewCatatan}
                                                onChange={(e) => setReviewCatatan(e.target.value)}
                                            ></textarea>
                                        </div>

                                        {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                            <div className="p-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl">
                                                <label className="block text-sm font-bold text-blue-900 mb-2">Upload File Hasil Reviu</label>
                                                <p className="text-[11px] text-blue-700/70 mb-4 leading-relaxed">Unggah dokumen yang sudah Anda beri komentar/coretan secara offline.</p>
                                                <input
                                                    type="file"
                                                    accept=".doc,.docx,.pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            setReviewFile(e.target.files[0]);
                                                        }
                                                    }}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white border border-blue-200 rounded-xl p-1 shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-bold text-gray-800">Catatan dari Draf Sebelumnya</label>
                                    </div>

                                    {previousAnnotations.length === 0 ? (
                                        <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                            <p className="text-sm text-gray-500 font-medium">Belum ada riwayat anotasi pada target bimbingan ini.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
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
                                                                <p className="text-xs text-gray-500 italic line-clamp-3">"{quote}"</p>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-gray-800 font-medium leading-relaxed">{ann.komentar}</p>
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


                            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col gap-4">
                                <button
                                    onClick={handleReviewSubmit}
                                    disabled={uploadingReview}
                                    className="w-full py-4 text-base font-bold text-white bg-[#D25026] hover:bg-[#B9441F] active:scale-95 transition-all rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {uploadingReview ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    Kirim Hasil Reviu
                                </button>
                                <button
                                    onClick={() => navigate("/dosen/bimbingan")}
                                    className="w-full py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                                >
                                    Batal & Kembali
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
