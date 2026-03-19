import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { BookOpen, Calendar, Clock, Loader2, CheckCircle2, ChevronLeft, FileText, Upload, Download, AlertCircle } from "lucide-react";
import { Link } from "react-router";

export function BimbinganMobile() {
    const [activeTask, setActiveTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchTask = () => {
        bimbinganApi.getMahasiswaActiveTask()
            .then(task => setActiveTask(task))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchTask();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!activeTask || !selectedFile) return;
        setUploading(true);
        try {
            await bimbinganApi.uploadDraftMahasiswa(activeTask.id, selectedFile);
            alert("File berhasil diunggah!");
            setSelectedFile(null);
            fetchTask();
        } catch (error) {
            console.error(error);
            alert("Gagal mengunggah file.");
        } finally {
            setUploading(false);
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
                                    
                                    <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-[11px] text-gray-500 mb-6">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Mulai: {new Date(activeTask.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                            </div>
                                        )}

                                        {(activeTask.status === 'ASSIGNED' || activeTask.status === 'REVISION') && (
                                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-3 text-left">
                                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                                    Form Pengumpulan Draf (.doc/docx)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                                    onChange={handleFileChange}
                                                    className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer mb-2"
                                                />
                                                {selectedFile && (
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
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Judul Disetujui</p>
                            <p className="text-xs text-gray-500 mt-0.5">Memulai fase bimbingan laporan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
