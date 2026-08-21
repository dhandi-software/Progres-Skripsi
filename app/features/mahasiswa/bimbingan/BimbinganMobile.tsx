import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { BookOpen, Calendar, Clock, Loader2, CheckCircle2, ChevronLeft, FileText, Upload, Download, AlertCircle, Eye, X } from "lucide-react";
import { Link } from "react-router";
import { lazy, Suspense } from "react";
import { Loader2 as LoaderIcon } from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { useAuth } from "~/hooks/useAuth";
import { io } from "socket.io-client";

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

const parseCatatan = (catatan: string) => {
    if (!catatan) return { nilai: null, text: "" };
    const match = catatan.match(/^\[NILAI:\s*(\d+)\]\s*(.*)$/s);
    if (match) {
        return { nilai: parseInt(match[1]), text: match[2] };
    }
    return { nilai: null, text: catatan };
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
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif");
    const [activeTask, setActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [keteranganProgres, setKeteranganProgres] = useState("");
    const [isDeletedFile, setIsDeletedFile] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    // Viewer Modal State
    const [viewingReview, setViewingReview] = useState(false);
    const [viewingTaskTopik, setViewingTaskTopik] = useState("");
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [allTasks, setAllTasks] = useState<any[]>([]);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

    const fetchTask = () => {
        setLoading(true);
        bimbinganApi.getMahasiswaAllTasks()
            .then(tasks => {
                setAllTasks(tasks);
                const grouped = tasks.reduce((acc: any, task: any) => {
                    if (!acc[task.topik] || task.versi > acc[task.topik].versi) {
                        acc[task.topik] = task;
                    }
                    return acc;
                }, {});
                const uniqueTasks: any[] = Object.values(grouped);
                const active = uniqueTasks.find((t: any) => t.status !== 'APPROVED');
                const completed = uniqueTasks.filter((t: any) => t.status === 'APPROVED');
                
                setActiveTask(active || null);
                setCompletedTasks(completed);

                if (active) {
                    setHistory(tasks.filter((t: any) => t.topik === active.topik).sort((a: any, b: any) => b.versi - a.versi));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const { user } = useAuth();
    useEffect(() => {
        fetchTask();
    }, []);

    useEffect(() => {
        if (!user) return;
        const socket = io(UPLOADS_URL);
        socket.emit("join", user.id);
        
        socket.on("bimbingan_reviewed", () => {
            fetchTask();
            showToast("Ada pembaruan status bimbingan!", "success");
        });

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!activeTask) return;
        if (activeTask.status === 'ASSIGNED' && !selectedFile) {
            showToast("Harap pilih file terlebih dahulu.", "destructive");
            return;
        }

        setUploading(true);
        try {
            await bimbinganApi.uploadDraftMahasiswa(activeTask.id, selectedFile, keteranganProgres, isDeletedFile);
            showToast("File berhasil diunggah!", "success");
            setSelectedFile(null);
            setIsDeletedFile(false);
            setKeteranganProgres("");
            setIsEditing(false);
            fetchTask();
        } catch (error) {
            console.error(error);
            showToast("Gagal mengunggah file.", "destructive");
        } finally {
            setUploading(false);
        }
    };

    const handleOpenViewer = async (taskId: number, topik: string) => {
        setViewingReview(true);
        setViewingTaskTopik(topik);
        setAnnotations([]);
        try {
            const data = await bimbinganApi.getAnnotations(taskId);
            const formatted = data.map((a: any) => {
                const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                return { id: String(a.id), ...pos };
            });
            setAnnotations(formatted);
        } catch (error) {
            console.error(error);
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
        <div className="min-h-screen bg-gray-50 font-geist pb-20">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-[150]">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        duration={toastProps.variant === 'success' ? 3000 : 5000}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
            <DeleteConfirmationModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                    setIsDeletedFile(true);
                    setIsDeleteDialogOpen(false);
                }}
                title="Hapus File Draf"
                description="Apakah Anda yakin ingin menghapus file draf ini? File yang dihapus tidak akan tersimpan kecuali Anda mengunggah yang baru."
            />
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to="/mahasiswa/dashboard" className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900">Bimbingan</h1>
            </div>

            <div className="bg-white px-4 border-b border-gray-200 sticky top-[48px] z-10 flex space-x-4 shrink-0 shadow-sm overflow-x-auto scroller-hide">
                <button
                    onClick={() => setActiveTab("aktif")}
                    className={`py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'aktif' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Target Aktif
                </button>
                <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'riwayat' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Riwayat Selesai
                </button>
            </div>

            <div className="p-4 space-y-4">
                {activeTab === 'aktif' && (
                    <>
                        {/* Active Assignment Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                            <div className="h-1.5 w-full bg-[#119DA4]"></div>
                            
                            <div className="p-5">
                                {activeTask ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-pink-500" />
                                            </div>
                                            <h2 className="text-lg flex flex-col items-start gap-1 font-bold text-gray-900 leading-tight">
                                                <span>Mengerjakan {activeTask.topik}</span>
                                            </h2>
                                        </div>

                                        <p className="text-xs text-gray-600 mb-6 border-b border-gray-100 pb-4">
                                            Silakan kumpulkan draf laporan dalam bentuk PDF, DOC, atau DOCX untuk reviu.
                                        </p>

                                        {activeTask.status === 'REVISION' && (
                                            <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
                                                <div className="p-1.5 bg-orange-100 rounded-full text-orange-600 shrink-0">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-orange-800 font-bold text-sm">Revisi Diperlukan</h3>
                                                    <p className="text-orange-700 text-[10px] mt-1 mb-2 leading-relaxed">
                                                        Dosen pembimbing telah memberikan catatan revisi. Silakan periksa kolom catatan di bawah, lihat anotasi dokumen jika ada, lalu unggah draf perbaikan Anda.
                                                    </p>
                                                    {activeTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                        <button 
                                                            onClick={() => handleOpenViewer(activeTask.id, activeTask.topik)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg text-[10px] font-bold transition-colors shadow-sm w-max"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> Lihat Anotasi Dokumen
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Jika status SUBMITTED dan sedang tidak edit, tampilkan tombol Edit saja */}
                                        {activeTask.status === 'SUBMITTED' && !isEditing && !getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                                <h3 className="text-sm font-bold text-gray-800">Draf telah dikumpulkan</h3>
                                                <p className="text-[10px] text-gray-500 mt-1 mb-3">Jika perlu, perbarui draf sebelum dosen reviu.</p>
                                                <button 
                                                        onClick={() => {
                                                            setIsEditing(true);
                                                            setKeteranganProgres(activeTask.keteranganProgres || "");
                                                        }}
                                                        className="w-full px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold rounded-lg transition-colors text-xs text-center"
                                                    >
                                                        Edit Pengajuan (Draf)
                                                </button>
                                            </div>
                                        )}

                                        {/* Form upload ditampilkan jika status ASSIGNED, REVISION, atau ketika isEditing true */}
                                        {(activeTask.status === 'ASSIGNED' || activeTask.status === 'REVISION' || isEditing) && (
                                            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="block text-xs font-bold text-gray-700">
                                                        Pengumpulan Draf (.pdf)
                                                    </label>
                                                    {isEditing && (
                                                        <button 
                                                            onClick={() => {
                                                                setIsEditing(false);
                                                                setIsDeletedFile(false);
                                                                setSelectedFile(null);
                                                            }}
                                                            className="text-[10px] text-gray-500 hover:text-gray-700 font-bold"
                                                        >
                                                            Batal
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <div className={activeTask.fileMahasiswa && !isDeletedFile && !selectedFile && activeTask.status !== 'ASSIGNED' ? "hidden" : "block relative"}>
                                                        <input 
                                                            type="file" 
                                                            accept="application/pdf" 
                                                            onChange={handleFileChange}
                                                            disabled={getTimeRemaining(activeTask.jadwalBimbingan).isLate}
                                                            className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#e6f4f5] file:text-[#119DA4] hover:file:bg-[#d0ebed] cursor-pointer disabled:opacity-50 bg-white border border-gray-200 p-1.5 rounded-lg"
                                                            id="file-upload-input-mobile"
                                                        />
                                                        {(selectedFile || isDeletedFile) && activeTask.fileMahasiswa && activeTask.status !== 'ASSIGNED' && (
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedFile(null);
                                                                    setIsDeletedFile(false);
                                                                    const el = document.getElementById('file-upload-input-mobile') as HTMLInputElement;
                                                                    if (el) el.value = '';
                                                                }}
                                                                className="absolute right-1 top-1.5 text-[10px] font-bold text-gray-500 hover:text-gray-700 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                            >
                                                                Batal Ganti
                                                            </button>
                                                        )}
                                                    </div>

                                                    {activeTask.fileMahasiswa && !isDeletedFile && !selectedFile && activeTask.status !== 'ASSIGNED' && (
                                                        <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-white">
                                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                                <FileText className="w-4 h-4 text-[#119DA4] shrink-0" />
                                                                <span className="text-[11px] font-medium text-gray-700 truncate" title={activeTask.fileMahasiswa.split('/').pop()}>{activeTask.fileMahasiswa.split('/').pop()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                <button 
                                                                    onClick={() => {
                                                                        const el = document.getElementById('file-upload-input-mobile') as HTMLInputElement;
                                                                        if (el) el.click();
                                                                    }} 
                                                                    className="text-[10px] font-bold text-[#119DA4] hover:text-[#0d7a7f] bg-[#e6f4f5] hover:bg-[#d0ebed] py-1 px-2 rounded-full transition-colors"
                                                                >
                                                                    Ganti
                                                                </button>
                                                                <button onClick={() => setIsDeleteDialogOpen(true)} className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1 px-2 rounded-full transition-colors">
                                                                    Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="block text-xs font-bold text-gray-700 mb-2 mt-3">
                                                    Ringkasan Progres
                                                </label>
                                                <textarea 
                                                    value={keteranganProgres}
                                                    onChange={(e) => setKeteranganProgres(e.target.value)}
                                                    placeholder="Tulis ringkasan..."
                                                    className="w-full h-20 p-2.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#119DA4] bg-white"
                                                />
                                                
                                                {getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <div className="mt-3 text-[10px] text-red-600 font-medium bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-start gap-1.5">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                        Waktu telah berakhir.
                                                    </div>
                                                )}
                                                {(selectedFile || activeTask.status !== 'ASSIGNED') && !getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <button 
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="mt-4 w-full py-2.5 bg-[#4267B2] hover:bg-[#365899] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5"
                                                    >
                                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        {activeTask.status === 'SUBMITTED' ? "PERBARUI DRAF" : "KIRIMKAN"}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <h3 className="text-sm font-bold text-gray-800 mb-3 bg-gray-50 p-2.5 border border-gray-200 rounded-t-lg border-b-0">Status pengajuan</h3>
                                        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                                            <table className="w-full text-[11px] text-left">
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Status</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white font-medium">{getStatusPengajuan(activeTask.status)}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Penilaian</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white font-medium">{getStatusPenilaian(activeTask.status)}</td>
                                                    </tr>
                                                    {/* Baris baru untuk File Draf */}
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">File Draf</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white">
                                                            {activeTask.fileMahasiswa ? (
                                                                <a href={`${UPLOADS_URL}${activeTask.fileMahasiswa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-[#119DA4] hover:underline text-[10px] break-all leading-tight">
                                                                    <FileText className="w-3 h-3 shrink-0" /> Lihat File
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400 italic text-[10px]">Belum diunggah</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Batas Waktu</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white font-medium">{activeTask.jadwalBimbingan ? new Date(activeTask.jadwalBimbingan).toLocaleDateString('id-ID', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Sisa Waktu</th>
                                                        <td className={`py-2.5 px-3 bg-white font-medium ${getTimeRemaining(activeTask.jadwalBimbingan).isLate ? 'text-red-600' : 'text-gray-900'}`}>{getTimeRemaining(activeTask.jadwalBimbingan).text}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Terakhir</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white font-medium">{new Date(activeTask.tanggal).toLocaleDateString('id-ID', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-2.5 px-3 font-bold text-gray-700 w-2/5 border-r border-gray-200 align-top">Catatan</th>
                                                        <td className="py-2.5 px-3 text-gray-900 bg-white">
                                                            {(() => {
                                                                const parsed = parseCatatan(activeTask.catatan);
                                                                return (
                                                                    <div className="space-y-2">
                                                                        {parsed.nilai !== null && (
                                                                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-full font-bold text-[9px] shadow-sm">
                                                                                Nilai Bimbingan: {parsed.nilai} / 100
                                                                            </div>
                                                                        )}
                                                                        {parsed.text && parsed.text !== "Task Assigned" ? (
                                                                            <div className="p-2 bg-orange-50 rounded border border-orange-100 text-orange-800 text-[10px]">
                                                                                "{parsed.text}"
                                                                            </div>
                                                                        ) : (
                                                                            parsed.nilai === null && <span className="text-gray-400 italic">Belum ada</span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                            
                                                            {activeTask.fileDosen && (
                                                                <a href={`${UPLOADS_URL}${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-2 text-center w-full block py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[10px] font-bold transition-colors">
                                                                    Unduh File Dosen
                                                                </a>
                                                            )}
                                                            {activeTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && activeTask.status === 'REVISION' && (
                                                                <button onClick={() => handleOpenViewer(activeTask.id, activeTask.topik)} className="mt-2 text-center w-full block py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-[10px] font-bold transition-colors">
                                                                    Lihat Anotasi
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center flex flex-col items-center">
                                        <CheckCircle2 className="w-12 h-12 text-gray-200 mb-3" />
                                        <h3 className="text-sm font-bold text-gray-800 mb-1">Belum ada tugas</h3>
                                        <p className="text-gray-500 text-xs px-4">
                                            Belum ada instruksi dari dosen pembimbing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {activeTask && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="font-bold text-gray-800 text-sm mb-4">Riwayat Versi Draf</h3>
                                
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
                                    {history.length > 0 ? history.map((item, index) => (
                                        <div key={item.id} className="relative flex items-start gap-3">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 text-white ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-[#119DA4]'}`}>
                                                {item.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.status === 'REVISION' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm w-full mt-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="font-bold text-gray-800 text-xs">Versi {item.versi}</div>
                                                    <div className="text-[9px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                                        {new Date(item.tanggal).toLocaleDateString('id-ID', { year: '2-digit', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-500 space-y-1">
                                                    {item.status === 'ASSIGNED' && <p>Tugas diberikan</p>}
                                                    {item.status === 'SUBMITTED' && <p>Draf diunggah</p>}
                                                    {item.status === 'REVISION' && <p className="text-orange-600 font-medium">Revisi diminta</p>}
                                                    {item.status === 'APPROVED' && <p className="text-green-600 font-medium">Disetujui (ACC)</p>}
                                                    
                                                    {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                        <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="inline-block mt-1 font-bold text-blue-600 active:text-blue-700">
                                                            Unduh PDF
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-[10px] text-gray-400 italic ml-10">Belum ada aktivitas terekam</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'riwayat' && (
                    <div className="space-y-4">
                        {completedTasks.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center">
                                <BookOpen className="w-12 h-12 text-gray-200 mb-3" />
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Belum ada Bab Disetujui</h3>
                                <p className="text-gray-500 text-[10px]">
                                    Bab yang telah di-ACC akan muncul di tab ini.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {completedTasks.map(task => {
                                    const parsed = parseCatatan(task.catatan);
                                    return (
                                        <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[140px] flex flex-col justify-between">
                                            <div className="h-1.5 w-full bg-green-500 shrink-0"></div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">SELESAI</span>
                                                        {parsed.nilai !== null && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full shadow-sm">Nilai: {parsed.nilai}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">{task.topik}</h3>
                                            <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1.5 mt-auto pt-2">
                                                <Calendar className="w-3 h-3" /> ACC: {new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            <div className="flex gap-2 pt-3 border-t border-gray-50">
                                                {task.fileDosen && (
                                                    <a href={`${UPLOADS_URL}${task.fileDosen}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 text-green-700 rounded-md text-[10px] font-bold">
                                                        <Download className="w-3 h-3" /> Final
                                                    </a>
                                                )}
                                                {task.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                    <button onClick={() => handleOpenViewer(task.id, task.topik)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-[10px] font-bold">
                                                        <Eye className="w-3 h-3" /> Lihat
                                                    </button>
                                                )}
                                            </div>

                                            {/* History Accordion Mobile */}
                                            <div className="mt-3 pt-3 border-t border-gray-50">
                                                <button
                                                    onClick={() => setExpandedHistoryId(expandedHistoryId === task.id ? null : task.id)}
                                                    className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 hover:text-gray-900 focus:outline-none py-1.5 active:opacity-70"
                                                >
                                                    <span>Riwayat Revisi & Anotasi</span>
                                                    <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                        {allTasks.filter(t => t.topik === task.topik).length} Versi
                                                    </span>
                                                </button>
                                                {expandedHistoryId === task.id && (
                                                    <div className="mt-3 space-y-2 pl-1 border-l-2 border-gray-100 ml-1.5 max-h-60 overflow-y-auto pr-1">
                                                        {allTasks
                                                            .filter(t => t.topik === task.topik)
                                                            .sort((a, b) => b.versi - a.versi)
                                                            .map(item => (
                                                                <div key={item.id} className="relative pl-3">
                                                                    <div className={`absolute -left-[4px] top-1.5 w-1.5 h-1.5 rounded-full ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                                                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                                        <div className="flex justify-between items-start mb-1">
                                                                            <span className="font-bold text-[11px] text-gray-800">Versi {item.versi}</span>
                                                                            <span className="text-[9px] text-gray-400">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 mb-2">
                                                                            {item.status === 'APPROVED' ? 'Disetujui' : item.status === 'REVISION' ? <span className="text-orange-600">Revisi</span> : item.status === 'SUBMITTED' ? 'Menunggu Reviu' : 'Target'}
                                                                        </div>
                                                                        {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                                            <button onClick={() => handleOpenViewer(item.id, item.topik)} className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded w-full justify-center">
                                                                                <Eye className="w-3 h-3" /> Lihat Dokumen & Anotasi
                                                                            </button>
                                                                        )}
                                                                        {item.anotasi && item.anotasi.length > 0 && (
                                                                             <div className="mt-2 pt-2 border-t border-gray-200">
                                                                                 <span className="text-[9px] font-bold text-gray-600 mb-1 block">Terdapat {item.anotasi.length} Catatan:</span>
                                                                                 <div className="space-y-1">
                                                                                     {item.anotasi.map((ann: any, idx: number) => (
                                                                                         <div key={idx} className="bg-white p-1.5 rounded border border-orange-100 text-[9px] text-gray-700">
                                                                                             {ann.komentar}
                                                                                         </div>
                                                                                     ))}
                                                                                 </div>
                                                                             </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            </div>

            {/* Viewer Modal */}
            {viewingReview && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl shadow-xl w-full flex flex-col h-[90vh]">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Melihat Dokumen</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Topik: {viewingTaskTopik}</p>
                            </div>
                            <button onClick={() => setViewingReview(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 flex-1 relative min-h-[300px] overflow-hidden">
                            <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50"><LoaderIcon className="w-8 h-8 animate-spin text-[#119DA4]" /></div>}>
                                <SharedPdfViewer 
                                    url={`${UPLOADS_URL}${[...completedTasks, activeTask].find(t => t?.topik === viewingTaskTopik)?.fileMahasiswa || ''}`}
                                    initialHighlights={annotations}
                                    readOnly={true}
                                />
                            </Suspense>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
