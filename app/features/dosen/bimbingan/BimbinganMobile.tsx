import { useState, useEffect, useCallback } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Send, Loader2, BookOpen, ChevronLeft, AlertCircle, FileStack, X, Upload, Download, Eye, Calendar } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
import { Link } from "react-router";
import { lazy, Suspense } from "react";

// Use dynamic import for client-side only component
const SharedPdfViewer = lazy(() => import('../../components/SharedPdfViewer.client').then(m => ({ default: m.SharedPdfViewer })));

const getStatusPengajuan = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return 'Belum Mengumpulkan';
        case 'SUBMITTED': return 'Sudah Mengumpulkan';
        case 'REVISION': return 'Perlu Perbaikan';
        case 'APPROVED': return 'Selesai (ACC)';
        default: return '-';
    }
};

const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return { text: "-", isLate: false, isWarning: false };
    const now = new Date();
    const dDate = new Date(deadline);
    dDate.setHours(23, 59, 59, 999);
    
    const diffTime = dDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Terlambat ${Math.abs(diffDays)} hari`, isLate: true, isWarning: false };
    if (diffDays === 0) return { text: "Hari ini", isLate: false, isWarning: true };
    if (diffDays <= 3) return { text: `${diffDays} hari lagi`, isLate: false, isWarning: true };
    return { text: `${diffDays} hari lagi`, isLate: false, isWarning: false };
};

export function BimbinganMobile() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{[key: number]: string}>({});
    const [selectedSchedules, setSelectedSchedules] = useState<{[key: number]: string}>({});
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    // Review Modal State
    const [reviewingTask, setReviewingTask] = useState<any>(null);
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [reviewCatatan, setReviewCatatan] = useState("");
    const [reviewStatus, setReviewStatus] = useState("REVISION");
    const [uploadingReview, setUploadingReview] = useState(false);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const fetchStudents = async () => {
        try {
            const data = await bimbinganApi.getDosenBimbinganStudents();
            setStudents(data || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleAssign = async (mahasiswaId: number) => {
        const task = selectedTasks[mahasiswaId];
        const jadwal = selectedSchedules[mahasiswaId];
        if (!task) {
            showToast("Pilih bab dahulu", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            await bimbinganApi.assignBimbinganTask(mahasiswaId, task, jadwal ? new Date(jadwal) : undefined);
            showToast("Tugas diberikan!", "success");
            setSelectedTasks(prev => { const next = {...prev}; delete next[mahasiswaId]; return next; });
            setSelectedSchedules(prev => { const next = {...prev}; delete next[mahasiswaId]; return next; });
            fetchStudents();
        } catch (error) {
            console.error("Failed to assign:", error);
            showToast("Gagal memberikan tugas", "destructive");
        } finally {
            setAssigningId(null);
        }
    };

    const taskOptions = [
        { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
        { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
        { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
        { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
        { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
        { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
    ];

    const handleOpenReview = async (task: any) => {
        setReviewingTask(task);
        if (task.catatan && task.catatan !== "Task Assigned") {
            setReviewCatatan(task.catatan);
        } else {
            setReviewCatatan("");
        }
        setReviewStatus("REVISION");
        setReviewFile(null);
        setAnnotations([]);
        setHistory([]);

        try {
            const data = await bimbinganApi.getAnnotations(task.id);
            const formatted = data.map((a: any) => {
                const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                return {
                    id: String(a.id),
                    ...pos
                };
            });
            setAnnotations(formatted);

            const dataHistory = await bimbinganApi.getBimbinganHistory(task.mahasiswaId, task.topik);
            setHistory(dataHistory);
        } catch (error) {
            console.error(error);
        }
    };

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
        setUploadingReview(true);
        try {
            await bimbinganApi.uploadRevisiDosen(reviewingTask.id, reviewFile, reviewStatus, reviewCatatan);
            showToast("Hasil reviu berhasil disimpan!", "success");
            setReviewingTask(null);
            fetchStudents();
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan reviu", "destructive");
        } finally {
            setUploadingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#119DA4]" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist relative">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to="/dosen/dashboard" className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900">Bimbingan</h1>
            </div>

            <div className="p-4 space-y-4">
                {students.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                        <Users className="w-12 h-12 text-gray-200 mb-3" />
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Belum ada mahasiswa</h3>
                        <p className="text-xs text-gray-500">
                            Mahasiswa yang disetujui akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1">
                            Daftar Mahasiswa ({students.length})
                        </div>
                        {students.map((pengajuan, idx) => {
                            const mhs = pengajuan.mahasiswa;
                            const bimbinganList = mhs.bimbingan || [];
                            const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                            return (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                    {/* Mhs Info */}
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-sm">{mhs.nama}</h3>
                                            <p className="text-xs font-mono text-gray-500 mt-0.5">{mhs.nim}</p>
                                        </div>
                                    </div>

                                    {/* Judul & Progres */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                                        <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">
                                            {pengajuan.judul}
                                        </p>
                                        {activeTask?.keteranganProgres && (
                                            <div className="text-[10px] text-gray-500 italic border-t border-gray-100 pt-2">
                                                <span className="font-bold text-gray-600 block mb-0.5">Catatan Mahasiswa:</span>
                                                "{activeTask.keteranganProgres}"
                                            </div>
                                        )}
                                    </div>

                                    {/* Current Task */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Target Saat Ini</span>
                                        {activeTask ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-md text-[11px] font-bold shadow-sm">
                                                        {activeTask.topik}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                                        <div className="text-gray-500 font-medium mb-0.5">Status Pengajuan</div>
                                                        <div className="font-bold text-gray-900 leading-tight">{getStatusPengajuan(activeTask.status)}</div>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                                        <div className="text-gray-500 font-medium mb-0.5">Status Penilaian</div>
                                                        <div className="font-bold text-gray-900 leading-tight">{getStatusPenilaian(activeTask.status)}</div>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                                        <div className="text-gray-500 font-medium mb-0.5">Waktu Tersisa</div>
                                                        <div className={`font-bold leading-tight ${getTimeRemaining(activeTask.jadwalBimbingan).isLate ? 'text-red-600' : getTimeRemaining(activeTask.jadwalBimbingan).isWarning ? 'text-orange-600' : 'text-gray-900'}`}>
                                                            {getTimeRemaining(activeTask.jadwalBimbingan).text}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                                        <div className="text-gray-500 font-medium mb-0.5">Terakhir Diubah</div>
                                                        <div className="font-bold text-gray-900 leading-tight">{new Date(activeTask.tanggal).toLocaleDateString('id-ID')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Belum ada instruksi tugas</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-3 border-t border-gray-50 flex flex-col gap-2">
                                        {(!activeTask || activeTask.status === 'APPROVED') && (
                                            <>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Beri Penugasan Baru</span>
                                                <div className="flex flex-col gap-2">
                                                    <CustomSelect 
                                                        options={taskOptions}
                                                        value={selectedTasks[mhs.id] || ""}
                                                        onChange={(val) => setSelectedTasks(prev => ({...prev, [mhs.id]: val}))}
                                                        placeholder="Pilih Bab"
                                                        className="w-full h-9 text-xs min-h-0 py-0"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="date"
                                                            value={selectedSchedules[mhs.id] || ""}
                                                            onChange={(e) => setSelectedSchedules(prev => ({...prev, [mhs.id]: e.target.value}))}
                                                            className="flex-1 rounded-lg border border-gray-200 text-xs px-2 h-9 outline-none focus:border-[#119DA4]"
                                                        />
                                                        <button 
                                                            onClick={() => handleAssign(mhs.id)}
                                                            disabled={assigningId === mhs.id || !selectedTasks[mhs.id]}
                                                            className="w-10 h-9 flex items-center justify-center shrink-0 bg-[#119DA4] hover:bg-[#0e868c] disabled:opacity-50 text-white rounded-lg shadow-sm active:scale-95 transition-all text-sm font-bold"
                                                        >
                                                            {assigningId === mhs.id ? (
                                                                <Loader2 size={16} className="animate-spin" />
                                                            ) : (
                                                                <Send size={16} />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {activeTask && (activeTask.status === 'SUBMITTED' || activeTask.status === 'REVISION') && (
                                            <button 
                                                onClick={() => handleOpenReview(activeTask)}
                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                            >
                                                <FileStack size={14} />
                                                {activeTask.status === 'SUBMITTED' ? "Periksa & Reviu Dokumen" : "Reviu Ulang Dokumen"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewingTask && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Pemeriksaan Bimbingan</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Topik: {reviewingTask.topik}</p>
                            </div>
                            <button onClick={() => setReviewingTask(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {/* Document Viewer Area (Only if PDF) */}
                            {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                                <div className="border-b border-gray-100 bg-gray-50 flex flex-col" style={{ height: "45vh", minHeight: "350px" }}>
                                    <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                                        <h4 className="font-bold text-[11px] text-gray-700 flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5 text-[#119DA4]" />
                                            Live Annotator
                                        </h4>
                                        <a href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Unduh
                                        </a>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden">
                                        <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
                                            <SharedPdfViewer 
                                                url={`http://localhost:5002${reviewingTask.fileMahasiswa}`}
                                                initialHighlights={annotations}
                                                onAddHighlight={handleAddHighlight}
                                                onDeleteHighlight={handleDeleteHighlight}
                                                readOnly={false}
                                            />
                                        </Suspense>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 flex flex-col items-center justify-center bg-gray-50/50 border-b border-gray-100">
                                    <FileText className="w-10 h-10 text-gray-300 mb-3" />
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">Pratinjau Tidak Tersedia</h4>
                                    <p className="text-[10px] text-gray-500 text-center mb-4">
                                        File ({reviewingTask.fileMahasiswa?.split('.').pop()}) tidak mendukung Live Annotator.
                                    </p>
                                    <a 
                                        href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} 
                                        target="_blank" rel="noreferrer" 
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg text-xs shadow-sm transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Unduh Draf
                                    </a>
                                </div>
                            )}

                            {/* Action Form */}
                            <div className="p-4 space-y-4 bg-white flex-1 relative z-10">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Keputusan Reviu</label>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-start gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100'}`}>
                                            <input 
                                                type="radio" name="status" value="REVISION" 
                                                checked={reviewStatus === "REVISION"}
                                                onChange={() => setReviewStatus("REVISION")}
                                                className="mt-0.5 w-3.5 h-3.5 text-orange-500 focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="text-xs font-bold text-gray-900 block">Perlu Revisi</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-start gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/30' : 'border-gray-100'}`}>
                                            <input 
                                                type="radio" name="status" value="APPROVED" 
                                                checked={reviewStatus === "APPROVED"}
                                                onChange={() => setReviewStatus("APPROVED")}
                                                className="mt-0.5 w-3.5 h-3.5 text-green-600 focus:ring-green-600"
                                            />
                                            <div>
                                                <span className="text-xs font-bold text-gray-900 block">Disetujui (ACC)</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Upload Hasil Reviu (Opsional)</label>
                                        <p className="text-[10px] text-gray-500 mb-2">Unggah file yang sudah dicoret offline jika ada.</p>
                                        <input 
                                            type="file" 
                                            accept=".doc,.docx,.pdf" 
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setReviewFile(e.target.files[0]);
                                                }
                                            }}
                                            className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border border-gray-100 rounded-lg p-1"
                                        />
                                    </div>
                                )}
                                
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Riwayat Versi Dokumen</label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                        {history.length > 0 ? history.map(item => (
                                            <div key={item.id} className="p-2 border border-gray-100 rounded-lg text-[10px] flex justify-between items-center bg-gray-50">
                                                <div>
                                                    <span className="font-bold text-gray-700">Versi {item.versi} {item.id === reviewingTask.id ? "(Saat ini)" : ""}</span>
                                                    <span className="text-gray-400 block">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                                                </div>
                                                {item.fileMahasiswa && (
                                                    <a href={`http://localhost:5002${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 bg-blue-50 rounded-lg">
                                                        <Download className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="text-center text-[10px] text-gray-400 italic">Riwayat tidak tersedia</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2 shrink-0 z-20">
                            <button 
                                onClick={() => setReviewingTask(null)}
                                className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl bg-gray-100"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleReviewSubmit}
                                disabled={uploadingReview}
                                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#D25026] hover:bg-[#B9441F] active:scale-95 transition-all rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
                            >
                                {uploadingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                Kirim
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
