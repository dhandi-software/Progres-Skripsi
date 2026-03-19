import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Send, Loader2, BookOpen, ChevronLeft, AlertCircle, FileStack, X, Upload, Download } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
import { Link } from "react-router";

export function BimbinganMobile() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{[key: number]: string}>({});
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    // Review Modal State
    const [reviewingTask, setReviewingTask] = useState<any>(null);
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [reviewCatatan, setReviewCatatan] = useState("");
    const [reviewStatus, setReviewStatus] = useState("REVISION");
    const [uploadingReview, setUploadingReview] = useState(false);

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
        if (!task) {
            showToast("Pilih bab dahulu", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            await bimbinganApi.assignBimbinganTask(mahasiswaId, task);
            showToast("Tugas diberikan!", "success");
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

    const handleOpenReview = (task: any) => {
        setReviewingTask(task);
        if (task.catatan && task.catatan !== "Task Assigned") {
            setReviewCatatan(task.catatan);
        } else {
            setReviewCatatan("");
        }
        setReviewStatus("REVISION");
        setReviewFile(null);
    };

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

                                    {/* Judul */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">
                                            {pengajuan.judul}
                                        </p>
                                    </div>

                                    {/* Current Task */}
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Target Saat Ini</span>
                                        {activeTask ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-md text-[11px] font-bold shadow-sm">
                                                        {activeTask.topik}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(activeTask.tanggal).toLocaleDateString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 font-medium">
                                                    {activeTask.status === 'ASSIGNED' && (
                                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Menunggu Draf Mahasiswa</span>
                                                    )}
                                                    {activeTask.status === 'SUBMITTED' && (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold animate-pulse">Menunggu Reviu Anda</span>
                                                    )}
                                                    {activeTask.status === 'REVISION' && (
                                                        <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded">Perlu Revisi Mahasiswa</span>
                                                    )}
                                                    {activeTask.status === 'APPROVED' && (
                                                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded">Disetujui</span>
                                                    )}
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
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        <CustomSelect 
                                                            options={taskOptions}
                                                            value={selectedTasks[mhs.id] || ""}
                                                            onChange={(val) => setSelectedTasks(prev => ({...prev, [mhs.id]: val}))}
                                                            placeholder="Pilih Bab"
                                                            className="w-full h-9 text-xs min-h-0 py-0"
                                                        />
                                                    </div>
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
                        
                        <div className="p-4 overflow-y-auto space-y-5">
                            {/* Download Action */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex flex-col gap-3">
                                <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                                    <FileStack className="w-4 h-4 text-blue-600" />
                                    Draf dari Mahasiswa
                                </h4>
                                {reviewingTask.fileMahasiswa ? (
                                    <a 
                                        href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} 
                                        target="_blank" rel="noreferrer" 
                                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-white border border-blue-200 hover:border-blue-300 text-blue-700 font-bold rounded-lg text-xs shadow-sm transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Unduh Draf Saat Ini
                                    </a>
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic">File tidak tersedia.</p>
                                )}
                            </div>

                            {/* Upload Revision Action */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Upload Hasil Reviu (Opsional)</label>
                                    <p className="text-[10px] text-gray-500 mb-2">Unggah file yang sudah diberi komentar/coretan jika ada.</p>
                                    <input 
                                        type="file" 
                                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setReviewFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-100 rounded-lg p-1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Catatan/Komentar</label>
                                    <textarea 
                                        className="w-full rounded-xl border-gray-200 border p-3 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 min-h-[80px]"
                                        placeholder="Berikan masukan menyeluruh..."
                                        value={reviewCatatan}
                                        onChange={(e) => setReviewCatatan(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Keputusan Reviu</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" name="status" value="REVISION" 
                                                checked={reviewStatus === "REVISION"}
                                                onChange={() => setReviewStatus("REVISION")}
                                                className="w-3.5 h-3.5 text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-xs font-medium text-gray-700">Perlu Revisi</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" name="status" value="APPROVED" 
                                                checked={reviewStatus === "APPROVED"}
                                                onChange={() => setReviewStatus("APPROVED")}
                                                className="w-3.5 h-3.5 text-green-600 focus:ring-green-600"
                                            />
                                            <span className="text-xs font-medium text-gray-700">Disetujui (ACC)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
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
