import { useState, useEffect, useCallback } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Send, Loader2, BookOpen, AlertCircle, FileStack, X, Upload, Download, Eye } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
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

export function BimbinganDesktop() {
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
        const schedule = selectedSchedules[mahasiswaId];
        if (!task) {
            showToast("Silakan pilih target bab terlebih dahulu", "destructive");
            return;
        }
        if (!schedule) {
            showToast("Silakan tentukan jadwal (tenggat waktu) bimbingan", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            await bimbinganApi.assignBimbinganTask(mahasiswaId, task, new Date(schedule));
            showToast("Tugas berhasil diberikan!", "success");
            // Refresh list
            fetchStudents();
            // Clear selection
            setSelectedTasks(prev => ({ ...prev, [mahasiswaId]: "" }));
            setSelectedSchedules(prev => ({ ...prev, [mahasiswaId]: "" }));
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-[#119DA4]" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-geist relative pb-20">
            {toastProps && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-[#119DA4]" />
                    Manajemen Bimbingan
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Pantau mahasiswa bimbingan aktif dan berikan target/tugas progres pengerjaan laporan secara terpusat.
                </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Daftar Mahasiswa Bimbingan ({students.length})
                        </h2>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Users className="w-16 h-16 text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada mahasiswa</h3>
                        <p className="text-gray-500 text-sm ">
                            Saat judul pengajuan disetujui, mahasiswa otomatis masuk ke daftar ini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                    <th className="p-4 pl-6 w-1/4">Nama & NIM</th>
                                    <th className="p-4 w-1/3">Judul Disetujui</th>
                                    <th className="p-4 w-1/4">Target Saat Ini</th>
                                    <th className="p-4 pr-6 text-right w-[200px]">Aksi Penugasan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((pengajuan, idx) => {
                                    const mhs = pengajuan.mahasiswa;
                                    const bimbinganList = mhs.bimbingan || [];
                                    const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 pl-6 align-top">
                                                <div className="font-bold text-gray-900">{mhs.nama}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{mhs.nim}</div>
                                            </td>
                                            <td className="p-4 align-top">
                                                <p className="text-sm font-medium text-gray-700 line-clamp-3 leading-relaxed">
                                                    {pengajuan.judul}
                                                </p>
                                            </td>
                                            <td className="p-4 align-top">
                                                {activeTask ? (
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-flex max-w-fit px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-md text-xs font-semibold shadow-sm">
                                                            {activeTask.topik}
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2 mt-2 w-full text-[10px]">
                                                            <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                                                                <span className="text-gray-400 block mb-0.5">Pengajuan</span>
                                                                <span className="font-bold text-gray-700">{getStatusPengajuan(activeTask.status)}</span>
                                                            </div>
                                                            <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                                                                <span className="text-gray-400 block mb-0.5">Penilaian</span>
                                                                <span className="font-bold text-gray-700">{getStatusPenilaian(activeTask.status)}</span>
                                                            </div>
                                                            <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                                                                <span className="text-gray-400 block mb-0.5">Waktu Tersisa</span>
                                                                <span className={`font-bold ${getTimeRemaining(activeTask.jadwalBimbingan).isLate ? 'text-red-600' : getTimeRemaining(activeTask.jadwalBimbingan).isWarning ? 'text-orange-600' : 'text-gray-700'}`}>
                                                                    {getTimeRemaining(activeTask.jadwalBimbingan).text}
                                                                </span>
                                                            </div>
                                                            <div className="bg-gray-50 rounded p-1.5 border border-gray-100">
                                                                <span className="text-gray-400 block mb-0.5">Terakhir Diubah</span>
                                                                <span className="font-bold text-gray-700">{new Date(activeTask.tanggal).toLocaleDateString('id-ID')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Belum ada tugas</span>
                                                )}
                                            </td>
                                            <td className="p-4 pr-6 align-top">
                                                <div className="flex flex-col gap-2 min-w-[200px]">
                                                    {(!activeTask || activeTask.status === 'APPROVED') && (
                                                        <>
                                                            <CustomSelect 
                                                                options={taskOptions}
                                                                value={selectedTasks[mhs.id] || ""}
                                                                onChange={(val) => setSelectedTasks(prev => ({...prev, [mhs.id]: val}))}
                                                                placeholder="Pilih Bab"
                                                                className="h-9 text-sm min-h-0 py-0"
                                                            />
                                                            <input 
                                                                type="date"
                                                                value={selectedSchedules[mhs.id] || ""}
                                                                onChange={(e) => setSelectedSchedules(prev => ({...prev, [mhs.id]: e.target.value}))}
                                                                className="h-9 text-sm w-full border border-gray-200 rounded-lg px-2 text-gray-700 outline-none focus:border-[#119DA4]"
                                                            />
                                                            <button 
                                                                onClick={() => handleAssign(mhs.id)}
                                                                disabled={assigningId === mhs.id || !selectedTasks[mhs.id] || !selectedSchedules[mhs.id]}
                                                                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#119DA4] hover:bg-[#0e868c] active:bg-[#0b6b70] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                            >
                                                                {assigningId === mhs.id ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Send size={14} />
                                                                )}
                                                                Assign Tugas Baru
                                                            </button>
                                                        </>
                                                    )}

                                                    {activeTask && (activeTask.status === 'SUBMITTED' || activeTask.status === 'REVISION') && (
                                                        <button 
                                                            onClick={() => handleOpenReview(activeTask)}
                                                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                        >
                                                            <FileStack size={14} />
                                                            {activeTask.status === 'SUBMITTED' ? "Periksa & Reviu Dokumen" : "Reviu Ulang Dokumen"}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewingTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[96vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Pemeriksaan Bimbingan</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Topik: {reviewingTask.topik} {reviewingTask.keteranganProgres ? `• Progres: ${reviewingTask.keteranganProgres}` : ''}</p>
                            </div>
                            <button onClick={() => setReviewingTask(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col xl:flex-row">
                            {/* Document Viewer Area (Only if PDF) */}
                            {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                                <div className="flex-1 border-r border-gray-100 bg-gray-50 p-4 min-h-[500px]">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-[#119DA4]" />
                                            Live Document Viewer & Annotation
                                        </h4>
                                        <a href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Buka Eksternal
                                        </a>
                                    </div>
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
                            ) : (
                                <div className="flex-1 p-8 flex flex-col items-center justify-center bg-gray-50/50">
                                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                    <h4 className="text-lg font-bold text-gray-800 mb-2">Pratinjau Tidak Tersedia</h4>
                                    <p className="text-sm text-gray-500 text-center mb-6">
                                        Dokumen ini ({reviewingTask.fileMahasiswa?.split('.').pop()}) tidak dapat di-preview dan dianotasi langsung di browser. Fitur anotasi Live Google Docs hanya mendukung file <strong className="text-gray-700">.pdf</strong>.
                                    </p>
                                    <a 
                                        href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} 
                                        target="_blank" rel="noreferrer" 
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl text-sm shadow-sm transition-all hover:bg-blue-50"
                                    >
                                        <Download className="w-4 h-4" /> Unduh Draf untuk Diperiksa
                                    </a>
                                </div>
                            )}

                            {/* Sidebar Actions */}
                            <div className="w-full xl:w-80 p-6 flex flex-col gap-6 shrink-0 bg-white">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Keputusan Reviu</label>
                                    <div className="flex flex-col gap-3 mt-3">
                                        <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input 
                                                type="radio" name="status" value="REVISION" 
                                                checked={reviewStatus === "REVISION"}
                                                onChange={() => setReviewStatus("REVISION")}
                                                className="mt-0.5 w-4 h-4 text-orange-500 focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 block">Perlu Revisi</span>
                                                <span className="text-xs text-gray-500">Mahasiswa harus memperbaiki dokumen</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                                            <input 
                                                type="radio" name="status" value="APPROVED" 
                                                checked={reviewStatus === "APPROVED"}
                                                onChange={() => setReviewStatus("APPROVED")}
                                                className="mt-0.5 w-4 h-4 text-green-600 focus:ring-green-600"
                                            />
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 block">Disetujui (ACC Target)</span>
                                                <span className="text-xs text-gray-500">Target bab ini selesai</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Keseluruhan (Opsional)</label>
                                        <textarea 
                                            className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
                                            placeholder="Berikan masukan menyeluruh di luar anotasi PDF..."
                                            value={reviewCatatan}
                                            onChange={(e) => setReviewCatatan(e.target.value)}
                                        ></textarea>
                                    </div>

                                    {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Upload File Hasil Reviu</label>
                                            <p className="text-xs text-gray-500 mb-2">Karena ini bukan PDF, unggah dokumen `.docx` yang sudah Anda beri komentar/coretan secara offline.</p>
                                            <input 
                                                type="file" 
                                                accept=".doc,.docx,.pdf" 
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setReviewFile(e.target.files[0]);
                                                    }
                                                }}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border border-gray-200 rounded-xl p-1"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Riwayat Versi Dokumen</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {history.length > 0 ? history.map(item => (
                                            <div key={item.id} className="p-2 border border-gray-100 rounded-lg text-xs flex justify-between items-center bg-gray-50 hover:bg-white transition-colors">
                                                <div>
                                                    <span className="font-bold text-gray-700">Versi {item.versi} {item.id === reviewingTask.id ? "(Saat ini)" : ""}</span>
                                                    <span className="text-gray-400 block">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                                                </div>
                                                {item.fileMahasiswa && (
                                                    <a href={`http://localhost:5002${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Unduh Draf">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="text-center text-xs text-gray-400 italic">Riwayat tidak tersedia</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => setReviewingTask(null)}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl bg-gray-100"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleReviewSubmit}
                                disabled={uploadingReview}
                                className="px-5 py-2 text-sm font-bold text-white bg-[#D25026] hover:bg-[#B9441F] active:scale-95 transition-all rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2"
                            >
                                {uploadingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Kirim Hasil Reviu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
