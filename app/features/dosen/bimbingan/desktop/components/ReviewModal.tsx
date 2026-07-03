import React, { Suspense } from "react";
import { X, Eye, Download, FileText, Send, Loader2, FileStack } from "lucide-react";
import { SharedPdfViewer } from "../../../../components/SharedPdfViewer.client";
import { UPLOADS_URL } from "~/api/client";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useState, useEffect } from "react";

interface ReviewModalProps {
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

export const ReviewModal: React.FC<ReviewModalProps> = ({
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

    const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');
    const [previousAnnotations, setPreviousAnnotations] = useState<any[]>([]);

    useEffect(() => {
        if (reviewingTask?.id) {
            bimbinganApi.getPreviousAnnotations(reviewingTask.id)
                .then(data => setPreviousAnnotations(data || []))
                .catch(console.error);
        }
    }, [reviewingTask?.id]);

    const isApprovedReadOnly = reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[96vh] border border-white/20">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {isApprovedReadOnly ? "Arsip Dokumen Ter-ACC" : "Pemeriksaan Bimbingan"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-bold text-[#119DA4]">{viewingTaskTopik}</span>
                            {reviewingTask.keteranganProgres && (
                                <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span>Progres: {reviewingTask.keteranganProgres}</span>
                                </>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setReviewingTask(null)}
                        className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 flex flex-col xl:flex-row bg-gray-50/30">
                    {/* Document Viewer Area */}
                    {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                        <div className="flex-1 border-r border-gray-100 bg-gray-100/50 p-6 min-h-[500px]">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2.5">
                                    <div className="p-1.5 bg-cyan-50 rounded-lg">
                                        <Eye className="w-4 h-4 text-[#119DA4]" />
                                    </div>
                                    Live Document Viewer & Annotation
                                </h4>
                                <a
                                    href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                                    target="_blank" rel="noreferrer"
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                    <Download className="w-3.5 h-3.5" /> Buka Eksternal
                                </a>
                            </div>
                            <div className="h-[calc(100%-40px)] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                                <Suspense fallback={<div className="flex h-full items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-[#119DA4]" /></div>}>
                                    <SharedPdfViewer
                                        url={`${UPLOADS_URL}${[...completedTasks, studentActiveTask].find(t => t?.topik === viewingTaskTopik)?.fileMahasiswa || ''}`}
                                        initialHighlights={annotations}
                                        onAddHighlight={handleAddHighlight}
                                        onDeleteHighlight={handleDeleteHighlight}
                                        readOnly={isApprovedReadOnly}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 p-12 flex flex-col items-center justify-center bg-white">
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                <FileText className="w-10 h-10 text-gray-300" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">Pratinjau Tidak Tersedia</h4>
                            <p className="text-sm text-gray-500 text-center mb-8 max-w-md leading-relaxed">
                                Dokumen ini (<strong className="text-gray-700">.{reviewingTask.fileMahasiswa?.split('.').pop()}</strong>) tidak dapat di-preview dan dianotasi langsung. Fitur Live Annotation mendukung file <strong className="text-[#119DA4]">.pdf</strong>.
                            </p>
                            <a
                                href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                                target="_blank" rel="noreferrer"
                                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#119DA4] text-white font-bold rounded-2xl text-sm shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                            >
                                <Download className="w-5 h-5" /> Unduh Draf untuk Diperiksa
                            </a>
                        </div>
                    )}

                    {/* Sidebar Actions */}
                    {!isApprovedReadOnly && (
                        <div className="w-full xl:w-[400px] flex flex-col shrink-0 bg-white shadow-inner overflow-hidden border-l border-gray-200">
                            {/* Tab Headers */}
                            <div className="flex items-center border-b border-gray-200 bg-gray-50/50 shrink-0">
                                <button
                                    onClick={() => setActiveTab('review')}
                                    className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all ${activeTab === 'review' ? 'border-[#119DA4] text-[#119DA4] bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                                >
                                    Form Keputusan
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
                                >
                                    Riwayat Anotasi
                                    {previousAnnotations.length > 0 && (
                                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px]">
                                            {previousAnnotations.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                                {activeTab === 'review' ? (
                                    <>
                                        <div className="space-y-4">
                                            <label className="block text-sm font-bold text-gray-800 ml-1">Keputusan Reviu</label>
                                            <div className="grid grid-cols-1 gap-3">
                                                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/50 shadow-md' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'}`}>
                                                    <input
                                                        type="radio" name="status" value="REVISION"
                                                        checked={reviewStatus === "REVISION"}
                                                        onChange={() => setReviewStatus("REVISION")}
                                                        className="mt-1 w-5 h-5 text-orange-500 focus:ring-orange-500"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 block">Perlu Revisi</span>
                                                        <span className="text-[11px] text-gray-500 mt-1 block leading-relaxed">Mahasiswa harus memperbaiki dokumen berdasarkan masukan Anda.</span>
                                                    </div>
                                                </label>
                                                <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/50 shadow-md' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'}`}>
                                                    <input
                                                        type="radio" name="status" value="APPROVED"
                                                        checked={reviewStatus === "APPROVED"}
                                                        onChange={() => setReviewStatus("APPROVED")}
                                                        className="mt-1 w-5 h-5 text-green-600 focus:ring-green-600"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 block">Disetujui (ACC Target)</span>
                                                        <span className="text-[11px] text-gray-500 mt-1 block leading-relaxed">Target bab ini selesai dan mahasiswa dapat lanjut ke tahap berikutnya.</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-800 mb-3 ml-1">Catatan Keseluruhan (Opsional)</label>
                                                <textarea
                                                    className="w-full rounded-2xl border-gray-100 border-2 p-5 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 min-h-[140px] bg-gray-50/50 resize-y"
                                                    placeholder="Berikan masukan menyeluruh di luar anotasi PDF..."
                                                    value={reviewCatatan}
                                                    onChange={(e) => setReviewCatatan(e.target.value)}
                                                ></textarea>
                                            </div>

                                            {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                <div className="p-5 bg-blue-50/50 border-2 border-blue-100 rounded-2xl">
                                                    <label className="block text-sm font-bold text-blue-900 mb-2">Upload File Hasil Reviu</label>
                                                    <p className="text-[11px] text-blue-700/70 mb-4 leading-relaxed">Unggah dokumen yang sudah Anda beri komentar/coretan secara offline.</p>
                                                    <input
                                                        type="file"
                                                        accept=".doc,.docx,.pdf"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                setReviewFile(e.target.files[0]);
                                                            }
                                                        }}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer bg-white border border-blue-200 rounded-xl p-1 shadow-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className="mt-4 p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                                                <h4 className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">Versi Draf Anda Reviu</h4>
                                                <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                                                    <div>
                                                        <span className="font-bold text-gray-800 block text-sm">Versi {reviewingTask.versi}</span>
                                                        <span className="text-[10px] text-gray-400 block mt-1">{new Date(reviewingTask.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    {reviewingTask.fileMahasiswa && (
                                                        <a href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`} target="_blank" rel="noreferrer" className="p-2.5 text-blue-600 bg-blue-50 font-bold hover:bg-blue-100 rounded-xl transition-all" title="Unduh Draf">
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between ml-1">
                                            <label className="text-sm font-bold text-gray-800">Catatan dari Draf Sebelumnya</label>
                                        </div>

                                        {previousAnnotations.length === 0 ? (
                                            <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                                <p className="text-sm text-gray-500 font-medium">Belum ada riwayat anotasi pada target bimbingan ini.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {previousAnnotations.map((ann, idx) => {
                                                    const pos = typeof ann.posisi === 'string' ? JSON.parse(ann.posisi) : (ann.posisi || {});
                                                    const quote = pos.content?.text;
                                                    const pageNum = pos.position?.pageNumber;

                                                    return (
                                                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 hover:border-orange-300 transition-colors">
                                                            {pageNum && (
                                                                <div className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-[10px] font-bold mb-2">
                                                                    Halaman {pageNum}
                                                                </div>
                                                            )}
                                                            {quote && (
                                                                <div className="pl-3 border-l-2 border-orange-200 mb-3">
                                                                    <p className="text-xs text-gray-500 italic line-clamp-3">"{quote}"</p>
                                                                </div>
                                                            )}
                                                            <p className="text-sm text-gray-800 font-medium leading-relaxed">{ann.komentar}</p>
                                                            {ann.bimbinganVersi && (
                                                                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                                                    <span>Revisi v{ann.bimbinganVersi}</span>
                                                                    <span>{ann.tanggalBimbingan && new Date(ann.tanggalBimbingan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!isApprovedReadOnly && (
                    <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-4 shrink-0">
                        <button
                            onClick={() => setReviewingTask(null)}
                            className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleReviewSubmit}
                            disabled={uploadingReview}
                            className="px-10 py-3 text-sm font-bold text-white bg-[#D25026] hover:bg-[#B9441F] active:scale-95 transition-all rounded-2xl shadow-xl shadow-orange-500/20 flex items-center gap-2.5 disabled:opacity-50"
                        >
                            {uploadingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Kirim Hasil Reviu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
