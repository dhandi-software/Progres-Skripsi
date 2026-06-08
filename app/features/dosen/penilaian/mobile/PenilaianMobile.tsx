import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, User, GraduationCap, ChevronRight, Calculator, Info, Lock, Eye } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface PenilaianItem {
    mahasiswaId: number;
    nama: string;
    nim: string;
    jurusan: string;
    judulSkripsi: string;
    penilaianId: number | null;
    
    p1_k1: number | null; p1_k2: number | null; p1_k3: number | null;
    p1_total: number | null; p1_nama: string | null;

    p2_k1: number | null; p2_k2: number | null; p2_k3: number | null;
    p2_total: number | null; p2_nama: string | null;

    nilai: number | null;
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

function getGrade(nilai: number | null): { huruf: string; color: string; bg: string } {
    if (nilai === null) return { huruf: "?", color: "text-slate-400", bg: "bg-slate-100" };
    if (nilai >= 80) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 70) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 60) return { huruf: "B-", color: "text-cyan-700", bg: "bg-cyan-100" };
    if (nilai >= 50) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 40) return { huruf: "C-", color: "text-amber-700", bg: "bg-amber-100" };
    return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
}

export function PenilaianMobile({ title }: { title?: string }) {
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

    // Custom dropdown & Accessibility states
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const [isLowVision, setIsLowVision] = useState(false);
    const [selectedPembimbingId, setSelectedPembimbingId] = useState<number | "all" | null>(null);
    const [activeTab, setActiveTab] = useState<"koordinator" | "pembimbing" | "penguji">("pembimbing");
    const [isEditingPenguji, setIsEditingPenguji] = useState(false);
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
            showToast("error", "Gagal memuat data.");
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
            showToast("success", "Nilai disimpan!");
        } catch {
            showToast("error", "Gagal menyimpan.");
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
    const activePembimbingId = activeTab === "koordinator" && isKoordinator 
        ? (selectedPembimbingId || currentDosen?.id || (dosenList.length > 0 ? dosenList[0].id : null)) 
        : (currentDosen?.id || null);
    
    const activePembimbing = activePembimbingId === "all" ? null : dosenList.find(d => d.id === activePembimbingId);
 
    const activePembimbingStudents = activePembimbingId === "all"
        ? data
        : data.filter(item => item.pembimbingId === activePembimbingId || item.pembimbingNama === activePembimbing?.nama);
    const activePengujiId = activePembimbingId === "all" ? null : (activePembimbingStudents[0]?.pengujiId || null);
    const activePenguji = activePembimbingId === "all" ? null : dosenList.find(d => d.id === activePengujiId);
 
    const supervisedStudents = data.filter(item => item.pembimbingId === currentDosen?.id || item.pembimbingNama === user?.name);
    const examinedStudents = data.filter(item => item.pengujiId === currentDosen?.id || item.pengujiNama === user?.name);
 
    const supervisorStudents = activeTab === "koordinator" && isKoordinator
        ? activePembimbingStudents
        : (activeTab === "pembimbing" ? supervisedStudents : examinedStudents);

    const filteredData = supervisorStudents.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.includes(searchQuery) ||
        (item.judulSkripsi && item.judulSkripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const calcP1Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p1_k1) || 0)) + (0.30 * (parseFloat(form.p1_k2) || 0)) + (0.35 * (parseFloat(form.p1_k3) || 0));
    };
    const calcP2Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p2_k1) || 0)) + (0.30 * (parseFloat(form.p2_k2) || 0)) + (0.35 * (parseFloat(form.p2_k3) || 0));
    };
    const avg = (calcP1Total() + calcP2Total()) / 2;

    const student = form ? data.find(d => d.mahasiswaId === form.mahasiswaId) : null;
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
            isLowVision ? "bg-white text-black font-bold p-2" : "bg-slate-50"
        )}>
            {/* Mobile Header */}
            <div className={cn("px-5 pt-8 pb-3 border-b sticky top-0 z-10 transition-all", isLowVision ? "bg-slate-100 border-black text-black" : "bg-white border-slate-100")}>
                <div className="flex items-center justify-between gap-2">
                    <h1 className={cn("font-black tracking-tight", isLowVision ? "text-2xl text-black font-black" : "text-xl text-slate-900")}>{title || "Evaluasi Kerja Praktik"}</h1>
                    <button
                        onClick={() => setIsLowVision(!isLowVision)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-1 shrink-0",
                            isLowVision 
                                ? "bg-black text-white border-black" 
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                        aria-label="Toggle Accessibility Mode"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        {isLowVision ? "Normal" : "Aksesibilitas"}
                    </button>
                </div>
                <p className={cn("text-xs mt-0.5", isLowVision ? "text-black font-extrabold text-sm" : "text-slate-500")}>Kelola nilai evaluasi kerja praktik dan dosen penguji untuk mahasiswa bimbingan.</p>
                
                <div className="mt-4 relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Cari nama..." 
                        className={cn(
                            "pl-9 bg-slate-50 border-none rounded-xl h-10 text-sm focus-visible:ring-brand-primary/20",
                            isLowVision && "border-2 border-black bg-white text-black font-black text-base placeholder-slate-700"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {user?.role !== 'admin' && (
                    <div className="flex gap-1.5 mt-4 bg-slate-100 p-1 rounded-xl">
                        {isKoordinator && (
                            <button
                                onClick={() => {
                                    setActiveTab("koordinator");
                                    setIsEditingPenguji(false);
                                }}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5",
                                    activeTab === "koordinator"
                                        ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500"
                                )}
                            >
                                Penugasan
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setActiveTab("pembimbing");
                                setIsEditingPenguji(false);
                            }}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5",
                                activeTab === "pembimbing"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500"
                            )}
                        >
                            Bimbingan ({supervisedStudents.length})
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("penguji");
                                setIsEditingPenguji(false);
                            }}
                            className={cn(
                                "flex-1 py-2 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5",
                                activeTab === "penguji"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500"
                            )}
                        >
                            Diuji ({examinedStudents.length})
                        </button>
                    </div>
                )}
            </div>

            {/* List Body */}
            <div className="flex-1 p-5 flex flex-col gap-4">
                {/* Unified Coordinator & Examiner Management Panel (tim penilai diluar dari tabel, dibawah menu download/search) */}
                {((activeTab === "koordinator" && isKoordinator) || activeTab === "pembimbing") && (() => {
                    const canAssign = (activeTab === "koordinator" && isKoordinator) || activePembimbing?.nama === user?.name;
                    return (
                        <div className={cn(
                            "p-5 rounded-2xl flex flex-col gap-4 transition-all",
                            isLowVision 
                                ? "bg-white border-3 border-black text-black" 
                                : "bg-white border border-slate-100 shadow-sm"
                        )}>
                            {/* 1. Pembimbing Selection Dropdown (Coordinator only) */}
                            {activeTab === "koordinator" && isKoordinator ? (
                                <div className="flex flex-col gap-2">
                                    <label className={cn("text-xs font-black uppercase tracking-wider text-slate-500", isLowVision ? "text-sm text-black font-black" : "text-slate-400")}>
                                        Pilih Dosen Pembimbing
                                    </label>
                                    <div className="relative custom-dropdown-container">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                setOpenDropdownId(openDropdownId === -10 ? null : -10);
                                                setDropdownSearch("");
                                            }}
                                            className={cn(
                                                "text-sm bg-slate-50 border rounded-xl px-3.5 py-2.5 font-bold text-slate-700 flex items-center justify-between w-full h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#119DA4] hover:bg-slate-100",
                                                openDropdownId === -10 ? "border-[#119DA4]" : "border-slate-100",
                                                isLowVision && "bg-white border-2 border-black font-black text-base text-black h-12"
                                            )}
                                        >
                                            <span className="truncate">
                                                {selectedPembimbingId === "all" ? "Semua Dosen Pembimbing" : (activePembimbing?.nama || "Pilih Pembimbing")}
                                            </span>
                                            <span className="text-slate-400 font-normal">▼</span>
                                        </Button>
                                        {openDropdownId === -10 && (
                                            <div className={cn(
                                                "absolute left-0 mt-1 w-full bg-white border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left",
                                                isLowVision ? "border-3 border-black text-black" : "border-slate-200"
                                            )}>
                                                <div className="relative mb-2">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Cari Pembimbing..."
                                                        value={dropdownSearch}
                                                        onChange={(e) => setDropdownSearch(e.target.value)}
                                                        className={cn(
                                                            "w-full pl-8 pr-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#119DA4]",
                                                            isLowVision ? "border-2 border-black text-black font-bold" : "border-slate-200"
                                                        )}
                                                    />
                                                </div>
                                                <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPembimbingId("all");
                                                            setOpenDropdownId(null);
                                                            setIsEditingPenguji(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-2.5 py-2.5 text-xs rounded-md transition-colors flex items-center justify-between gap-4 border-b border-slate-50",
                                                            selectedPembimbingId === "all" ? "bg-slate-100 text-[#119DA4] font-extrabold" : "text-slate-700 hover:bg-slate-50/50",
                                                            isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                                        )}
                                                    >
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-xs">Semua Dosen Pembimbing</span>
                                                            <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                                                                Tampilkan bimbingan dari seluruh dosen
                                                            </span>
                                                        </div>
                                                        {selectedPembimbingId === "all" && <span className="shrink-0 text-[#119DA4] font-black text-xs">✓</span>}
                                                    </button>
                                                    {dosenList
                                                        .filter(d => d.nama.toLowerCase().includes(dropdownSearch.toLowerCase()))
                                                        .map(d => {
                                                            const pembimbingStudents = data.filter(item => item.pembimbingId === d.id || item.pembimbingNama === d.nama);
                                                            const firstPengujiNama = pembimbingStudents.find(item => item.pengujiNama)?.pengujiNama;
                                                            
                                                            return (
                                                                <button
                                                                    key={d.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedPembimbingId(d.id);
                                                                        setOpenDropdownId(null);
                                                                        setIsEditingPenguji(false);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full text-left px-2.5 py-2.5 text-sm rounded-md transition-colors flex items-center justify-between gap-4 border-b border-slate-50",
                                                                        d.id === activePembimbingId ? "bg-slate-100 text-[#119DA4] font-extrabold" : "text-slate-700 hover:bg-slate-50/50",
                                                                        isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col min-w-0">
                                                                        <span className="truncate font-bold text-xs">{d.nama}</span>
                                                                        {pembimbingStudents.length > 0 ? (
                                                                            firstPengujiNama ? (
                                                                                <span className="text-[9px] text-emerald-600 font-extrabold truncate mt-0.5">
                                                                                    Penguji: {firstPengujiNama}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[9px] text-amber-600 font-black truncate mt-0.5">
                                                                                    Belum ada Penguji ⚠️
                                                                                </span>
                                                                            )
                                                                        ) : (
                                                                            <span className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                                                                                Tidak ada bimbingan
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {d.id === activePembimbingId && <span className="shrink-0 text-[#119DA4] font-black text-xs">✓</span>}
                                                                </button>
                                                            );
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Dosen Pembimbing</span>
                                    <span className={cn("text-base font-black text-slate-800", isLowVision && "text-lg text-black font-black")}>
                                        {activePembimbing?.nama || user?.name}
                                    </span>
                                </div>
                            )}

                            {/* 2. Bulk Dosen Penguji Selector */}
                            {activePembimbingId !== "all" && (
                                <div className="flex flex-col gap-2">
                                    <label className={cn("text-xs font-black uppercase tracking-wider text-slate-500", isLowVision ? "text-sm text-black font-black" : "text-slate-400")}>
                                        Dosen Penguji (Tugaskan Khusus Mahasiswa yang Dibimbing)
                                    </label>
                                    {canAssign ? (
                                        activePenguji && !isEditingPenguji ? (
                                            <div className={cn(
                                                "flex items-center justify-between gap-3 h-11 border px-3 rounded-xl bg-slate-50 border-slate-200/80 shadow-sm",
                                                isLowVision && "border-2 border-black bg-white h-12"
                                            )}>
                                                <span className={cn("text-sm font-bold text-slate-700 truncate flex items-center gap-1.5", isLowVision && "text-black font-black text-sm")}>
                                                    🔒 {activePenguji.nama}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditingPenguji(true)}
                                                    className={cn(
                                                        "h-8 text-[11px] font-black text-[#119DA4] bg-[#119DA4]/5 border border-[#119DA4]/20 hover:bg-[#119DA4]/10 rounded-lg px-2 flex items-center gap-1 shrink-0 transition-all",
                                                        isLowVision && "border-2 border-black text-black font-black text-xs hover:bg-slate-200 h-9"
                                                    )}
                                                >
                                                    Ubah Penguji
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="relative custom-dropdown-container">
                                                <div className="flex gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        type="button"
                                                        onClick={() => {
                                                            setOpenDropdownId(openDropdownId === -20 ? null : -20);
                                                            setDropdownSearch("");
                                                        }}
                                                        disabled={assigningId !== null}
                                                        className={cn(
                                                            "text-sm bg-slate-50 border rounded-xl px-3 py-2.5 font-bold text-slate-700 flex items-center justify-between flex-1 h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#119DA4] hover:bg-slate-100",
                                                            openDropdownId === -20 ? "border-[#119DA4]" : "border-slate-100",
                                                            isLowVision && "bg-white border-2 border-black font-black text-sm text-black h-12"
                                                        )}
                                                    >
                                                        <span className="truncate">
                                                            {activePenguji?.nama || "Belum Ditugaskan"}
                                                        </span>
                                                        <span className="text-slate-400 font-normal">▼</span>
                                                    </Button>
                                                    {activePenguji && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setIsEditingPenguji(false);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className={cn("h-11 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-bold", isLowVision && "border-2 border-black text-black h-12 font-black")}
                                                            title="Batalkan Pengeditan"
                                                        >
                                                            Batal
                                                        </Button>
                                                    )}
                                                </div>
                                                {openDropdownId === -20 && (
                                                    <div className={cn(
                                                        "absolute left-0 mt-1 w-full bg-white border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left",
                                                        isLowVision ? "border-3 border-black text-black" : "border-slate-200"
                                                    )}>
                                                        <div className="relative mb-2">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="Cari Penguji..."
                                                                value={dropdownSearch}
                                                                onChange={(e) => setDropdownSearch(e.target.value)}
                                                                className={cn(
                                                                    "w-full pl-8 pr-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-[#119DA4]",
                                                                    isLowVision ? "border-2 border-black text-black font-bold" : "border-slate-200"
                                                                )}
                                                            />
                                                        </div>
                                                        <div className="max-h-[160px] overflow-y-auto flex flex-col gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setConfirmAssignPenguji({
                                                                        pembimbingId: activePembimbingId!,
                                                                        pengujiId: null,
                                                                        pengujiNama: null
                                                                    });
                                                                    setOpenDropdownId(null);
                                                                    setIsEditingPenguji(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full text-left px-2.5 py-2 text-sm rounded-md font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5",
                                                                    isLowVision && "text-sm border-b border-black"
                                                                )}
                                                            >
                                                                ✕ Kosongkan Penguji
                                                            </button>
                                                            {dosenList
                                                                .filter(d => d.id !== activePembimbingId && d.nama.toLowerCase().includes(dropdownSearch.toLowerCase()))
                                                                .map(d => (
                                                                    <button
                                                                        key={d.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setConfirmAssignPenguji({
                                                                                pembimbingId: activePembimbingId!,
                                                                                pengujiId: d.id,
                                                                                pengujiNama: d.nama
                                                                            });
                                                                            setOpenDropdownId(null);
                                                                            setIsEditingPenguji(false);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full text-left px-2.5 py-2 text-sm rounded-md transition-colors flex items-center justify-between",
                                                                            d.id === activePengujiId ? "bg-slate-100 text-[#119DA4] font-extrabold" : "text-slate-700 hover:bg-slate-50",
                                                                            isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                                                        )}
                                                                    >
                                                                        <span className="truncate">{d.nama}</span>
                                                                        {d.id === activePengujiId && <span>✓</span>}
                                                                    </button>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        <span className={cn("text-sm font-bold text-slate-600", isLowVision && "text-sm text-black font-black")}>
                                            {activePenguji?.nama || "Belum Ditugaskan"}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                    {isKoordinator || activeTab === "pembimbing" ? "Jumlah Bimbingan" : "Jumlah Mahasiswa Diuji"}
                                </span>
                                <span className={cn("text-sm font-black text-slate-900", isLowVision && "text-black text-base font-black")}>
                                    {isKoordinator || activeTab === "pembimbing" ? activePembimbingStudents.length : examinedStudents.length} Mahasiswa
                                </span>
                            </div>
                        </div>
                    );
                })()}

                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-32 rounded-2xl animate-pulse animate-duration-1000" />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4"><AlertCircle size={32} /></div>
                        <p className={cn("text-sm font-bold", isLowVision ? "text-lg font-black text-black" : "text-slate-400")}>Tidak ada data mahasiswa</p>
                    </div>
                ) : filteredData.map(item => (
                    <div key={item.mahasiswaId} className={cn(
                        "rounded-2xl overflow-hidden flex flex-col transition-all",
                        isLowVision ? "bg-white border-3 border-black text-black" : "bg-white border border-slate-100 shadow-sm"
                    )}>
                        <div className={cn("p-4 flex items-start justify-between border-b", isLowVision ? "border-black bg-slate-50" : "border-slate-50")}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">{item.nama.substring(0, 1)}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className={cn("font-bold text-slate-900 truncate pr-4", isLowVision ? "text-base font-black text-black" : "text-sm")}>{item.nama}</span>
                                    <span className={cn("text-[10px] text-slate-400 font-medium", isLowVision && "text-xs font-black text-black")}>{item.nim}</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0", getGrade(item.nilai).bg, getGrade(item.nilai).color, isLowVision && "border-2 border-black text-black bg-slate-200")}>
                                {getGrade(item.nilai).huruf}
                            </div>
                        </div>
                        
                        {item.penilaianId ? (
                            <div className={cn("px-4 py-3 flex items-center justify-between", isLowVision ? "bg-slate-100 text-black border-b border-black" : "bg-slate-50/50")}>
                                <div className={cn("grid grid-cols-2 gap-4 flex-1 pr-4 border-r", isLowVision ? "border-black" : "border-slate-200")}>
                                     <div className="flex flex-col">
                                        <span className={cn("text-[9px] font-bold text-slate-400 uppercase tracking-widest", isLowVision && "text-[10px] font-black text-black")}>Pembimbing</span>
                                        <span className={cn("text-sm font-black", isLowVision ? "text-black text-base font-black" : "text-blue-600")}>{item.p1_total?.toFixed(1) || "-"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-[9px] font-bold text-slate-400 uppercase tracking-widest", isLowVision && "text-[10px] font-black text-black")}>Penguji</span>
                                        <span className={cn("text-sm font-black", isLowVision ? "text-black text-base font-black" : "text-orange-600")}>{item.p2_total?.toFixed(1) || "-"}</span>
                                    </div>

                                </div>
                                <div className="pl-4 flex flex-col items-center">
                                    <span className={cn("text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1", isLowVision && "text-[10px] font-black text-black")}>Rata-rata</span>
                                    <span className={cn("text-lg font-black text-slate-900", isLowVision && "text-xl font-black text-black")}>{item.nilai?.toFixed(1)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className={cn("px-4 py-4 flex items-center justify-center gap-2", isLowVision ? "bg-slate-200 border-b border-black" : "bg-amber-50/30")}>
                                <Info size={12} className={cn("text-amber-500", isLowVision && "text-black")} />
                                <span className={cn("text-[10px] font-bold uppercase", isLowVision ? "text-black font-black text-xs" : "text-amber-600")}>Belum ada penilaian</span>
                            </div>
                        )}

                        {/* Pembimbing & Penguji read-only info section */}
                        <div className={cn(
                            "px-4 py-2.5 border-t flex flex-col gap-1 text-[10px]",
                            isLowVision ? "bg-slate-100 border-black text-black font-black" : "bg-slate-50/30 border-slate-100 text-slate-500"
                        )}>
                            <div className="flex justify-between items-center gap-2 relative">
                                <span className="font-semibold">Pembimbing:</span>
                                <span className={cn("font-bold truncate text-slate-700", isLowVision && "text-black")}>{item.pembimbingNama}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                                <span className="font-semibold">Penguji:</span>
                                <span className={cn("font-bold truncate text-slate-700", isLowVision && "text-black")}>{item.pengujiNama || "Belum Ditugaskan"}</span>
                            </div>
                        </div>

                        <div className={cn("p-2 border-t flex items-center justify-end gap-2", isLowVision ? "border-black" : "border-slate-50")}>
                            {item.penilaianId && (
                                <button 
                                    onClick={() => setDeleteConfirm(item)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm shrink-0",
                                        isLowVision ? "border-2 border-black text-black bg-slate-100" : "border-slate-200"
                                    )}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                             <button 
                                onClick={() => openForm(item)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 h-10 rounded-xl text-xs font-bold transition-all",
                                    item.penilaianId ? "bg-slate-100 text-slate-600" : "bg-brand-primary text-white shadow-lg shadow-brand-primary/20",
                                    isLowVision && "border-2 border-black bg-black text-white hover:bg-slate-800 text-sm font-black"
                                )}
                             >
                                <Edit3 size={12} />
                                {item.penilaianId ? "Edit Nilai" : "Beri Nilai"}
                             </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal Mobile - Custom Fullscreen-ish overlay */}
            {form && (
                <div className={cn("fixed inset-0 z-[100] flex flex-col pt-safe animate-in slide-in-from-bottom-5 duration-300", isLowVision ? "bg-white text-black font-bold" : "bg-white")}>
                    <div className={cn("p-6 border-b flex items-center justify-between shrink-0", isLowVision ? "bg-slate-100 border-black" : "border-slate-100")}>
                        <button onClick={() => setForm(null)} className={cn("p-2 -ml-2 rounded-full text-slate-400 transition-colors", isLowVision ? "text-black" : "hover:bg-slate-100")}><X size={20} /></button>
                        <h2 className={cn("font-black", isLowVision ? "text-xl text-black font-black" : "text-lg text-slate-900")}>Form Evaluasi Kerja Praktik</h2>
                        <div className="w-8" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-['Noto_Sans']">
                        <div className="flex flex-col mb-2">
                             <span className={cn("font-black leading-tight", isLowVision ? "text-3xl text-black" : "text-2xl text-slate-900")}>{form.nama}</span>
                             <span className={cn("font-bold text-slate-400", isLowVision ? "text-base text-slate-700 font-extrabold" : "text-sm")}>{form.nim}</span>
                        </div>

                        {/* Dosen Pembimbing Section */}
                        <div className={cn(
                            "rounded-2xl p-5 border transition-all",
                            isLowVision ? "border-3 border-black bg-white text-black" : "bg-blue-50/50 border-blue-100/50",
                            !canEditP1 && "opacity-85 bg-slate-100/50"
                        )}>
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center font-bold">1</span>
                                        <span className={cn("text-xs font-black uppercase tracking-widest", isLowVision ? "text-black text-sm" : "text-blue-900")}>Dosen Pembimbing</span>
                                     </div>
                                     {!canEditP1 && (
                                         <span className="text-[10px] font-black text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                             <Lock size={9} /> Terkunci
                                         </span>
                                     )}
                                 </div>
                                 <div className="flex flex-col gap-4">
                                     <Input 
                                         value={form.p1_nama} 
                                         onChange={e => setForm({...form, p1_nama: e.target.value})} 
                                         disabled={!canEditP1}
                                         placeholder="Nama Dosen Pembimbing" 
                                         className={cn(
                                             "bg-white border-blue-100 h-10 text-sm",
                                             !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                             isLowVision && "border-2 border-black font-bold text-base h-12 text-black"
                                         )} 
                                     />

                                 <div className="grid grid-cols-3 gap-3">
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-blue-600")}>K1 (35%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p1_k1} 
                                            onChange={e => setForm({...form, p1_k1: e.target.value})} 
                                            disabled={!canEditP1}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-blue-600")}>K2 (30%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p1_k2} 
                                            onChange={e => setForm({...form, p1_k2: e.target.value})} 
                                            disabled={!canEditP1}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-blue-600")}>K3 (35%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p1_k3} 
                                            onChange={e => setForm({...form, p1_k3: e.target.value})} 
                                            disabled={!canEditP1}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP1 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* Dosen Penguji Section */}
                        <div className={cn(
                            "rounded-2xl p-5 border transition-all",
                            isLowVision ? "border-3 border-black bg-white text-black" : "bg-orange-50/50 border-orange-100/50",
                            !canEditP2 && "opacity-85 bg-slate-100/50"
                        )}>
                             <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center font-bold">2</span>
                                    <span className={cn("text-xs font-black uppercase tracking-widest", isLowVision ? "text-black text-sm" : "text-orange-900")}>Dosen Penguji</span>
                                 </div>
                                 {!canEditP2 && (
                                     <span className="text-[10px] font-black text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                                         <Lock size={9} /> Terkunci
                                     </span>
                                 )}
                             </div>
                             <div className="flex flex-col gap-4">
                                 <Input 
                                     value={form.p2_nama} 
                                     onChange={e => setForm({...form, p2_nama: e.target.value})} 
                                     disabled={!canEditP2}
                                     placeholder="Nama Dosen Penguji" 
                                     className={cn(
                                         "bg-white border-orange-100 h-10 text-sm",
                                         !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                         isLowVision && "border-2 border-black font-bold text-base h-12 text-black"
                                     )} 
                                 />

                                 <div className="grid grid-cols-3 gap-3">
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-orange-600")}>K1 (35%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p2_k1} 
                                            onChange={e => setForm({...form, p2_k1: e.target.value})} 
                                            disabled={!canEditP2}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-orange-600")}>K2 (30%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p2_k2} 
                                            onChange={e => setForm({...form, p2_k2: e.target.value})} 
                                            disabled={!canEditP2}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className={cn("text-[9px] font-bold uppercase ml-1", isLowVision ? "text-xs text-black" : "text-orange-600")}>K3 (35%)</label>
                                        <Input 
                                            type="number" 
                                            value={form.p2_k3} 
                                            onChange={e => setForm({...form, p2_k3: e.target.value})} 
                                            disabled={!canEditP2}
                                            className={cn(
                                                "h-10 text-center font-bold",
                                                !canEditP2 && "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed",
                                                isLowVision && "border-2 border-black font-black text-base h-12 text-black"
                                            )} 
                                        />
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Result Summary Mobile */}
                        <div className={cn("rounded-3xl p-6 flex flex-col gap-4 shadow-xl transition-all", isLowVision ? "bg-white border-3 border-black text-black" : "bg-slate-900 text-white")}>
                             <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                       <span className={cn("text-[10px] font-bold uppercase tracking-widest", isLowVision ? "text-black text-xs" : "text-slate-500")}>Rata-rata</span>
                                       <span className={cn("font-black", isLowVision ? "text-black text-4xl" : "text-white text-4xl")}>{avg.toFixed(1)}</span>
                                  </div>
                                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black", getGrade(avg).bg, getGrade(avg).color, isLowVision && "border-2 border-black text-black bg-slate-200")}>
                                       {getGrade(avg).huruf}
                                  </div>
                             </div>
                             <div className={cn("grid grid-cols-2 gap-4 pt-4 border-t", isLowVision ? "border-black" : "border-slate-800")}>
                                  <div className="flex flex-col">
                                       <span className={cn("text-[9px] font-bold uppercase tracking-widest", isLowVision ? "text-black text-[10px]" : "text-slate-600")}>Total Pembimbing</span>
                                       <span className={cn("text-sm font-bold", isLowVision ? "text-black text-base font-black" : "text-slate-300")}>{calcP1Total().toFixed(1)}</span>
                                  </div>
                                  <div className="flex flex-col">
                                       <span className={cn("text-[9px] font-bold uppercase tracking-widest", isLowVision ? "text-black text-[10px]" : "text-slate-600")}>Total Penguji</span>
                                       <span className={cn("text-sm font-bold", isLowVision ? "text-black text-base font-black" : "text-slate-300")}>{calcP2Total().toFixed(1)}</span>
                                  </div>
                             </div>
                        </div>
                        
                        <div className="pb-10">
                            <label className={cn("text-[10px] font-bold uppercase mb-1.5 block", isLowVision ? "text-sm text-black" : "text-slate-500")}>Catatan Tambahan</label>
                            <textarea 
                                value={form.keterangan}
                                onChange={e => setForm({...form, keterangan: e.target.value})}
                                placeholder="..."
                                className={cn(
                                    "w-full h-24 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/10",
                                    isLowVision ? "bg-white border-2 border-black text-black font-bold text-base" : "bg-slate-50 border-slate-100"
                                )}
                            />
                        </div>
                    </div>

                    <div className={cn("p-6 border-t shadow-[0_-4px_24px_rgba(0,0,0,0.05)] flex gap-3 shrink-0", isLowVision ? "bg-slate-100 border-black" : "bg-white border-slate-100")}>
                         <button onClick={() => setForm(null)} className={cn("flex-1 h-12 rounded-2xl font-black text-sm transition-colors", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600")}>Batal</button>
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "flex-[2] h-12 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all",
                                isLowVision 
                                    ? "bg-black text-white border-2 border-black hover:bg-slate-800 shadow-none font-black text-base" 
                                    : "bg-brand-primary shadow-brand-primary/20 hover:bg-brand-primary/90"
                            )}
                         >
                            <Save size={16} />
                            {isSaving ? "Menyimpan..." : "Simpan Nilai"}
                         </button>
                    </div>
                </div>
            )}

            {/* ===== CONFIRM ASSIGN PENGUJI MOBILE ===== */}
            {confirmAssignPenguji && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn("rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200", isLowVision ? "bg-white border-4 border-black text-black" : "bg-white")}>
                        <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto mb-4 font-bold shrink-0">
                            <AlertCircle size={28} />
                        </div>
                        <h3 className={cn("font-bold mb-1", isLowVision ? "text-xl text-black font-black" : "text-lg text-slate-900")}>Konfirmasi Penugasan Dosen Penguji</h3>
                        <p className={cn("text-xs mb-6 leading-relaxed", isLowVision ? "text-sm text-black font-bold" : "text-slate-500")}>
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
                                className={cn("flex-1 py-4.5 rounded-xl font-bold text-xs", isLowVision && "border-2 border-black text-black font-black")}
                            >
                                Batal
                            </Button>
                            <Button 
                                onClick={() => {
                                    handleAssignPengujiBulk(confirmAssignPenguji.pembimbingId, confirmAssignPenguji.pengujiId);
                                    setConfirmAssignPenguji(null);
                                }} 
                                className={cn("flex-1 py-4.5 rounded-xl text-white font-bold text-xs bg-brand-primary hover:bg-brand-primary/90", isLowVision && "bg-black text-white hover:bg-slate-800 border-2 border-black font-black")}
                            >
                                Ya, Konfirmasi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRM MOBILE ===== */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className={cn("rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-in zoom-in-95 duration-200", isLowVision ? "bg-white border-4 border-black text-black" : "bg-white")}>
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4 font-bold shrink-0">
                            <Trash2 size={28} />
                        </div>
                        <h3 className={cn("font-bold mb-1", isLowVision ? "text-xl text-black font-black" : "text-lg text-slate-900")}>Hapus Penilaian?</h3>
                        <p className={cn("text-xs mb-6 leading-relaxed", isLowVision ? "text-sm text-black font-bold" : "text-slate-500")}>Seluruh data komponen nilai untuk <strong>{deleteConfirm.nama}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className={cn("flex-1 py-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors", isLowVision ? "bg-slate-200 text-black border-2 border-black" : "bg-slate-100 text-slate-600")}>Batal</button>
                            <button onClick={handleDelete} className={cn("flex-1 py-3 rounded-xl text-white font-bold text-xs hover:bg-red-600 shadow-lg shadow-red-200 transition-colors", isLowVision ? "bg-black text-white hover:bg-slate-800 border-2 border-black" : "bg-red-500")}>Hapus</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Mobile */}
            {toast && (
                <div className={cn(
                    "fixed top-4 left-4 right-4 z-[200] p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl",
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-black tracking-tight">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
