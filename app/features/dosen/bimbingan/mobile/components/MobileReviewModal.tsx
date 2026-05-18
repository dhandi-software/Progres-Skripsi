import React, { Suspense } from "react";
import { X, Eye, Download, FileText, Send, Loader2, FileStack } from "lucide-react";
import { SharedPdfViewer } from "../../../../components/SharedPdfViewer.client";
import { UPLOADS_URL } from "~/api/client";

interface MobileReviewModalProps {
    reviewingTask: any;
    viewingTaskTopik: string;
    reviewStatus: string;
    setReviewStatus: (status: string) => void;
    reviewCatatan: string;
    setReviewCatatan: (catatan: string) => void;
    reviewFile: File | null;
    setReviewFile: (file: File | null) => void;
    annotations: any[];
    handleAddHighlight: (highlight: any) => void;
    handleDeleteHighlight: (id: string) => void;
    handleReviewSubmit: () => void;
    uploadingReview: boolean;
    setReviewingTask: (task: any) => void;
    completedTasks: any[];
    studentActiveTask: any;
}

export const MobileReviewModal: React.FC<MobileReviewModalProps> = ({
    reviewingTask,
    viewingTaskTopik,
    reviewStatus,
    setReviewStatus,
    reviewCatatan,
    setReviewCatatan,
    reviewFile,
    setReviewFile,
    annotations,
    handleAddHighlight,
    handleDeleteHighlight,
    handleReviewSubmit,
    uploadingReview,
    setReviewingTask,
    completedTasks,
    studentActiveTask
}) => {
    if (!reviewingTask) return null;

    const isApprovedReadOnly = reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED';

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-bold text-gray-900 truncate">
                        {isApprovedReadOnly ? "Arsip Reviu" : "Pemeriksaan Dokumen"}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">
                        {viewingTaskTopik}
                    </p>
                </div>
                <button 
                    onClick={() => setReviewingTask(null)} 
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
                {/* PDF Viewer Section */}
                {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                    <div className="p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-cyan-50 rounded-lg">
                                    <Eye className="w-4 h-4 text-[#119DA4]" />
                                </div>
                                <span className="text-[11px] font-bold text-gray-600">Dokumen Utama</span>
                            </div>
                            <a 
                                href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`} 
                                target="_blank" rel="noreferrer" 
                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-bold text-blue-600 shadow-sm"
                            >
                                <Download className="w-3 h-3 inline mr-1" /> Unduh
                            </a>
                        </div>
                        
                        <div className="h-[450px] w-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white relative">
                            <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#119DA4]" /></div>}>
                                <SharedPdfViewer 
                                    url={`${UPLOADS_URL}${[...completedTasks, studentActiveTask].find(t => t?.topik === viewingTaskTopik)?.fileMahasiswa || ''}`}
                                    initialHighlights={annotations}
                                    onAddHighlight={handleAddHighlight}
                                    onDeleteHighlight={handleDeleteHighlight}
                                    readOnly={isApprovedReadOnly}
                                />
                            </Suspense>
                        </div>
                        <p className="text-[9px] text-gray-400 text-center italic">Ketuk dan tahan untuk memilih teks guna memberikan anotasi.</p>
                    </div>
                ) : (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2">Pratinjau Tidak Tersedia</h4>
                        <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
                            File ini (.{reviewingTask.fileMahasiswa?.split('.').pop()}) hanya bisa diperiksa secara offline.
                        </p>
                        <a 
                            href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`} 
                            target="_blank" rel="noreferrer" 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#119DA4] text-white font-bold rounded-xl text-[11px] shadow-lg shadow-cyan-500/20"
                        >
                            <Download className="w-4 h-4" /> Unduh Dokumen
                        </a>
                    </div>
                )}

                {/* Review Actions Section */}
                {!isApprovedReadOnly && (
                    <div className="p-6 bg-white border-t border-gray-100 space-y-8">
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Keputusan Reviu</label>
                            <div className="grid grid-cols-1 gap-3">
                                <button 
                                    onClick={() => setReviewStatus("REVISION")}
                                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-50 bg-gray-50/30'}`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                                        {reviewStatus === 'REVISION' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-gray-900 block">Perlu Revisi</span>
                                        <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">Mahasiswa akan diminta memperbaiki berdasarkan anotasi Anda.</span>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => setReviewStatus("APPROVED")}
                                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/50' : 'border-gray-50 bg-gray-50/30'}`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                                        {reviewStatus === 'APPROVED' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <div>
                                        <span className="text-[13px] font-bold text-gray-900 block">Setujui (ACC)</span>
                                        <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">Target progres ini dianggap selesai dan mahasiswa dapat lanjut.</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Catatan Keseluruhan</label>
                            <textarea 
                                className="w-full rounded-2xl border-gray-100 border-2 p-4 text-sm focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 min-h-[120px] bg-gray-50/50"
                                placeholder="Tuliskan masukan tambahan di sini..."
                                value={reviewCatatan}
                                onChange={(e) => setReviewCatatan(e.target.value)}
                            ></textarea>
                        </div>

                        {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                            <div className="p-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl space-y-4">
                                <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider">Upload Hasil Reviu</label>
                                <input 
                                    type="file" 
                                    accept=".doc,.docx,.pdf" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setReviewFile(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full text-[10px] text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {!isApprovedReadOnly && (
                <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3 sticky bottom-0">
                    <button 
                        onClick={() => setReviewingTask(null)}
                        className="py-3.5 text-sm font-bold text-gray-500 bg-gray-50 rounded-2xl active:bg-gray-100"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleReviewSubmit}
                        disabled={uploadingReview}
                        className="py-3.5 text-sm font-bold text-white bg-[#D25026] rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
                    >
                        {uploadingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Kirim Reviu
                    </button>
                </div>
            )}
        </div>
    );
};
