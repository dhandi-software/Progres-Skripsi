import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, Download, FileText, User, GraduationCap, Lock, Eye, Users } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { PenugasanPengujiView } from "~/features/dosen/penilaian/desktop/components/PenugasanPengujiView";
import { BimbinganSayaView } from "~/features/dosen/penilaian/desktop/components/BimbinganSayaView";
import { DiujiOlehSayaView } from "~/features/dosen/penilaian/desktop/components/DiujiOlehSayaView";


export interface PenilaianItem {
    mahasiswaId: number;
    nama: string;
    nim: string;
    jurusan: string;
    judulSkripsi: string;
    penilaianId: number | null;

    // Components
    p1_k1: number | null;
    p1_k2: number | null;
    p1_k3: number | null;
    p1_total: number | null;
    p1_nama: string | null;

    p2_k1: number | null;
    p2_k2: number | null;
    p2_k3: number | null;
    p2_total: number | null;
    p2_nama: string | null;

    nilai: number | null; // Detailed average
    keterangan: string | null;
    tanggal: string | null;

    pembimbingId?: number;
    pembimbingNama?: string;
    pengujiId?: number | null;
    pengujiNama?: string | null;
}

interface FormState {
    mahasiswaId: number;
    penilaianId: number | null;
    nama: string;
    nim: string;

    p1_k1: string; p1_k2: string; p1_k3: string; p1_nama: string;
    p2_k1: string; p2_k2: string; p2_k3: string; p2_nama: string;

    keterangan: string;
}

export function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "?", color: "text-gray-400", bg: "bg-gray-100" };
    if (nilai >= 80) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 70) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 60) return { huruf: "B-", color: "text-cyan-700", bg: "bg-cyan-100" };
    if (nilai >= 50) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 40) return { huruf: "C-", color: "text-amber-700", bg: "bg-amber-100" };
    return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
}

