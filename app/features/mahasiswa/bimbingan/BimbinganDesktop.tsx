import { useState, useEffect, lazy, Suspense } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { BookOpen, Calendar, Clock, Loader2, CheckCircle2, FileText, Upload, Download, AlertCircle, FileStack, Eye, X } from "lucide-react";
import { Loader2 as LoaderIcon } from "lucide-react";

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
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat">("aktif");
    const [activeTask, setActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [keteranganProgres, setKeteranganProgres] = useState("");
    const [uploading, setUploading] = useState(false);
    
    // Viewer Modal State
    const [viewingReview, setViewingReview] = useState(false);
    const [viewingTaskTopik, setViewingTaskTopik] = useState("");
    const [annotations, setAnnotations] = useState<any[]>([]);

    const [history, setHistory] = useState<any[]>([]);

    const fetchTask = () => {
        bimbinganApi.getMahasiswaAllTasks()
            .then(tasks => {
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
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTask();
    }, []);

    useEffect(() => {
        if (activeTask) {
            bimbinganApi.getBimbinganHistory(activeTask.mahasiswaId, activeTask.topik)
                .then(data => setHistory(data))
                .catch(err => console.error(err));
        }
    }, [activeTask]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!activeTask || !selectedFile) return;
        setUploading(true);
        try {
            await bimbinganApi.uploadDraftMahasiswa(activeTask.id, selectedFile, keteranganProgres);
            alert("Berhasil mengunggah dokumen bimbingan!");
            setSelectedFile(null);
            setKeteranganProgres("");
            fetchTask();
        } catch (error) {
            console.error(error);
            alert("Gagal mengunggah file.");
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
                return {
                    id: String(a.id),
                    ...pos
                };
            });
            setAnnotations(formatted);
        } catch (error) {
            console.error(error);
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
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-geist">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-[#119DA4]" />
                    Dashboard Bimbingan
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Pantau target tugas dari dosen pembimbing dan unggah hasil pengerjaanmu di sini.
                </p>
            </div>

            <div className="mb-6 flex space-x-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("aktif")}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'aktif' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Target Aktif
                </button>
                <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Riwayat Selesai
                </button>
            </div>

            {activeTab === 'aktif' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Assignment Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
                            {/* Decorative Top Banner */}
                            <div className="h-1.5 w-full bg-[#119DA4]"></div>
                            
                            <div className="p-8">
                                {activeTask ? (
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                                                <FileText className="w-6 h-6 text-pink-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 leading-tight flex items-center gap-3">
                                                Mengerjakan {activeTask.topik}
                                            </h2>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-6 border-b border-gray-100 pb-6">
                                            Silakan kumpulkan draf laporan Anda dalam bentuk PDF untuk mendapatkan reviu dari dosen pembimbing.
                                        </p>

                                        {activeTask.status === 'REVISION' && (
                                            <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0">
                                                    <AlertCircle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-orange-800 font-bold text-base">Revisi Diperlukan</h3>
                                                    <p className="text-orange-700 text-sm mt-1 mb-3">
                                                        Dosen pembimbing telah memeriksa draf Anda dan memberikan catatan revisi. Silakan periksa bagian <b>Komentar & Catatan</b> di bawah, lihat anotasi dokumen jika ada, lalu unggah draf perbaikan Anda.
                                                    </p>
                                                    {activeTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                        <button 
                                                            onClick={() => handleOpenViewer(activeTask.id, activeTask.topik)}
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                                        >
                                                            <Eye className="w-4 h-4" /> Lihat Anotasi Dokumen
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {(activeTask.status === 'ASSIGNED' || activeTask.status === 'REVISION') && (
                                            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Form Pengumpulan Draf (.pdf, .doc, .docx)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                                    onChange={handleFileChange}
                                                    disabled={getTimeRemaining(activeTask.jadwalBimbingan).isLate}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#e6f4f5] file:text-[#119DA4] hover:file:bg-[#d0ebed] cursor-pointer disabled:opacity-50 mb-4 bg-white border border-gray-200 p-2 rounded-lg"
                                                />
                                                <label className="block text-sm font-bold text-gray-700 mb-2 mt-4">
                                                    Ringkasan Progres (Opsional)
                                                </label>
                                                <textarea 
                                                    value={keteranganProgres}
                                                    onChange={(e) => setKeteranganProgres(e.target.value)}
                                                    placeholder="Tuliskan ringkasan bagian apa saja yang sudah kamu kerjakan..."
                                                    className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#119DA4] bg-white"
                                                />
                                                
                                                {getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <div className="mt-4 text-xs text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                        Waktu pengumpulan telah berakhir. Kamu tidak dapat mengirimkan draf lagi.
                                                    </div>
                                                )}
                                                {selectedFile && !getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <button 
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="mt-6 w-full py-3 bg-[#4267B2] hover:bg-[#365899] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                                                    >
                                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                        KIRIMKAN PENGAJUAN (DRAF)
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <h3 className="text-lg font-bold text-gray-800 mb-4 bg-gray-50 p-3 border border-gray-200 rounded-t-lg border-b-0">Status pengajuan tugas</h3>
                                        <div className="border border-gray-200 rounded-b-lg overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <tbody className="divide-y divide-gray-200">
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Status pengajuan</th>
                                                        <td className="py-4 px-6 text-gray-900 bg-white font-medium">{getStatusPengajuan(activeTask.status)}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Status penilaian</th>
                                                        <td className="py-4 px-6 text-gray-900 bg-white font-medium">{getStatusPenilaian(activeTask.status)}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Waktu tersisa</th>
                                                        <td className={`py-4 px-6 bg-white font-medium ${getTimeRemaining(activeTask.jadwalBimbingan).isLate ? 'text-red-600' : 'text-gray-900'}`}>{getTimeRemaining(activeTask.jadwalBimbingan).text}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Batas akhir pengumpulan</th>
                                                        <td className="py-4 px-6 text-gray-900 bg-white font-medium">{activeTask.jadwalBimbingan ? new Date(activeTask.jadwalBimbingan).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Terakhir diubah</th>
                                                        <td className="py-4 px-6 text-gray-900 bg-white font-medium">{new Date(activeTask.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</td>
                                                    </tr>
                                                    <tr className="bg-gray-50/50">
                                                        <th className="py-4 px-6 font-bold text-gray-700 w-1/3 border-r border-gray-200">Komentar & Catatan</th>
                                                        <td className="py-4 px-6 text-gray-900 bg-white">
                                                            {activeTask.catatan && activeTask.catatan !== "Task Assigned" ? (
                                                                <div className="p-3 bg-orange-50 rounded border border-orange-100 text-orange-800 text-sm">
                                                                    "{activeTask.catatan}"
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Belum ada komentar</span>
                                                            )}
                                                            
                                                            {activeTask.fileDosen && (
                                                                <a href={`http://localhost:5002${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-bold transition-colors">
                                                                    <Download className="w-4 h-4" /> Unduh File Reviu
                                                                </a>
                                                            )}
                                                            {activeTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && activeTask.status === 'REVISION' && (
                                                                <button onClick={() => handleOpenViewer(activeTask.id, activeTask.topik)} className="mt-3 ml-2 flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-xs font-bold transition-colors">
                                                                    <Eye className="w-4 h-4" /> Lihat Anotasi Dokumen
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center flex flex-col items-center">
                                        <CheckCircle2 className="w-16 h-16 text-gray-200 mb-4" />
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada tugas aktif</h3>
                                        <p className="text-gray-500 text-sm">
                                            Dosen pembimbing belum memberikan target tugas untuk diselesaikan. Silakan tunggu instruksi selanjutnya.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Sidebar (Only visible if activeTask exists) */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden relative">
                             <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Riwayat Versi Draf ({activeTask?.topik || 'Target Aktif'})</h2>
                             
                             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                {history.length > 0 ? (
                                    history.map((item, index) => (
                                        <div key={item.id} className="relative flex items-center group is-active gap-4">
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 text-white ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-[#119DA4]'}`}>
                                                {item.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : item.status === 'REVISION' ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-[#119DA4]/30">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="font-bold text-gray-800 text-sm">Versi {item.versi}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {item.status === 'ASSIGNED' && <p>Tugas diberikan</p>}
                                                    {item.status === 'SUBMITTED' && <p>Draf diunggah</p>}
                                                    {item.status === 'REVISION' && <p className="text-orange-600 font-medium">Perlu revisi</p>}
                                                    {item.status === 'APPROVED' && <p className="text-green-600 font-medium">Disetujui (ACC)</p>}
                                                    
                                                    {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                        <a href={`http://localhost:5002${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="inline-block mt-1.5 font-bold text-blue-600 hover:text-blue-700">
                                                            Unduh File PDF
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-sm text-gray-400 py-4 italic">{activeTask ? "Riwayat versi akan muncul di sini." : "Belum ada tugas"}</div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'riwayat' && (
                <div className="space-y-6">
                    {completedTasks.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center flex flex-col items-center">
                            <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada target yang disetujui</h3>
                            <p className="text-gray-500 text-sm ">
                                Target bimbingan (Bab) yang telah di-ACC oleh dosen pembimbing akan muncul di tab ini.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedTasks.map(task => (
                                <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-2 w-full bg-green-500"></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">SELESAI (ACC)</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{task.topik}</h3>
                                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> Disetujui: {new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                                            {task.fileDosen && (
                                                <a href={`http://localhost:5002${task.fileDosen}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors">
                                                    <Download className="w-4 h-4" /> File Final (Dosen)
                                                </a>
                                            )}
                                            {task.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                <button onClick={() => handleOpenViewer(task.id, task.topik)} className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors">
                                                    <Eye className="w-4 h-4" /> Lihat Dokumen (ACC)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Viewer Modal */}
            {viewingReview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[96vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Melihat Dokumen: {viewingTaskTopik}</h3>
                            </div>
                            <button onClick={() => setViewingReview(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 flex-1 relative min-h-[500px]">
                            <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50"><LoaderIcon className="w-8 h-8 animate-spin text-[#119DA4]" /></div>}>
                                <SharedPdfViewer 
                                    url={`http://localhost:5002${[...completedTasks, activeTask].find(t => t?.topik === viewingTaskTopik)?.fileMahasiswa || ''}`}
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
