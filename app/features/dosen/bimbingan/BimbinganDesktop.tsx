import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { Users, FileText, Send, Loader2, BookOpen, AlertCircle, FileStack, X, Upload, Download } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";

export function BimbinganDesktop() {
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
            showToast("Silakan pilih target bab terlebih dahulu", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            await bimbinganApi.assignBimbinganTask(mahasiswaId, task);
            showToast("Tugas berhasil diberikan!", "success");
            // Refresh list
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
                                                        <div className="text-[10px] text-gray-500 font-medium mt-1">
                                                            {activeTask.status === 'ASSIGNED' && (
                                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Menunggu Draf Mahasiswa</span>
                                                            )}
                                                            {activeTask.status === 'SUBMITTED' && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold animate-pulse">Menunggu Reviu Anda</span>
                                                            )}
                                                            {activeTask.status === 'REVISION' && (
                                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Perlu Revisi Mahasiswa</span>
                                                            )}
                                                            {activeTask.status === 'APPROVED' && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Disetujui</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            Tgl: {new Date(activeTask.tanggal).toLocaleDateString('id-ID')}
                                                        </span>
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
                                                            <button 
                                                                onClick={() => handleAssign(mhs.id)}
                                                                disabled={assigningId === mhs.id || !selectedTasks[mhs.id]}
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
                    <div className="bg-white rounded-2xl shadow-xl w-full  overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Pemeriksaan Bimbingan</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Topik: {reviewingTask.topik}</p>
                            </div>
                            <button onClick={() => setReviewingTask(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Download Action */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3">
                                <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                                    <FileStack className="w-4 h-4 text-blue-600" />
                                    Draf dari Mahasiswa
                                </h4>
                                {reviewingTask.fileMahasiswa ? (
                                    <a 
                                        href={`http://localhost:5002${reviewingTask.fileMahasiswa}`} 
                                        target="_blank" rel="noreferrer" 
                                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-blue-200 hover:border-blue-300 text-blue-700 font-bold rounded-lg text-sm shadow-sm transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Unduh Draf Saat Ini
                                    </a>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">File tidak tersedia.</p>
                                )}
                            </div>

                            {/* Upload Revision Action */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Upload File Hasil Reviu (Opsional)</label>
                                    <p className="text-xs text-gray-500 mb-2">Unggah file yang sudah diberi komentar/coretan jika ada.</p>
                                    <input 
                                        type="file" 
                                        accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setReviewFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer border border-gray-200 rounded-xl p-1"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Catatan/Komentar Umum</label>
                                    <textarea 
                                        className="w-full rounded-xl border-gray-200 border p-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 min-h-[100px]"
                                        placeholder="Berikan masukan menyeluruh..."
                                        value={reviewCatatan}
                                        onChange={(e) => setReviewCatatan(e.target.value)}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Keputusan Reviu</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" name="status" value="REVISION" 
                                                checked={reviewStatus === "REVISION"}
                                                onChange={() => setReviewStatus("REVISION")}
                                                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Perlu Revisi</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" name="status" value="APPROVED" 
                                                checked={reviewStatus === "APPROVED"}
                                                onChange={() => setReviewStatus("APPROVED")}
                                                className="w-4 h-4 text-green-600 focus:ring-green-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Disetujui (ACC Target)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
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
