import React from "react";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, Download, FileText, User, GraduationCap, Lock, Eye, Users } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { PenugasanPengujiView } from "~/features/dosen/penilaian/desktop/components/PenugasanPengujiView";
import { BimbinganSayaView } from "~/features/dosen/penilaian/desktop/components/BimbinganSayaView";
import { DiujiOlehSayaView } from "~/features/dosen/penilaian/desktop/components/DiujiOlehSayaView";

import { usePenilaian } from "~/hooks/usePenilaian";
import { getGrade, formatNilai } from "../types/penilaian";
export type { PenilaianItem, FormState, ConfirmModalState } from "../types/penilaian";
export { getGrade, formatNilai };

export function PenilaianDesktop({ title }: { title: string }) {
    const {
        user,
        data,
        isLoading,
        form,
        setForm,
        isSaving,
        suratTugasFile,
        setSuratTugasFile,
        suratTugasPreviewUrl,
        searchQuery,
        setSearchQuery,
        toast,
        deleteConfirm,
        setDeleteConfirm,
        dosenList,
        isKoordinator,
        assigningId,
        confirmModal,
        setConfirmModal,
        openDropdownId,
        setOpenDropdownId,
        isLowVision,
        setIsLowVision,
        selectedPembimbingId,
        setSelectedPembimbingId,
        activeTab,
        setActiveTab,
        handleAssignPenguji,
        handleAssignPengujiBulk,
        handleCancelPenguji,
        handleCancelPengujiBulk,
        openForm,
        handleSave,
        handleDelete,
        supervisedStudents,
        examinedStudents,
        calcP1Total,
        calcP2Total,
        canEditP1,
        canEditP2
    } = usePenilaian();

    return (
        <div className={cn(
            "flex flex-col min-h-full transition-all duration-200 font-['Noto_Sans']",
            isLowVision ? "bg-slate-100 text-black p-4" : "bg-slate-50/50 p-6 md:p-8"
        )}>
            {/* Accessibility / High Contrast Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className={cn("text-2xl font-black tracking-tight", isLowVision ? "text-3xl text-black" : "text-slate-900")}>
                        {title}
                    </h1>
                    <p className={cn("text-xs mt-1", isLowVision ? "text-base text-black font-extrabold" : "text-slate-500")}>
                        Kelola data penilaian kerja praktik mahasiswa bimbingan & pengujian.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLowVision(!isLowVision)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm",
                            isLowVision
                                ? "bg-black text-white border-black hover:bg-slate-800 text-sm font-black"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        <span>👁️‍🗨️ Mode Kontras Tinggi:</span>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase", isLowVision ? "bg-white text-black" : "bg-slate-100 text-slate-600")}>
                            {isLowVision ? "Aktif" : "Non-aktif"}
                        </span>
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            {toast && (
                <div className={cn(
                    "fixed top-6 right-6 z-[1050] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-bold border",
                    toast.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-red-50 text-red-800 border-red-200"
                )}>
                    {toast.type === "success" ? <CheckCircle size={16} className="text-emerald-600" /> : <AlertCircle size={16} className="text-red-600" />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 pb-3">
                {isKoordinator && (
                    <button
                        onClick={() => setActiveTab("koordinator")}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border",
                            activeTab === "koordinator"
                                ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4] shadow-md shadow-[#119DA4]/20")
                                : (isLowVision ? "bg-white text-black border-black" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
                        )}
                    >
                        <GraduationCap size={15} />
                        <span>Penugasan Penguji (Koordinator)</span>
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("pembimbing")}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border",
                        activeTab === "pembimbing"
                            ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4] shadow-md shadow-[#119DA4]/20")
                            : (isLowVision ? "bg-white text-black border-black" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
                    )}
                >
                    <User size={15} />
                    <span>Bimbingan Saya ({supervisedStudents.length})</span>
                </button>
                <button
                    onClick={() => setActiveTab("penguji")}
                    className={cn(
                        "px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 border",
                        activeTab === "penguji"
                            ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4] shadow-md shadow-[#119DA4]/20")
                            : (isLowVision ? "bg-white text-black border-black" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")
                    )}
                >
                    <Users size={15} />
                    <span>Diuji Oleh Saya ({examinedStudents.length})</span>
                </button>
            </div>

            {/* Loading Indicator */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#119DA4] border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-xs font-bold text-slate-400">Memuat data penilaian...</span>
                </div>
            ) : (
                <>
                    {/* View Switcher based on Active Tab */}
                    {activeTab === "koordinator" && (
                        <PenugasanPengujiView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            assigningId={assigningId}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            onAssignPenguji={handleAssignPenguji}
                            onCancelPenguji={handleCancelPenguji}
                            onOpenForm={openForm}
                            onDeleteConfirm={(item) => setDeleteConfirm(item)}
                            setConfirmModal={setConfirmModal}
                            onCancelPengujiBulk={handleCancelPengujiBulk}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}

                    {activeTab === "pembimbing" && (
                        <BimbinganSayaView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            onOpenForm={openForm}
                            onDeleteConfirm={(item) => setDeleteConfirm(item)}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}

                    {activeTab === "penguji" && (
                        <DiujiOlehSayaView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            onOpenForm={openForm}
                            onDeleteConfirm={(item) => setDeleteConfirm(item)}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}
                </>
            )}

            {/* ===== EDIT FORM MODAL ===== */}
            {form && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn(
                        "rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 w-full max-w-6xl lg:w-[1100px] xl:w-[1200px] min-w-[320px] md:min-w-[850px] shrink-0 max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-200",
                        isLowVision ? "bg-white border-4 border-black text-black" : "bg-white"
                    )}>
                        <div className="flex justify-between items-center mb-8 pb-5 border-b border-slate-100">
                            <div>
                                <h2 className={cn("text-xl md:text-2xl font-black", isLowVision ? "text-3xl text-black" : "text-slate-900")}>
                                    Form Input Penilaian Kerja Praktik
                                </h2>
                                <p className={cn("text-sm font-medium mt-1", isLowVision ? "text-lg text-black font-extrabold" : "text-slate-500")}>
                                    Mahasiswa: <strong className="text-slate-900">{form.nama}</strong> ({form.nim})
                                </p>
                            </div>
                            <button
                                onClick={() => setForm(null)}
                                className={cn("p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors", isLowVision && "text-black border-2 border-black")}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Pembimbing Section */}
                            <div className={cn("p-6 md:p-7 rounded-2xl border", isLowVision ? "border-2 border-black bg-slate-50" : "border-slate-200/80 bg-slate-50/50")}>
                                <h3 className={cn("text-sm font-black uppercase tracking-wider mb-5 flex items-center justify-between", isLowVision ? "text-black text-base" : "text-slate-800")}>
                                    <span>NILAI DOSEN PEMBIMBING (40%)</span>
                                    <span className="text-xs text-slate-400 font-medium">K1: 35% | K2: 30% | K3: 35%</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C1: Penyelesaian Tugas
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p1_k1}
                                            onChange={(e) => setForm({ ...form, p1_k1: e.target.value })}
                                            disabled={!canEditP1 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C2: Sikap & Kedisiplinan
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p1_k2}
                                            onChange={(e) => setForm({ ...form, p1_k2: e.target.value })}
                                            disabled={!canEditP1 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C3: Pemahaman Materi
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p1_k3}
                                            onChange={(e) => setForm({ ...form, p1_k3: e.target.value })}
                                            disabled={!canEditP1 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Penguji Section */}
                            <div className={cn("p-6 md:p-7 rounded-2xl border", isLowVision ? "border-2 border-black bg-slate-50" : "border-slate-200/80 bg-slate-50/50")}>
                                <h3 className={cn("text-sm font-black uppercase tracking-wider mb-5 flex items-center justify-between", isLowVision ? "text-black text-base" : "text-slate-800")}>
                                    <span>NILAI DOSEN PENGUJI (60%)</span>
                                    <span className="text-xs text-slate-400 font-medium">K1: 35% | K2: 30% | K3: 35%</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C1: Penyajikan Presentasi
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p2_k1}
                                            onChange={(e) => setForm({ ...form, p2_k1: e.target.value })}
                                            disabled={!canEditP2 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C2: Penguasaan Materi
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p2_k2}
                                            onChange={(e) => setForm({ ...form, p2_k2: e.target.value })}
                                            disabled={!canEditP2 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                    <div>
                                        <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                            C3: Tanya Jawab
                                        </label>
                                        <Input
                                            type="number"
                                            min="0" max="100"
                                            value={form.p2_k3}
                                            onChange={(e) => setForm({ ...form, p2_k3: e.target.value })}
                                            disabled={!canEditP2 && user?.role !== 'admin'}
                                            placeholder="0 - 100"
                                            className={cn("h-12 rounded-xl text-sm font-bold px-4", isLowVision && "border-2 border-black text-black font-black")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary & Keterangan */}
                            <div>
                                <label className={cn("text-xs font-bold text-slate-700 block mb-2", isLowVision && "text-black font-black")}>
                                    Catatan & Evaluasi Penilaian
                                </label>
                                <textarea
                                    value={form.keterangan}
                                    onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                    rows={4}
                                    placeholder="Tambahkan catatan evaluasi akhir..."
                                    className={cn("w-full p-4 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-brand-primary", isLowVision ? "border-2 border-black text-black font-bold" : "border-slate-200")}
                                />
                            </div>

                            {/* Total Calculation Display */}
                            <div className="bg-slate-100/80 p-5 rounded-2xl flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">Rata-rata Nilai Akhir:</span>
                                <span className="text-2xl font-black text-slate-900">
                                    {((calcP1Total() + calcP2Total()) / 2).toFixed(2)} ({getGrade((calcP1Total() + calcP2Total()) / 2).huruf})
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10 pt-5 border-t border-slate-100">
                            <button
                                onClick={() => setForm(null)}
                                className={cn("flex-1 py-3.5 rounded-xl font-bold text-sm transition-colors", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn("flex-1 py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors", isLowVision ? "bg-black text-white hover:bg-slate-800 border-2 border-black" : "bg-[#119DA4] hover:bg-[#119DA4]/90 shadow-md")}
                            >
                                <Save size={18} />
                                {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRM ===== */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn("rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200", isLowVision ? "bg-white border-4 border-black text-black" : "bg-white")}>
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-5 font-bold shrink-0">
                            <Trash2 size={32} />
                        </div>
                        <h3 className={cn("font-bold mb-2", isLowVision ? "text-2xl text-black font-black" : "text-xl text-slate-900")}>Hapus Penilaian?</h3>
                        <p className={cn("text-sm mb-8 leading-relaxed", isLowVision ? "text-black font-bold text-base" : "text-slate-500")}>Seluruh data komponen nilai untuk <strong>{deleteConfirm.nama}</strong> akan dihapus permanen.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className={cn("flex-1 py-3 rounded-xl font-bold transition-colors text-xs", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Batal</button>
                            <button onClick={handleDelete} className={cn("flex-1 py-3 rounded-xl text-white font-bold transition-colors text-xs", isLowVision ? "bg-black text-white hover:bg-slate-800 border-2 border-black" : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200")}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CONFIRM MODAL (ASSIGN/CANCEL/BULK) ===== */}
            {confirmModal && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn(
                        "rounded-3xl shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 transition-all",
                        (confirmModal.type === 'bulk' || confirmModal.type === 'row') ? "w-full max-w-6xl lg:w-[1100px]" : "w-full max-w-md",
                        isLowVision ? "bg-white border-4 border-black text-black" : "bg-white"
                    )}>
                        {(confirmModal.type === 'bulk' || confirmModal.type === 'row') && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                                {/* Left Column: Action Controls */}
                                <div className="md:col-span-5 flex flex-col justify-between space-y-4 min-w-0 w-full">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4 font-bold shrink-0">
                                            {confirmModal.type === 'bulk' ? <Users size={24} /> : <Edit3 size={24} />}
                                        </div>
                                        <h3 className={cn("font-extrabold mb-1.5", isLowVision ? "text-2xl text-black font-black" : "text-xl text-slate-900")}>
                                            {confirmModal.type === 'bulk' ? 'Tugaskan Penguji?' : 'Ubah Dosen Penguji'}
                                        </h3>
                                        <p className={cn("text-xs leading-relaxed mb-4 w-full break-words", isLowVision ? "text-black font-bold text-sm" : "text-slate-500")}>
                                            {confirmModal.type === 'bulk' ? (
                                                <>Anda akan menugaskan <strong className="text-slate-900">{confirmModal.pengujiName}</strong> sebagai Dosen Penguji untuk seluruh mahasiswa bimbingan <strong className="text-slate-900">{confirmModal.pembimbingName}</strong>.</>
                                            ) : (
                                                <>Pilih dosen penguji baru untuk mahasiswa <strong className="text-slate-900">{confirmModal.studentName}</strong>.</>
                                            )}
                                        </p>

                                        {confirmModal.type === 'row' && (
                                            <div className="mb-4">
                                                <label className={cn("text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5", isLowVision && "text-sm text-black font-black")}>
                                                    Pilih Dosen Penguji
                                                </label>
                                                <select
                                                    className={cn("w-full h-11 px-3 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500", isLowVision ? "border-2 border-black text-black font-bold" : "border-slate-200")}
                                                    onChange={(e) => setConfirmModal({ ...confirmModal, pengujiId: e.target.value })}
                                                    value={confirmModal.pengujiId || ""}
                                                >
                                                    <option value="" disabled>Pilih Dosen Penguji...</option>
                                                    {dosenList.map(d => (
                                                        <option key={d.id} value={d.id}>{d.nama}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {(confirmModal.type === 'bulk' || confirmModal.pengujiId) && (
                                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-200/80 w-full">
                                                <label className={cn("text-xs font-bold uppercase tracking-wider text-orange-950 block mb-1.5", isLowVision && "text-sm text-black font-black")}>
                                                    Lampirkan Surat Tugas (Wajib)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    onChange={(e) => setSuratTugasFile(e.target.files?.[0] || null)}
                                                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                                                />
                                                <p className="text-[10px] text-slate-500 mt-2 font-medium">Format didukung: PDF, PNG, JPG/JPEG.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100 w-full">
                                        <button
                                            onClick={() => { setConfirmModal(null); setSuratTugasFile(null); }}
                                            className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs transition-colors", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirmModal.type === 'bulk') {
                                                    handleAssignPengujiBulk(confirmModal.pembimbingId!, confirmModal.pengujiId!, suratTugasFile);
                                                } else if (confirmModal.pengujiId) {
                                                    handleAssignPenguji(confirmModal.mahasiswaId!, confirmModal.pengujiId, suratTugasFile);
                                                }
                                            }}
                                            disabled={(confirmModal.type === 'row' && !confirmModal.pengujiId) || isSaving || !suratTugasFile}
                                            className={cn("flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-colors", isLowVision ? "bg-black text-white hover:bg-slate-800 border-2 border-black" : "bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-200 disabled:opacity-50")}
                                        >
                                            {isSaving ? "Menyimpan..." : (confirmModal.type === 'bulk' ? "Tugaskan" : "Simpan")}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Photo / PDF Live Preview */}
                                <div className="md:col-span-7 flex flex-col min-w-0 w-full min-h-[420px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white shadow-inner">
                                    <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-orange-400" />
                                            <span className="text-xs font-bold text-slate-200">Pratinjau Surat Tugas</span>
                                        </div>
                                        {suratTugasFile && (
                                            <span className="text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                                                {suratTugasFile.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 p-6 flex flex-col justify-center bg-slate-950 relative overflow-hidden min-h-[380px] w-full min-w-0">
                                        {!suratTugasFile || !suratTugasPreviewUrl ? (
                                            <div className="w-full mx-auto px-6 text-center flex flex-col justify-center">
                                                <FileText className="w-12 h-12 text-slate-700 mb-3 mx-auto shrink-0" />
                                                <p className="text-sm font-bold text-slate-300 w-full text-center">
                                                    Belum Ada File Dipilih
                                                </p>
                                                <p className="text-xs text-slate-400 mt-2 leading-relaxed w-full text-center">
                                                    Silakan pilih file Surat Tugas (Foto / PDF) untuk melihat pratinjau dokumen di panel ini.
                                                </p>
                                            </div>
                                        ) : (
                                            suratTugasFile.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(suratTugasFile.name) ? (
                                                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                                                    <img
                                                        src={suratTugasPreviewUrl}
                                                        alt="Pratinjau Surat Tugas"
                                                        className="max-h-[400px] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                                                    />
                                                </div>
                                            ) : (
                                                <iframe
                                                    src={suratTugasPreviewUrl}
                                                    className="w-full h-[400px] min-h-[380px] rounded-lg border-0 bg-white"
                                                    title="Pratinjau PDF Surat Tugas"
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {confirmModal.type === 'cancel' && (
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-5 font-bold shrink-0">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className={cn("font-bold mb-2", isLowVision ? "text-2xl text-black font-black" : "text-xl text-slate-900")}>Batalkan Penugasan?</h3>
                                <p className={cn("text-sm mb-6 leading-relaxed", isLowVision ? "text-black font-bold text-base" : "text-slate-500")}>
                                    Anda akan membatalkan penugasan dosen penguji untuk mahasiswa <strong>{confirmModal.studentName}</strong>.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => handleCancelPenguji(confirmModal.mahasiswaId!)}
                                        disabled={isSaving}
                                        className={cn("w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl", isLowVision && "border-2 border-black")}
                                    >
                                        {isSaving ? "Membatalkan..." : "Ya, Batalkan"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setConfirmModal(null)}
                                        disabled={isSaving}
                                        className={cn("w-full h-12 rounded-xl font-bold border-slate-200 text-slate-600", isLowVision && "border-2 border-black text-black")}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}

                        {confirmModal.type === 'cancel_bulk' && (
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-5 font-bold shrink-0">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className={cn("text-xl font-bold text-slate-800 mb-2", isLowVision && "text-black font-black text-2xl")}>Batalkan Penugasan Dosen Penguji</h3>
                                <p className={cn("text-sm text-slate-500 mb-6", isLowVision && "text-black font-extrabold text-base")}>
                                    Anda yakin ingin membatalkan semua dosen penguji untuk kelompok bimbingan <strong>{confirmModal.pembimbingName}</strong>?
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => handleCancelPengujiBulk(confirmModal.pembimbingId!)}
                                        disabled={isSaving}
                                        className={cn("w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl text-sm", isLowVision && "border-2 border-black")}
                                    >
                                        {isSaving ? "Membatalkan..." : "Ya, Batalkan Semua"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setConfirmModal(null)}
                                        disabled={isSaving}
                                        className={cn("w-full h-12 rounded-xl font-bold border-slate-200 text-slate-600 text-sm", isLowVision && "border-2 border-black text-black")}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
