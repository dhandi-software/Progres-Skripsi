import React from "react";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, User, GraduationCap, Lock, Eye, Users, Printer, FileText } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { usePenilaian } from "~/hooks/usePenilaian";

export function PenilaianMobile({ title }: { title?: string }) {
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
        dropdownSearch,
        setDropdownSearch,
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

    const [isEditingPenguji, setIsEditingPenguji] = React.useState(false);
    const [isEditingBulk, setIsEditingBulk] = React.useState(false);

    const activePembimbingId = selectedPembimbingId === "all" ? null : (selectedPembimbingId || (dosenList.length > 0 ? dosenList[0].id : null));
    const activePembimbing = selectedPembimbingId === "all" ? null : dosenList.find(d => d.id === activePembimbingId);

    const activePembimbingStudents = selectedPembimbingId === "all"
        ? data
        : data.filter(item => item.pembimbingId === activePembimbingId || item.pembimbingNama === activePembimbing?.nama);

    const filteredData = activePembimbingStudents.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.includes(searchQuery) ||
        (item.judulSkripsi && item.judulSkripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activePengujiNama = activePembimbingStudents.find(item => item.pengujiNama)?.pengujiNama;

    const handlePrintSuratTugasBulk = (students: any[]) => {
        const firstStudent = students.find(s => s.suratTugasUrl);
        if (firstStudent && firstStudent.suratTugasUrl) {
            import("~/api/client").then(({ UPLOADS_URL }) => {
                window.open(`${UPLOADS_URL}${firstStudent.suratTugasUrl}`, '_blank');
            });
        } else {
            alert("Surat tugas belum diunggah atau tidak ditemukan.");
        }
    };

    return (
        <div className={cn(
            "flex flex-col min-h-screen p-4 pb-20 font-['Noto_Sans'] transition-all",
            isLowVision ? "bg-slate-100 text-black" : "bg-slate-50/50"
        )}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className={cn("text-xl font-black", isLowVision ? "text-2xl text-black font-black" : "text-slate-900")}>
                        {title || "Penilaian KP"}
                    </h1>
                    <p className={cn("text-xs text-slate-500", isLowVision && "text-black font-bold")}>Evaluasi Mahasiswa & Penugasan</p>
                </div>
                <button
                    onClick={() => setIsLowVision(!isLowVision)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm", isLowVision ? "bg-black text-white border-black" : "bg-white border-slate-200 text-slate-700")}
                >
                    {isLowVision ? "👁️ Low Vision: ON" : "👁️ Kontras"}
                </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 no-scrollbar">
                {isKoordinator && (
                    <button
                        onClick={() => setActiveTab("koordinator")}
                        className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all",
                            activeTab === "koordinator"
                                ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4]")
                                : "bg-white text-slate-600 border-slate-200"
                        )}
                    >
                        Penugasan (Koord)
                    </button>
                )}
                <button
                    onClick={() => setActiveTab("pembimbing")}
                    className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all",
                        activeTab === "pembimbing"
                            ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4]")
                            : "bg-white text-slate-600 border-slate-200"
                    )}
                >
                    Bimbingan ({supervisedStudents.length})
                </button>
                <button
                    onClick={() => setActiveTab("penguji")}
                    className={cn(
                        "px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-all",
                        activeTab === "penguji"
                            ? (isLowVision ? "bg-black text-white border-black" : "bg-[#119DA4] text-white border-[#119DA4]")
                            : "bg-white text-slate-600 border-slate-200"
                    )}
                >
                    Pengujian ({examinedStudents.length})
                </button>
            </div>

            {/* Main Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-[#119DA4] border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs font-bold text-slate-400">Memuat data...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari mahasiswa atau NIM..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn("pl-9 h-11 text-xs rounded-xl bg-white border-slate-200", isLowVision && "border-2 border-black text-black font-bold")}
                        />
                    </div>

                    {/* Koordinator Assignment Section */}
                    {activeTab === "koordinator" && (
                        <div className={cn("p-4 rounded-2xl bg-white border shadow-sm space-y-3", isLowVision && "border-2 border-black")}>
                            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Tugaskan Dosen Penguji</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Pilih Dosen Pembimbing</label>
                                <select
                                    className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                                    value={selectedPembimbingId || "all"}
                                    onChange={(e) => setSelectedPembimbingId(e.target.value)}
                                >
                                    <option value="all">Semua Pembimbing</option>
                                    {dosenList.map(d => (
                                        <option key={d.id} value={d.id}>{d.nama}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Student Cards List */}
                    <div className="space-y-3">
                        {((activeTab === "koordinator" ? filteredData : activeTab === "pembimbing" ? supervisedStudents : examinedStudents).length === 0) ? (
                            <div className="p-8 text-center text-xs text-slate-400 font-bold bg-white rounded-2xl border border-slate-100">
                                Tidak ada data mahasiswa.
                            </div>
                        ) : (
                            (activeTab === "koordinator" ? filteredData : activeTab === "pembimbing" ? supervisedStudents : examinedStudents).map((item) => (
                                <div key={item.mahasiswaId} className={cn("p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3", isLowVision && "border-2 border-black")}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-sm font-extrabold text-slate-900">{item.nama}</h4>
                                            <p className="text-[11px] font-semibold text-slate-500">{item.nim}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => openForm(item)}
                                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            {item.penilaianId && (
                                                <button
                                                    onClick={() => setDeleteConfirm(item)}
                                                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {item.judulSkripsi && (
                                        <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            "{item.judulSkripsi}"
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
                                        <div>
                                            <span className="text-slate-400 block font-bold text-[10px]">Nilai Pembimbing:</span>
                                            <span className="font-extrabold text-blue-700">{item.p1_total?.toFixed(2) || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-bold text-[10px]">Nilai Penguji:</span>
                                            <span className="font-extrabold text-orange-700">{item.p2_total?.toFixed(2) || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ===== EDIT FORM MODAL (MOBILE) ===== */}
            {form && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn("rounded-3xl shadow-2xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white space-y-4", isLowVision && "border-4 border-black")}>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">Form Nilai KP</h3>
                                <p className="text-xs text-slate-500 font-semibold">{form.nama}</p>
                            </div>
                            <button onClick={() => setForm(null)} className="p-1.5 text-slate-400"><X size={18} /></button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                                <span className="text-[11px] font-black text-slate-700 uppercase">Nilai Pembimbing</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input placeholder="C1" type="number" value={form.p1_k1} onChange={(e) => setForm({ ...form, p1_k1: e.target.value })} disabled={!canEditP1 && user?.role !== 'admin'} className="h-9 text-xs" />
                                    <Input placeholder="C2" type="number" value={form.p1_k2} onChange={(e) => setForm({ ...form, p1_k2: e.target.value })} disabled={!canEditP1 && user?.role !== 'admin'} className="h-9 text-xs" />
                                    <Input placeholder="C3" type="number" value={form.p1_k3} onChange={(e) => setForm({ ...form, p1_k3: e.target.value })} disabled={!canEditP1 && user?.role !== 'admin'} className="h-9 text-xs" />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                                <span className="text-[11px] font-black text-slate-700 uppercase">Nilai Penguji</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <Input placeholder="C1" type="number" value={form.p2_k1} onChange={(e) => setForm({ ...form, p2_k1: e.target.value })} disabled={!canEditP2 && user?.role !== 'admin'} className="h-9 text-xs" />
                                    <Input placeholder="C2" type="number" value={form.p2_k2} onChange={(e) => setForm({ ...form, p2_k2: e.target.value })} disabled={!canEditP2 && user?.role !== 'admin'} className="h-9 text-xs" />
                                    <Input placeholder="C3" type="number" value={form.p2_k3} onChange={(e) => setForm({ ...form, p2_k3: e.target.value })} disabled={!canEditP2 && user?.role !== 'admin'} className="h-9 text-xs" />
                                </div>
                            </div>

                            <textarea
                                value={form.keterangan}
                                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                                rows={2}
                                placeholder="Catatan evaluasi..."
                                className="w-full p-2.5 rounded-xl text-xs border border-slate-200"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setForm(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Batal</button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-1 py-2.5 bg-[#119DA4] text-white font-bold rounded-xl text-xs">{isSaving ? "Simpan..." : "Simpan"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CONFIRM MODAL (MOBILE LANDSCAPE / RESPONSIVE MODAL) ===== */}
            {confirmModal && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn(
                        "rounded-3xl shadow-2xl p-5 md:p-7 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 transition-all",
                        (confirmModal.type === 'bulk' || confirmModal.type === 'row') ? "w-full max-w-5xl" : "w-full max-w-md",
                        isLowVision ? "bg-white border-4 border-black text-black" : "bg-white"
                    )}>
                        {(confirmModal.type === 'bulk' || confirmModal.type === 'row') && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                                {/* Left Column: Form Action */}
                                <div className="md:col-span-5 flex flex-col justify-between space-y-4 min-w-0 w-full">
                                    <div>
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3 font-bold shrink-0">
                                            {confirmModal.type === 'bulk' ? <Users size={24} /> : <Edit3 size={24} />}
                                        </div>
                                        <h3 className={cn("font-extrabold mb-1.5", isLowVision ? "text-2xl text-black font-black" : "text-lg text-slate-900")}>
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
                                                <label className={cn("text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5", isLowVision && "text-sm text-black font-black")}>
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
                                            <div className="bg-orange-50/50 p-3.5 rounded-2xl border border-orange-200/80 w-full">
                                                <label className={cn("text-[11px] font-bold uppercase tracking-wider text-orange-950 block mb-1.5", isLowVision && "text-sm text-black font-black")}>
                                                    Lampirkan Surat Tugas (Wajib)
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    onChange={(e) => setSuratTugasFile(e.target.files?.[0] || null)}
                                                    className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Format didukung: PDF, PNG, JPG/JPEG.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-slate-100 w-full">
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
                                            {isSaving ? "Tunggu..." : (confirmModal.type === 'bulk' ? "Tugaskan" : "Simpan")}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Photo / PDF Live Preview */}
                                <div className="md:col-span-7 flex flex-col min-w-0 w-full min-h-[300px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden text-white shadow-inner">
                                    <div className="px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between shrink-0">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-orange-400" />
                                            <span className="text-xs font-bold text-slate-200">Pratinjau Surat Tugas</span>
                                        </div>
                                        {suratTugasFile && (
                                            <span className="text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                                                {suratTugasFile.name}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 p-4 flex flex-col justify-center bg-slate-950 relative overflow-hidden w-full min-w-0">
                                        {!suratTugasFile || !suratTugasPreviewUrl ? (
                                            <div className="w-full mx-auto px-6 text-center flex flex-col justify-center">
                                                <FileText className="w-10 h-10 text-slate-700 mb-2 mx-auto shrink-0" />
                                                <p className="text-sm font-bold text-slate-300 w-full text-center">
                                                    Belum Ada File Dipilih
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed w-full text-center">
                                                    Silakan pilih file Surat Tugas (Foto / PDF) untuk melihat pratinjau dokumen di panel ini.
                                                </p>
                                            </div>
                                        ) : (
                                            suratTugasFile.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(suratTugasFile.name) ? (
                                                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                                                    <img
                                                        src={suratTugasPreviewUrl}
                                                        alt="Pratinjau Surat Tugas"
                                                        className="max-h-[280px] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                                                    />
                                                </div>
                                            ) : (
                                                <iframe
                                                    src={suratTugasPreviewUrl}
                                                    className="w-full h-[280px] rounded-lg border-0 bg-white"
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
                                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4 font-bold shrink-0">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className={cn("font-bold mb-2", isLowVision ? "text-2xl text-black font-black" : "text-lg text-slate-900")}>Batalkan Penugasan?</h3>
                                <p className={cn("text-xs mb-6 leading-relaxed", isLowVision ? "text-black font-bold text-sm" : "text-slate-500")}>
                                    Anda akan membatalkan penugasan dosen penguji untuk mahasiswa <strong>{confirmModal.studentName}</strong>.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => handleCancelPenguji(confirmModal.mahasiswaId!)}
                                        disabled={isSaving}
                                        className={cn("w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 rounded-xl text-xs", isLowVision && "border-2 border-black")}
                                    >
                                        {isSaving ? "Membatalkan..." : "Ya, Batalkan"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setConfirmModal(null)}
                                        disabled={isSaving}
                                        className={cn("w-full h-11 rounded-xl font-bold border-slate-200 text-slate-600 text-xs", isLowVision && "border-2 border-black text-black")}
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