export function PenilaianDesktop({ title }: { title: string }) {
    const { user } = useAuth();
    const [data, setData] = useState<PenilaianItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<PenilaianItem | null>(null);

    const [dosenList, setDosenList] = useState<{ id: number, nama: string }[]>([]);
    const [isKoordinator, setIsKoordinator] = useState(false);
    const [assigningId, setAssigningId] = useState<number | null>(null);

    // Custom Dropdown & Low Vision & Drill-down States
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const [isLowVision, setIsLowVision] = useState(false);
    const [selectedPembimbingId, setSelectedPembimbingId] = useState<number | "all" | null>(null);
    const [activeTab, setActiveTab] = useState<"koordinator" | "pembimbing" | "penguji">("pembimbing");
    const [confirmAssignPenguji, setConfirmAssignPenguji] = useState<{
        pembimbingId: number;
        pengujiId: number | null;
        pengujiNama: string | null;
    } | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await penilaianApi.getPenilaianByDosen();
            setData(result.students || []);
            setDosenList(result.dosenList || []);
            setIsKoordinator(result.isKoordinator || false);

            // Automatically set default selected Pembimbing ID
            const currentDosen = result.dosenList?.find((d: any) => d.nama === user?.name);
            if (user?.role === 'admin') {
                setSelectedPembimbingId("all" as any);
            } else if (currentDosen && selectedPembimbingId === null) {
                setSelectedPembimbingId(currentDosen.id);
            } else if (result.dosenList?.length > 0 && selectedPembimbingId === null) {
                setSelectedPembimbingId(result.dosenList[0].id);
            }
        } catch {
            showToast("error", "Gagal memuat data penilaian.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignPengujiBulk = async (pembimbingId: number | null, pengujiId: number | null) => {
        if (!pembimbingId) return;
        setIsSaving(true);
        const pembimbing = dosenList.find(d => d.id === pembimbingId);
        const studentsToUpdate = data.filter(item => item.pembimbingId === pembimbingId || item.pembimbingNama === pembimbing?.nama);

        if (studentsToUpdate.length === 0) {
            showToast("error", "Dosen pembimbing ini tidak memiliki mahasiswa bimbingan.");
            setIsSaving(false);
            return;
        }

        setAssigningId(pembimbingId);
        try {
            await Promise.all(
                studentsToUpdate.map(student =>
                    penilaianApi.assignPenguji(student.mahasiswaId, pengujiId)
                )
            );
            await fetchData();
            showToast("success", `Berhasil menugaskan Dosen Penguji untuk semua bimbingan ${pembimbing?.nama}!`);
        } catch {
            showToast("error", "Gagal menugaskan Dosen Penguji.");
        } finally {
            setAssigningId(null);
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (isKoordinator) {
            setActiveTab("koordinator");
        } else {
            setActiveTab("pembimbing");
        }
    }, [isKoordinator]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (openDropdownId !== null) {
                const target = e.target as HTMLElement;
                if (!target.closest(".custom-dropdown-container")) {
                    setOpenDropdownId(null);
                }
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [openDropdownId]);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const openForm = (item: PenilaianItem) => {
        setForm({
            mahasiswaId: item.mahasiswaId,
            penilaianId: item.penilaianId,
            nama: item.nama,
            nim: item.nim,
            p1_k1: item.p1_k1 !== null ? String(item.p1_k1) : "",
            p1_k2: item.p1_k2 !== null ? String(item.p1_k2) : "",
            p1_k3: item.p1_k3 !== null ? String(item.p1_k3) : "",
            p1_nama: item.p1_nama || item.pembimbingNama || user?.name || "",
            p2_k1: item.p2_k1 !== null ? String(item.p2_k1) : "",
            p2_k2: item.p2_k2 !== null ? String(item.p2_k2) : "",
            p2_k3: item.p2_k3 !== null ? String(item.p2_k3) : "",
            p2_nama: item.p2_nama || item.pengujiNama || "",
            keterangan: item.keterangan || ""
        });
    };

    const handleSave = async () => {
        if (!form) return;

        const payload = {
            mahasiswaId: form.mahasiswaId,
            p1_k1: parseFloat(form.p1_k1) || 0,
            p1_k2: parseFloat(form.p1_k2) || 0,
            p1_k3: parseFloat(form.p1_k3) || 0,
            p1_nama: form.p1_nama,
            p2_k1: parseFloat(form.p2_k1) || 0,
            p2_k2: parseFloat(form.p2_k2) || 0,
            p2_k3: parseFloat(form.p2_k3) || 0,
            p2_nama: form.p2_nama,
            keterangan: form.keterangan
        };

        try {
            setIsSaving(true);
            await penilaianApi.createPenilaian(payload);
            setForm(null);
            await fetchData();
            showToast("success", `Nilai ${form.nama} berhasil disimpan!`);
        } catch {
            showToast("error", "Gagal menyimpan nilai.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm?.penilaianId) return;
        try {
            await penilaianApi.deletePenilaian(deleteConfirm.penilaianId);
            setDeleteConfirm(null);
            await fetchData();
            showToast("success", "Penilaian berhasil dihapus.");
        } catch {
            showToast("error", "Gagal menghapus penilaian.");
        }
    };

    // Supervisor & Examiner resolution logic
    const currentDosen = dosenList.find(d => d.nama === user?.name);
    const activePembimbingId = isKoordinator
        ? (selectedPembimbingId || currentDosen?.id || (dosenList.length > 0 ? dosenList[0].id : null))
        : (currentDosen?.id || null);

    const activePembimbing = dosenList.find(d => d.id === activePembimbingId);

    const activePembimbingStudents = activePembimbingId === "all"
        ? data
        : data.filter(item => item.pembimbingId === activePembimbingId || item.pembimbingNama === activePembimbing?.nama);

    const supervisedStudents = data.filter(item => item.pembimbingId === currentDosen?.id || item.pembimbingNama === user?.name);
    const examinedStudents = data.filter(item => item.pengujiId === currentDosen?.id || item.pengujiNama === user?.name);

    const calcP1Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p1_k1) || 0)) + (0.30 * (parseFloat(form.p1_k2) || 0)) + (0.35 * (parseFloat(form.p1_k3) || 0));
    };
    const calcP2Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p2_k1) || 0)) + (0.30 * (parseFloat(form.p2_k2) || 0)) + (0.35 * (parseFloat(form.p2_k3) || 0));
    };
    const student = form ? data.find(d => d.mahasiswaId === form.mahasiswaId) : null;
    const avg = (calcP1Total() + calcP2Total()) / 2;
    const isUserPembimbing = student && user && (
        (user.dosenId && student.pembimbingId === user.dosenId) ||
        (user.name && (student.pembimbingNama === user.name || form?.p1_nama === user.name))
    );
    const isUserPenguji = student && user && (
        (user.dosenId && student.pengujiId === user.dosenId) ||
        (user.name && (student.pengujiNama === user.name || form?.p2_nama === user.name))
    );

    const canEditP1 = form && user && user.role !== 'admin' && user.role !== 'staf' && user.role !== 'staf_univ'
        ? !!isUserPembimbing
        : false;

    const canEditP2 = form && user && user.role !== 'admin' && user.role !== 'staf' && user.role !== 'staf_univ'
        ? !!isUserPenguji
        : false;

    return (
        <div className={cn(
            "flex flex-col min-h-full transition-all duration-200 font-['Noto_Sans']",
            isLowVision ? "bg-white text-black p-6 font-bold" : "bg-[#f8fafc] p-8"
        )}>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className={cn("font-bold tracking-tight text-slate-800", isLowVision ? "text-4xl text-black font-black" : "text-3xl")}>{title || "Evaluasi Kerja Praktik"}</h1>
                    <p className={cn("mt-1 text-sm", isLowVision ? "text-black text-base font-extrabold" : "text-slate-500")}>Kelola nilai evaluasi kerja praktik dan dosen penguji untuk mahasiswa bimbingan yang telah lulus monitoring.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Accessibility Switch */}
                    <button
                        onClick={() => setIsLowVision(!isLowVision)}
                        className={cn(
                            "px-4 h-10 rounded-xl text-xs font-black flex items-center gap-2 border shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-brand-primary/40",
                            isLowVision
                                ? "bg-black text-white border-black scale-105"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                        aria-label="Toggle Low Vision Mode"
                    >
                        <Eye className="w-4 h-4" />
                        {isLowVision ? "Mode Normal" : "Mode Aksesibilitas (Kontras & Teks Tinggi)"}
                    </button>

                    <div className="relative w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Cari nama, nim..."
                            className={cn(
                                "pl-9 bg-white border-slate-200 focus-visible:ring-brand-primary/20",
                                isLowVision && "border-2 border-black text-black font-black text-sm h-10 placeholder-slate-700"
                            )}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className={cn("bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm w-10 h-10", isLowVision && "border-2 border-black text-black w-10 h-10")}>
                                    <Download className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Unduh Excel</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {user?.role !== 'admin' && (
                <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl self-start">
                    {isKoordinator ? (
                        <>
                            <button
                                onClick={() => setActiveTab("koordinator")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2",
                                    activeTab === "koordinator"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <Users className="w-4 h-4 text-emerald-600" />
                                Penugasan Penguji
                            </button>
                            <button
                                onClick={() => setActiveTab("pembimbing")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2",
                                    activeTab === "pembimbing"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <Users className="w-4 h-4 text-blue-600" />
                                Bimbingan Saya ({supervisedStudents.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("penguji")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2",
                                    activeTab === "penguji"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <GraduationCap className="w-4 h-4 text-orange-600" />
                                Diuji Oleh Saya ({examinedStudents.length})
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveTab("pembimbing")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2",
                                    activeTab === "pembimbing"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <Users className="w-4 h-4 text-blue-600" />
                                Bimbingan Saya ({supervisedStudents.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("penguji")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2",
                                    activeTab === "penguji"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-800"
                                )}
                            >
                                <GraduationCap className="w-4 h-4 text-orange-600" />
                                Diuji Oleh Saya ({examinedStudents.length})
                            </button>
                        </>
                    )}
                </div>
            )}

            {isLoading ? (
                <div className={cn(
                    "rounded-2xl p-20 text-center transition-all mb-8",
                    isLowVision ? "bg-white border-4 border-black" : "bg-white border border-slate-200 shadow-sm"
                )}>
                    <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin mx-auto" />
                </div>
            ) : (
                <div className="mb-8">
                    {activeTab === "koordinator" && isKoordinator && (
                        <PenugasanPengujiView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            assigningId={assigningId}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            setConfirmAssignPenguji={setConfirmAssignPenguji}
                            onOpenForm={openForm}
                            onDeleteConfirm={setDeleteConfirm}
                            onRefresh={fetchData}
                        />
                    )}
                    {activeTab === "pembimbing" && (
                        <BimbinganSayaView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            assigningId={assigningId}
                            openDropdownId={openDropdownId}
                            setOpenDropdownId={setOpenDropdownId}
                            setConfirmAssignPenguji={setConfirmAssignPenguji}
                            onOpenForm={openForm}
                            onDeleteConfirm={setDeleteConfirm}
                        />
                    )}
                    {activeTab === "penguji" && (
                        <DiujiOlehSayaView
                            data={data}
                            dosenList={dosenList}
                            isLowVision={isLowVision}
                            user={user}
                            onOpenForm={openForm}
                            onDeleteConfirm={setDeleteConfirm}
                        />
                    )}
                </div>
            )}
            
            {/* Comparison Logic / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn("p-6 rounded-2xl border transition-all", isLowVision ? "border-3 border-black bg-white text-black" : "bg-white border-slate-200 shadow-sm")}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0"><GraduationCap size={20} /></div>
                        <h3 className={cn("font-bold text-slate-800", isLowVision && "text-black font-black text-lg")}>Status Penilaian</h3>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className={cn("font-black text-slate-900", isLowVision ? "text-black text-4xl" : "text-3xl")}>{data.filter(d => d.penilaianId).length}<span className="text-sm font-normal text-slate-400 ml-1">/{data.length}</span></span>
                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", isLowVision ? "text-black border-2 border-black font-black" : "text-emerald-600 bg-emerald-50")}>DIPENUHI</span>
                    </div>
                </div>
                <div className={cn("p-6 rounded-2xl border transition-all", isLowVision ? "border-3 border-black bg-white text-black" : "bg-white border-slate-200 shadow-sm")}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0"><CheckCircle size={20} /></div>
                        <h3 className={cn("font-bold text-slate-800", isLowVision && "text-black font-black text-lg")}>Rata-rata Kelas</h3>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className={cn("font-black text-slate-900", isLowVision ? "text-black text-4xl" : "text-3xl")}>
                            {(data.reduce((acc, curr) => acc + (curr.nilai || 0), 0) / (data.filter(d => d.nilai).length || 1)).toFixed(2)}
                        </span>
                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-full font-sans", isLowVision ? "text-black border-2 border-black font-black" : "text-blue-600 bg-blue-50")}>B+</span>
                    </div>
                </div>
                <div className={cn("p-6 rounded-2xl transition-all flex flex-col justify-between shadow-xl", isLowVision ? "border-3 border-black bg-white text-black" : "bg-slate-900 text-white")}>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", isLowVision ? "text-black" : "text-slate-400")}>Informasi Evaluasi KP</p>
                    <p className={cn("text-sm leading-relaxed mt-2 italic font-serif", isLowVision ? "text-black font-black text-base" : "text-white")}>"Pastikan seluruh komponen nilai (K1-K3) telah diverifikasi dari lembar penilaian fisik masing-masing penguji."</p>
                    <div className="mt-4 flex items-center gap-2 text-slate-400 text-[10px]">
                        <span>Pembaharuan terakhir: {new Date().toLocaleDateString("id-ID")}</span>
                    </div>
                </div>
            </div>

            {/* ===== GRADING MODAL ===== */}
            {form && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className={cn("rounded-3xl shadow-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200 my-auto", isLowVision ? "bg-white border-4 border-black text-black" : "bg-white")}>
                        <div className={cn("border-b px-6 py-5 flex items-center justify-between", isLowVision ? "bg-slate-100 border-black" : "bg-slate-50 border-slate-100")}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold shrink-0"><Edit3 size={20} /></div>
                                <div>
                                    <h2 className={cn("font-bold text-slate-900 leading-none", isLowVision ? "text-2xl text-black font-black" : "text-lg")}>Beri Nilai Evaluasi Kerja Praktik</h2>
                                    <p className={cn("text-xs mt-1", isLowVision ? "text-black font-extrabold text-sm" : "text-slate-500")}>{form.nama} • {form.nim}</p>
                                </div>
                            </div>
                            <button onClick={() => setForm(null)} className={cn("p-2 rounded-full transition-colors text-slate-400", isLowVision ? "text-black hover:bg-slate-300" : "hover:bg-slate-200")}><X size={20} /></button>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col gap-8 max-h-[65vh] overflow-y-auto">
                            {/* Dosen Pembimbing Section */}
                            <div className={cn(
                                "rounded-2xl border p-5 transition-all",
                                isLowVision ? "border-3 border-black bg-white text-black" : "bg-blue-50/30 border-blue-100/50",
                                !canEditP1 && "opacity-80 bg-slate-100/50"
                            )}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center font-bold">1</span>
                                        <span className={cn("text-xs font-black uppercase tracking-widest", isLowVision ? "text-black text-sm" : "text-blue-900")}>Dosen Pembimbing</span>
                                    </div>
                                    {!canEditP1 && (
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-200/70 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Lock size={10} /> Terkunci (Hanya Pembimbing)
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        value={form.p1_nama}
                                        onChange={e => setForm({ ...form, p1_nama: e.target.value })}
                                        disabled={!canEditP1}
                                        placeholder="Nama Dosen Pembimbing"
                                        className={cn(
                                            "bg-white border-blue-100 h-10 text-sm",
                                            !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                            isLowVision && "border-2 border-black font-bold text-base h-12 text-black"
                                        )}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-blue-700")}>K1 (35%)</label>
                                            <Input
                                                type="number"
                                                value={form.p1_k1}
                                                onChange={e => setForm({ ...form, p1_k1: e.target.value })}
                                                disabled={!canEditP1}
                                                className={cn(
                                                    "bg-white border-blue-200 h-11 text-center font-bold",
                                                    !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-blue-700")}>K2 (30%)</label>
                                            <Input
                                                type="number"
                                                value={form.p1_k2}
                                                onChange={e => setForm({ ...form, p1_k2: e.target.value })}
                                                disabled={!canEditP1}
                                                className={cn(
                                                    "bg-white border-blue-200 h-11 text-center font-bold",
                                                    !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-blue-700")}>K3 (35%)</label>
                                            <Input
                                                type="number"
                                                value={form.p1_k3}
                                                onChange={e => setForm({ ...form, p1_k3: e.target.value })}
                                                disabled={!canEditP1}
                                                className={cn(
                                                    "bg-white border-blue-200 h-11 text-center font-bold",
                                                    !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 flex justify-end">
                                    <span className={cn("text-[11px] font-bold text-blue-800", isLowVision && "text-sm text-black")}>Total P1: <span className="text-lg ml-1 font-black underline decoration-2 underline-offset-4">{calcP1Total().toFixed(2)}</span></span>
                                </div>
                            </div>

                            {/* Dosen Penguji Section */}
                            <div className={cn(
                                "rounded-2xl border p-5 transition-all",
                                isLowVision ? "border-3 border-black bg-white text-black" : "bg-orange-50/50 border-orange-100/50",
                                !canEditP2 && "opacity-80 bg-slate-100/50"
                            )}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center font-bold">2</span>
                                        <span className={cn("text-xs font-black uppercase tracking-widest", isLowVision ? "text-black text-sm" : "text-orange-900")}>Dosen Penguji</span>
                                    </div>
                                    {!canEditP2 && (
                                        <span className="text-[10px] font-black text-slate-500 bg-slate-200/70 px-2 py-1 rounded-md flex items-center gap-1">
                                            <Lock size={10} /> Terkunci (Hanya Penguji)
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        value={form.p2_nama}
                                        onChange={e => setForm({ ...form, p2_nama: e.target.value })}
                                        disabled={!canEditP2}
                                        placeholder="Nama Dosen Penguji"
                                        className={cn(
                                            "bg-white border-orange-100 h-10 text-sm",
                                            !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                            isLowVision && "border-2 border-black font-bold text-base h-12 text-black"
                                        )}
                                    />
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-orange-700")}>K1 (35%)</label>
                                            <Input
                                                type="number"
                                                value={form.p2_k1}
                                                onChange={e => setForm({ ...form, p2_k1: e.target.value })}
                                                disabled={!canEditP2}
                                                className={cn(
                                                    "bg-white border-orange-200 h-11 text-center font-bold",
                                                    !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-orange-700")}>K2 (30%)</label>
                                            <Input
                                                type="number"
                                                value={form.p2_k2}
                                                onChange={e => setForm({ ...form, p2_k2: e.target.value })}
                                                disabled={!canEditP2}
                                                className={cn(
                                                    "bg-white border-orange-200 h-11 text-center font-bold",
                                                    !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-orange-700")}>K3 (35%)</label>
                                            <Input
                                                type="number"
                                                value={form.p2_k3}
                                                onChange={e => setForm({ ...form, p2_k3: e.target.value })}
                                                disabled={!canEditP2}
                                                className={cn(
                                                    "bg-white border-orange-200 h-11 text-center font-bold",
                                                    !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                    isLowVision && "border-2 border-black font-black text-lg h-14 text-black"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 flex justify-end">
                                    <span className={cn("text-[11px] font-bold text-orange-800", isLowVision && "text-sm text-black")}>Total P2: <span className="text-lg ml-1 font-black underline decoration-2 underline-offset-4">{calcP2Total().toFixed(2)}</span></span>
                                </div>
                            </div>

                            {/* Final Summary Card */}
                            <div className={cn("p-6 flex items-center justify-between shadow-lg rounded-2xl transition-all", isLowVision ? "bg-white border-3 border-black text-black" : "bg-slate-900 text-white")}>
                                <div>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-widest block mb-1", isLowVision ? "text-black text-xs" : "text-slate-500")}>Nilai Rata-rata Akhir</span>
                                    <span className={cn("font-black", isLowVision ? "text-black text-5xl" : "text-white text-4xl")}>{avg.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 group">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner shadow-black/20", getGrade(avg).bg, getGrade(avg).color, isLowVision && "border-3 border-black font-black text-black text-2xl bg-slate-100")}>
                                        {getGrade(avg).huruf}
                                    </div>
                                    <span className={cn("text-[10px] font-bold truncate max-w-[80px]", isLowVision ? "text-black" : "text-slate-500")}>HURUF MUTU</span>
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className={cn("text-[10px] font-bold uppercase mb-1.5 block leading-none", isLowVision ? "text-sm text-black" : "text-slate-500")}>Keterangan / Catatan Evaluasi KP</label>
                                <textarea
                                    value={form.keterangan}
                                    onChange={e => setForm({ ...form, keterangan: e.target.value })}
                                    placeholder="Tambahkan catatan hasil evaluasi jika ada..."
                                    className={cn(
                                        "w-full min-h-[80px] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none font-sans",
                                        isLowVision ? "bg-white border-2 border-black text-black font-bold text-base" : "bg-slate-50 border-slate-200"
                                    )}
                                />
                            </div>
                        </div>

                        <div className={cn("px-6 py-5 flex items-center justify-end gap-3 border-t", isLowVision ? "bg-slate-100 border-black" : "bg-slate-50 border-slate-100")}>
                            <button onClick={() => setForm(null)} className={cn("px-5 py-2.5 rounded-xl font-bold text-sm transition-colors", isLowVision ? "bg-black text-white hover:bg-slate-800" : "text-slate-600 hover:bg-slate-200")}>Batal</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={cn(
                                    "px-6 py-2.5 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50",
                                    isLowVision
                                        ? "bg-black text-white border-2 border-black hover:bg-slate-800 shadow-none font-black text-base"
                                        : "bg-brand-primary shadow-brand-primary/20 hover:bg-brand-primary/90"
                                )}
                            >
                                <Save size={16} />
                                {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== CONFIRM ASSIGN PENGUJI MODAL ===== */}
            {confirmAssignPenguji && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn("rounded-2xl shadow-2xl p-8 max-w-[400px] text-center animate-in zoom-in-95 duration-200", isLowVision ? "bg-white border-4 border-black text-black" : "bg-white")}>
                        <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto mb-5 font-bold shrink-0">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className={cn("font-bold mb-2", isLowVision ? "text-2xl text-black font-black" : "text-xl text-slate-900")}>Konfirmasi Penugasan Dosen Penguji</h3>
                        <p className={cn("text-sm mb-8 leading-relaxed", isLowVision ? "text-black font-bold text-base" : "text-slate-500")}>
                            {confirmAssignPenguji.pengujiId ? (
                                (() => {
                                    const currentPengujiNama = activePembimbingStudents.find(item => item.pengujiNama)?.pengujiNama || null;
                                    if (currentPengujiNama && currentPengujiNama !== "Belum Ditugaskan" && currentPengujiNama !== confirmAssignPenguji.pengujiNama) {
                                        return (
                                            <>
                                                Apakah Anda yakin ingin <strong>MENGUBAH</strong> Dosen Penguji khusus mahasiswa bimbingan <strong>{activePembimbing?.nama}</strong> dari <strong>{currentPengujiNama}</strong> menjadi <strong>{confirmAssignPenguji.pengujiNama}</strong>?
                                            </>
                                        );
                                    }
                                    return (
                                        <>
                                            Apakah Anda yakin ingin menugaskan <strong>{confirmAssignPenguji.pengujiNama}</strong> sebagai Dosen Penguji khusus untuk mahasiswa yang dibimbing oleh <strong>{activePembimbing?.nama}</strong>?
                                        </>
                                    );
                                })()
                            ) : (
                                <>
                                    Apakah Anda yakin ingin mengosongkan Dosen Penguji untuk mahasiswa yang dibimbing oleh <strong>{activePembimbing?.nama}</strong>?
                                </>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmAssignPenguji(null)}
                                className={cn("flex-1 py-6 rounded-xl font-bold text-sm", isLowVision && "border-2 border-black text-black font-black")}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => {
                                    handleAssignPengujiBulk(confirmAssignPenguji.pembimbingId, confirmAssignPenguji.pengujiId);
                                    setConfirmAssignPenguji(null);
                                }}
                                className={cn("flex-1 py-6 rounded-xl text-white font-bold text-sm bg-brand-primary hover:bg-brand-primary/90", isLowVision && "bg-black text-white hover:bg-slate-800 border-2 border-black font-black")}
                            >
                                Ya, Konfirmasi
                            </Button>
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
                        <p className={cn("text-sm mb-8 leading-relaxed", isLowVision ? "text-black font-bold text-base" : "text-slate-500")}>Seluruh data komponen nilai untuk <strong>{deleteConfirm.nama}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className={cn("flex-1 py-3 rounded-xl font-bold transition-colors", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Batal</button>
                            <button onClick={handleDelete} className={cn("flex-1 py-3 rounded-xl text-white font-bold transition-colors", isLowVision ? "bg-black text-white hover:bg-slate-800 shadow-none border-2 border-black" : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200")}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== TOAST ===== */}
            {toast && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-[1100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5 duration-300",
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}

const Clock = ({ size, className }: { size: number; className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
