import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { BookOpen, Calendar, Clock, Loader2, CheckCircle2, FileText, Upload, Download, AlertCircle, FileStack } from "lucide-react";

export function BimbinganDesktop() {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Assignment Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
                        {/* Decorative Top Banner */}
                        <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-[#D25026]"></div>
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    Prioritas Saat Ini
                                </h2>
                                {activeTask && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                        Sedang Dikerjakan
                                    </span>
                                )}
                            </div>

                            {activeTask ? (
                                <div className="space-y-6 flex flex-col items-center text-center py-6">
                                    <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-orange-100">
                                        <FileText className="w-10 h-10 text-orange-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest block mb-2">Instruksi Dosen Pembimbing</span>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{activeTask.topik}</h3>
                                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                <Calendar className="w-4 h-4" />
                                                Diberikan: {new Date(activeTask.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="w-full pt-6 border-t border-gray-100 flex flex-col gap-4 mt-6">
                                        {activeTask.status === 'SUBMITTED' && (
                                            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start gap-3 text-left">
                                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                                                <div>
                                                    <h4 className="font-bold text-sm">Sedang Direviu oleh Dosen</h4>
                                                    <p className="text-xs mt-1 text-blue-600/80">
                                                        Draf dokumen kamu telah berhasil diunggah dan sedang menuggu pemeriksaan.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {activeTask.status === 'APPROVED' && (
                                            <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-100 flex items-start gap-3 text-left">
                                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                                                <div>
                                                    <h4 className="font-bold text-sm">Target Disetujui!</h4>
                                                    <p className="text-xs mt-1 text-green-600/80">
                                                        Bab ini telah disetujui oleh dosen pembimbing.
                                                    </p>
                                                    {activeTask.catatan && (
                                                        <div className="mt-3 p-3 bg-white/60 rounded-lg text-xs italic">
                                                            "{activeTask.catatan}"
                                                        </div>
                                                    )}
                                                    {activeTask.fileDosen && (
                                                        <a href={`http://localhost:5002${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors">
                                                            <Download className="w-4 h-4" /> Unduh Dokumen (ACC)
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {activeTask.status === 'REVISION' && (
                                            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 flex items-start gap-3 text-left">
                                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                                                <div className="w-full">
                                                    <h4 className="font-bold text-sm">Perlu Revisi</h4>
                                                    <p className="text-xs mt-1 text-red-600/80">
                                                        Dosen meminta revisi pada bagian tertentu. Baca catatan dan unduh file reviu untuk detailnya.
                                                    </p>
                                                    {activeTask.catatan && (
                                                        <div className="mt-3 p-3 bg-white/60 rounded-lg text-xs font-medium border border-red-50">
                                                            Catatan Dosen: <br/>"{activeTask.catatan}"
                                                        </div>
                                                    )}
                                                    {activeTask.fileDosen && (
                                                        <a href={`http://localhost:5002${activeTask.fileDosen}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors">
                                                            <Download className="w-4 h-4" /> Unduh File Reviu
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {(activeTask.status === 'ASSIGNED' || activeTask.status === 'REVISION') && (
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 text-left transition-colors hover:border-orange-300">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Form Pengumpulan Draf (.doc, .docx)
                                                </label>
                                                <input 
                                                    type="file" 
                                                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                                                    onChange={handleFileChange}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                                                />
                                                {selectedFile && (
                                                    <button 
                                                        onClick={handleUpload}
                                                        disabled={uploading}
                                                        className="mt-4 w-full py-3 bg-[#D25026] hover:bg-[#B9441F] disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                                    >
                                                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                                        Upload Dokumen
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        <button className="w-full py-3 bg-white text-gray-600 font-bold rounded-xl border-2 border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                                            Ada Pertanyaan? Hubungi Dosen
                                        </button>
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

                {/* Milestones / History Placeholder */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-gray-50 rounded-bl-full -z-10"></div>
                         <h2 className="text-lg font-bold text-gray-800 mb-6">Perjalanan Bimbingan</h2>
                         
                         <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                             {/* Judul Diacc Step */}
                             <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-white">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="font-bold text-gray-800 text-sm">Judul Disetujui</div>
                                    <div className="text-xs text-gray-500 mt-1">Mulai fase bimbingan</div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
