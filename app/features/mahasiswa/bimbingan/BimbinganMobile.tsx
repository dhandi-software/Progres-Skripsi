import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { BookOpen, Calendar, Clock, Loader2, CheckCircle2, ChevronLeft, FileText, Upload, Download, AlertCircle, Eye, X } from "lucide-react";
import { Link } from "react-router";
import { lazy, Suspense } from "react";
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

export function BimbinganMobile() {
    const [activeTask, setActiveTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [keteranganProgres, setKeteranganProgres] = useState("");
    const [uploading, setUploading] = useState(false);

    // Viewer Modal State
    const [viewingReview, setViewingReview] = useState(false);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    const fetchTask = () => {
        bimbinganApi.getMahasiswaActiveTask()
            .then(task => setActiveTask(task))
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
            alert("File berhasil diunggah!");
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

    const handleOpenViewer = async () => {
        setViewingReview(true);
        setAnnotations([]);
        if (activeTask) {
            try {
                const data = await bimbinganApi.getAnnotations(activeTask.id);
                const formatted = data.map((a: any) => {
                    const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                    return { id: String(a.id), ...pos };
                });
                setAnnotations(formatted);
            } catch (error) {
                console.error(error);
            }
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
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <Link to="/mahasiswa/dashboard" className="p-2 -ml-2 text-gray-600">
                    <ChevronLeft size={24} />
                 </Link>
                 <h1 className="text-lg font-bold text-gray-900">Bimbingan</h1>
            </div>

            <div className="p-4 space-y-4 mt-2">
                {/* Active Assignment Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
                    <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-[#D25026]"></div>
                    
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Prioritas Saat Ini
                            </h2>
                            {activeTask && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                    Aktif
                                </span>
                            )}
                        </div>

                        {activeTask ? (
                            <div className="flex flex-col items-center text-center py-2">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-orange-100">
                                    <FileText className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="w-full">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Instruksi Terbaru</span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{activeTask.topik}</h3>
                                    
                                    <div className="grid grid-cols-2 gap-2 mt-4 w-full text-left border-t border-gray-100 pt-4 mb-4">
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                            <div className="text-[10px] text-gray-500 font-medium mb-0.5">Status Pengajuan</div>
                                            <div className="text-xs font-bold text-gray-900 leading-tight">{getStatusPengajuan(activeTask.status)}</div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                            <div className="text-[10px] text-gray-500 font-medium mb-0.5">Status Penilaian</div>
                                            <div className="text-xs font-bold text-gray-900 leading-tight">{getStatusPenilaian(activeTask.status)}</div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                            <div className="text-[10px] text-gray-500 font-medium mb-0.5">Waktu Tersisa</div>
                                            <div className={`text-xs font-bold leading-tight ${getTimeRemaining(activeTask.jadwalBimbingan).isLate ? 'text-red-600' : getTimeRemaining(activeTask.jadwalBimbingan).isWarning ? 'text-orange-600' : 'text-gray-900'}`}>
                                                {getTimeRemaining(activeTask.jadwalBimbingan).text}
                                            </div>
                                            <div className="text-[9px] text-gray-400 mt-0.5">Batas: {activeTask.jadwalBimbingan ? new Date(activeTask.jadwalBimbingan).toLocaleDateString('id-ID') : '-'}</div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                                            <div className="text-[10px] text-gray-500 font-medium mb-0.5">Terakhir Diubah</div>
                                            <div className="text-xs font-bold text-gray-900 leading-tight">{new Date(history.length > 0 ? history[0].tanggal : activeTask.tanggal).toLocaleDateString('id-ID')}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-3 w-full border-t border-gray-100 mt-2 pt-4">
                                        {activeTask.status === 'SUBMITTED' && (
                                            <div className="bg-blue-50 text-blue-800 p-3.5 rounded-xl border border-blue-100 flex flex-col gap-2 text-left">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-blue-600" />
                                                    <h4 className="font-bold text-xs">Sedang Direviu oleh Dosen</h4>
                                                </div>
                                                <p className="text-[10px] text-blue-600/80 leading-relaxed">
                                                    Draf dokumen kamu telah berhasil diunggah dan sedang menuggu pemeriksaan.
                                                </p>
                                            </div>
                                        )}

                                        {activeTask.status === 'APPROVED' && (
                                            <div className="bg-green-50 text-green-800 p-3.5 rounded-xl border border-green-100 flex flex-col gap-2 text-left">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <h4 className="font-bold text-xs">Target Disetujui!</h4>
                                                </div>
                                                <p className="text-[10px] text-green-600/80 leading-relaxed">
                                                    Bab ini telah disetujui oleh dosen pembimbing.
                                                </p>
                                                {activeTask.catatan && (
                                                    <div className="mt-1 p-2 bg-white/60 rounded-md text-[10px] italic">
                                                        "{activeTask.catatan}"
                                                    </div>
                                                )}
                                                {activeTask.fileDosen && (
                                                    <a href={`http://localhost:5002${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-2 text-center w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                                        <Download className="w-3.5 h-3.5" /> Unduh Dokumen (ACC)
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {activeTask.status === 'REVISION' && (
                                            <div className="bg-red-50 text-red-800 p-3.5 rounded-xl border border-red-100 flex flex-col gap-2 text-left">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                    <h4 className="font-bold text-xs">Perlu Revisi</h4>
                                                </div>
                                                <p className="text-[10px] text-red-600/80 leading-relaxed">
                                                    Dosen meminta revisi. Baca catatan dan unduh file reviu untuk detailnya.
                                                </p>
                                                {activeTask.catatan && (
                                                    <div className="mt-1 p-2 bg-white/60 rounded-md text-[10px] font-medium border border-red-50 leading-relaxed">
                                                        Catatan Dosen: <br/>"{activeTask.catatan}"
                                                    </div>
                                                )}
                                                {activeTask.fileDosen && (
                                                    <a href={`http://localhost:5002${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-2 text-center w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                                        <Download className="w-3.5 h-3.5" /> Unduh File Reviu
                                                    </a>
                                                )}
                                                {activeTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                    <button onClick={handleOpenViewer} className="mt-2 text-center w-full py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                                        <Eye className="w-3.5 h-3.5" /> Lihat Sorotan & Anotasi
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {(activeTask.status === 'ASSIGNED' || activeTask.status === 'REVISION') && (
                                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 text-left">
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Form Pengumpulan Draf (.pdf, .docx)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                                    onChange={handleFileChange}
                                                    disabled={getTimeRemaining(activeTask.jadwalBimbingan).isLate}
                                                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer disabled:opacity-50 mb-3"
                                                />
                                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                    Ringkasan Progres
                                                </label>
                                                <textarea 
                                                    className="w-full rounded-lg border-gray-200 border p-2 text-[10px] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 min-h-[60px] mb-2"
                                                    placeholder="Deskripsikan pekerjaan / perbaikan yang telah dilakukan pada draf ini..."
                                                    value={keteranganProgres}
                                                    onChange={(e) => setKeteranganProgres(e.target.value)}
                                                ></textarea>

                                                {getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <div className="mt-1 mb-2 text-[10px] text-red-600 font-medium bg-red-50 p-2 rounded border border-red-100 flex items-start gap-1.5">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                        Waktu telah berakhir. Tidak dapat mengirim draf.
                                                    </div>
                                                )}

                                                {selectedFile && !getTimeRemaining(activeTask.jadwalBimbingan).isLate && (
                                                    <button 
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="w-full py-2.5 bg-[#D25026] hover:bg-[#B9441F] disabled:opacity-50 text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5"
                                                    >
                                                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                        Upload Dokumen
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        <button className="w-full py-2.5 bg-white text-gray-600 font-bold rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all text-xs">
                                            Tanya Dosen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center flex flex-col items-center">
                                <CheckCircle2 className="w-12 h-12 text-gray-200 mb-3" />
                                <h3 className="text-sm font-bold text-gray-800 mb-1">Belum ada tugas</h3>
                                <p className="text-gray-500 text-xs px-4">
                                    Dosen pembimbing belum memberikan target tugas. Tunggu instruksi di halaman ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 text-sm mb-4">Riwayat Progress</h3>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200">
                        {history.length > 0 ? history.map((item, index) => (
                            <div key={item.id} className="relative flex items-start gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow shrink-0 z-10 text-white ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                    {item.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.status === 'REVISION' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-full mt-1">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="font-bold text-gray-800 text-xs">Versi {item.versi}</div>
                                        <div className="text-[9px] text-gray-400 font-medium">
                                            {new Date(item.tanggal).toLocaleDateString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 space-y-1">
                                        {item.status === 'ASSIGNED' && <p>Dosen memberikan target tugas.</p>}
                                        {item.status === 'SUBMITTED' && <p>Mengunggah draf ke sistem.</p>}
                                        {item.status === 'REVISION' && <p className="text-orange-600 font-medium">Dosen mengembalikan draf untuk diperbaiki.</p>}
                                        {item.status === 'APPROVED' && <p className="text-green-600 font-medium">Target Bab disetujui (ACC).</p>}
                                        
                                        {item.keteranganProgres && (
                                            <div className="mt-1.5 p-1.5 bg-white border border-gray-100 rounded italic text-gray-600 line-clamp-2">
                                                "{item.keteranganProgres}"
                                            </div>
                                        )}
                                        
                                        {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                            <a href={`http://localhost:5002${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="inline-block mt-1 font-bold text-blue-600 active:text-blue-700">
                                                Unduh versi ini
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-[10px] text-gray-400 italic ml-10">Belum ada aktivitas terekam</div>
                        )}

                        {/* Awal Timeline */}
                        <div className="relative flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full border-4 border-white bg-green-500 flex items-center justify-center shrink-0 z-10 text-white">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="mt-1">
                                <p className="text-xs font-bold text-gray-900">Judul Disetujui</p>
                                <p className="text-[10px] text-gray-500">Memulai fase bimbingan laporan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Viewer Modal */}
            {viewingReview && activeTask && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl shadow-xl w-full flex flex-col h-[90vh]">
                        <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Catatan Reviu Dosen</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Topik: {activeTask.topik}</p>
                            </div>
                            <button onClick={() => setViewingReview(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="bg-gray-50 flex-1 relative min-h-[500px] overflow-hidden">
                            <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50"><LoaderIcon className="w-8 h-8 animate-spin text-orange-500" /></div>}>
                                <SharedPdfViewer 
                                    url={`http://localhost:5002${activeTask.fileMahasiswa}`}
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
