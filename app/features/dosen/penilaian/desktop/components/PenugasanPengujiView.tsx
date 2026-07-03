import React, { useState } from "react";
import { getGrade } from "~/features/dosen/penilaian/desktop/PenilaianDesktop";
import type { PenilaianItem } from "~/features/dosen/penilaian/desktop/PenilaianDesktop";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, Edit3, Trash2, AlertCircle, Printer } from "lucide-react";
import { cn } from "~/lib/utils";

interface PenugasanPengujiViewProps {
    data: PenilaianItem[];
    dosenList: { id: string; nama: string }[];
    isLowVision: boolean;
    user: any;
    assigningId: string | null;
    openDropdownId: string | null;
    setOpenDropdownId: (val: string | null) => void;
    onAssignPenguji: (mahasiswaId: string, pengujiId: string) => Promise<void>;
    onCancelPenguji: (mahasiswaId: string) => Promise<void>;
    onOpenForm: (item: PenilaianItem) => void;
    onDeleteConfirm: (item: PenilaianItem) => void;
    setConfirmModal: (modal: any) => void;
    onRefresh?: () => Promise<void> | void;
    onCancelPengujiBulk: (pembimbingId: string) => Promise<void>;
}

export function PenugasanPengujiView({
    data,
    dosenList,
    isLowVision,
    user,
    assigningId,
    openDropdownId,
    setOpenDropdownId,
    onAssignPenguji,
    onCancelPenguji,
    onOpenForm,
    onDeleteConfirm,
    setConfirmModal,
    onRefresh,
    onCancelPengujiBulk
}: PenugasanPengujiViewProps) {
    const [selectedPembimbingId, setSelectedPembimbingId] = useState<string | "all" | null>("all");
    const [dropdownSearch, setDropdownSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditingBulk, setIsEditingBulk] = useState(false);

    const currentDosen = dosenList.find(d => d.nama === user?.name);
    const activePembimbingId = selectedPembimbingId === "all" ? null : (selectedPembimbingId || currentDosen?.id || (dosenList.length > 0 ? dosenList[0].id : null));
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

    const handlePrintSuratTugasBulk = (students: PenilaianItem[]) => {
        const firstStudent = students.find(s => s.suratTugasUrl);
        if (firstStudent && firstStudent.suratTugasUrl) {
            import("~/api/client").then(({ UPLOADS_URL }) => {
                window.open(`${UPLOADS_URL}${firstStudent.suratTugasUrl}`, '_blank');
            });
        } else {
            // Note: In PenugasanPengujiView, showToast is not directly available in props.
            // We can alert if it's not found or import a toast hook if available.
            alert("Surat tugas belum diunggah atau tidak ditemukan.");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top Toolbar / Search Panel */}
            <div className="flex justify-end mb-2">
                <div className="relative w-[280px]">
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
            </div>

            {/* Drill-down and Bulk Assign Card */}
            <div className={cn(
                "rounded-2xl p-6 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
                isLowVision
                    ? "bg-white border-4 border-black text-black"
                    : "bg-white border border-slate-200/80 shadow-sm"
            )}>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
                    {/* 1. Pembimbing Selection Dropdown */}
                    <div className="flex flex-col gap-2 w-full md:w-[280px]">
                        <label className={cn("text-xs font-black uppercase tracking-wider text-slate-500", isLowVision && "text-sm text-black font-black")}>
                            Pilih Dosen Pembimbing
                        </label>
                        <div className="relative custom-dropdown-container">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    setOpenDropdownId(openDropdownId === "-10" ? null : "-10");
                                    setDropdownSearch("");
                                }}
                                className={cn(
                                    "text-sm bg-white border rounded-xl px-3.5 py-2.5 font-bold text-slate-700 flex items-center justify-between w-full h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#119DA4] hover:bg-slate-50 hover:text-slate-800",
                                    openDropdownId === "-10" ? "border-[#119DA4]" : "border-slate-200",
                                    isLowVision && "border-2 border-black font-black text-base text-black h-12"
                                )}
                            >
                                <span className="truncate">
                                    {selectedPembimbingId === "all" ? "Semua Dosen Pembimbing" : (activePembimbing?.nama || "Pilih Pembimbing")}
                                </span>
                                <span>▼</span>
                            </Button>
                            {openDropdownId === "-10" && (
                                <div className={cn(
                                    "absolute left-0 mt-1.5 w-full min-w-[280px] bg-white border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left",
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
                                    <div className="max-h-[300px] overflow-y-auto flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPembimbingId("all");
                                                setOpenDropdownId(null);
                                            }}
                                            className={cn(
                                                "w-full text-left px-2.5 py-2.5 text-sm rounded-md transition-colors flex items-center justify-between gap-4 border-b border-slate-50",
                                                selectedPembimbingId === "all" ? "bg-slate-100 text-[#119DA4] font-extrabold" : "text-slate-700 hover:bg-slate-50/50",
                                                isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                            )}
                                        >
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-xs">Semua Dosen Pembimbing</span>
                                                <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
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
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-2.5 py-2.5 text-sm rounded-md transition-colors flex items-center justify-between gap-4 border-b border-slate-50",
                                                            d.id === activePembimbingId ? "bg-slate-100 text-[#119DA4] font-extrabold" : "text-slate-700 hover:bg-slate-50/50",
                                                            isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                                        )}
                                                    >
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="truncate font-bold">{d.nama}</span>
                                                            {pembimbingStudents.length > 0 ? (
                                                                firstPengujiNama ? (
                                                                    <span className="text-[10px] text-emerald-600 font-extrabold truncate mt-0.5">
                                                                        Penguji: {firstPengujiNama}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-amber-600 font-black truncate mt-0.5">
                                                                        Belum ada Penguji ⚠️
                                                                    </span>
                                                                )
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                                                    Tidak ada bimbingan
                                                                </span>
                                                            )}
                                                        </div>
                                                        {d.id === activePembimbingId && <span className="shrink-0 text-[#119DA4] font-black">✓</span>}
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Separator Line */}
                    <div className="hidden md:block w-[1px] h-10 bg-slate-200 shrink-0" />

                    {/* 2. Penguji Bulk Assignment Dropdown */}
                    <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[280px]">
                        <label className={cn("text-xs font-black uppercase tracking-wider text-slate-500", isLowVision && "text-sm text-black font-black")}>
                            Tugaskan Dosen Penguji
                        </label>
                        {activePengujiNama && !isEditingBulk && selectedPembimbingId !== "all" ? (
                            <div className="flex flex-col gap-2">
                                <div className={cn("flex items-center gap-2 px-3.5 py-2.5 rounded-xl border", isLowVision ? "border-2 border-black bg-white" : "border-orange-200 bg-orange-50")}>
                                    <span className={cn("font-bold text-sm truncate", isLowVision ? "text-black" : "text-orange-700")}>🔒 {activePengujiNama}</span>
                                </div>
                                <div className="flex flex-row gap-1.5">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handlePrintSuratTugasBulk(activePembimbingStudents)}
                                        className={cn("h-8 flex-1 text-[10px] font-bold text-blue-600 border-blue-200 hover:bg-blue-50 px-1", isLowVision && "border-2 border-black text-black")}
                                    >
                                        <Printer size={12} className="mr-1 hidden sm:inline" /> Cetak
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setIsEditingBulk(true)}
                                        className={cn("h-8 flex-1 text-[10px] font-bold text-orange-600 border-orange-200 hover:bg-orange-50 px-1", isLowVision && "border-2 border-black text-black")}
                                    >
                                        <Edit3 size={12} className="mr-1 hidden sm:inline" /> Ubah
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setConfirmModal({
                                            type: 'cancel_bulk',
                                            pembimbingId: activePembimbingId!,
                                            pembimbingName: activePembimbing?.nama
                                        })}
                                        className={cn("h-8 flex-1 text-[10px] font-bold text-red-600 border-red-200 hover:bg-red-50 px-1", isLowVision && "border-2 border-black text-black")}
                                    >
                                        <Trash2 size={12} className="mr-1 hidden sm:inline" /> Batal
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="relative custom-dropdown-container">
                                <Button
                                    variant="outline"
                                    type="button"
                                    disabled={selectedPembimbingId === "all" || !activePembimbingId}
                                    onClick={() => {
                                        setOpenDropdownId(openDropdownId === "-20" ? null : "-20");
                                        setDropdownSearch("");
                                    }}
                                className={cn(
                                    "text-sm bg-white border rounded-xl px-3.5 py-2.5 font-bold text-slate-700 flex items-center justify-between w-full h-11 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed",
                                    openDropdownId === "-20" ? "border-orange-500" : "border-slate-200",
                                    isLowVision && "border-2 border-black font-black text-base text-black h-12"
                                )}
                            >
                                <span className="truncate">
                                    {selectedPembimbingId === "all" ? "Pilih satu pembimbing dulu" : (activePengujiNama || "Pilih Penguji")}
                                </span>
                                <span>▼</span>
                            </Button>
                            {openDropdownId === "-20" && (
                                <div className={cn(
                                    "absolute left-0 mt-1.5 w-full min-w-[280px] bg-white border rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-left",
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
                                                "w-full pl-8 pr-2.5 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-orange-500",
                                                isLowVision ? "border-2 border-black text-black font-bold" : "border-slate-200"
                                            )}
                                        />
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto flex flex-col gap-0.5">
                                        {dosenList
                                            .filter(d => d.nama.toLowerCase().includes(dropdownSearch.toLowerCase()) && d.id !== activePembimbingId)
                                            .map(d => (
                                                <button
                                                    key={d.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenDropdownId(null);
                                                        setDropdownSearch("");
                                                        setConfirmModal({
                                                            type: 'bulk',
                                                            pembimbingId: activePembimbingId!,
                                                            pengujiId: d.id,
                                                            pembimbingName: activePembimbing?.nama,
                                                            pengujiName: d.nama
                                                        });
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors border-b border-slate-50 font-bold",
                                                        "text-slate-700 hover:bg-orange-50 hover:text-orange-700",
                                                        isLowVision && "text-sm text-black font-black hover:bg-slate-200 border-b border-black"
                                                    )}
                                                >
                                                    {d.nama}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Mahasiswa</span>
                    <span className={cn("text-2xl font-black text-slate-900", isLowVision && "text-black text-3xl font-black")}>
                        {activePembimbingStudents.length} Mahasiswa
                    </span>
                </div>
            </div>

            {/* Excel Table */}
            <div className={cn(
                "rounded-2xl overflow-hidden mb-10 transition-all",
                isLowVision
                    ? "bg-white border-4 border-black shadow-none"
                    : "bg-white shadow-sm border border-slate-200"
            )}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className={cn(
                                "border-b",
                                isLowVision ? "bg-black border-black text-white" : "bg-slate-50/50 border-slate-100"
                            )}>
                                <th colSpan={13} className="px-6 py-3 text-center">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-[0.2em]",
                                        isLowVision ? "text-white text-xs font-black" : "text-slate-400"
                                    )}>Fakultas Teknik Universitas Pancasila</span>
                                </th>
                            </tr>
                            <tr className={cn(
                                "border-b",
                                isLowVision ? "bg-white border-black text-black border-b-3" : "bg-white border-slate-100"
                            )}>
                                <th rowSpan={2} className={cn("px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-center w-12", isLowVision ? "text-black border-r border-black font-black text-xs" : "text-slate-400")}>No.</th>
                                <th rowSpan={2} className={cn("px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-32", isLowVision ? "text-black border-r border-black font-black text-xs" : "text-slate-400")}>NPM</th>
                                <th rowSpan={2} className={cn("px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-64", isLowVision ? "text-black border-r border-black font-black text-xs" : "text-slate-400")}>Nama Mahasiswa</th>
                                <th rowSpan={2} className={cn("px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-56 border-l", isLowVision ? "text-black border-black border-r font-black text-xs" : "text-slate-400")}>Dosen Pembimbing</th>
                                <th rowSpan={2} className={cn("px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-56 border-l", isLowVision ? "text-black border-black border-r font-black text-xs" : "text-slate-400")}>Dosen Penguji</th>
                                <th colSpan={3} className={cn("px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-center border-l", isLowVision ? "text-black border-black border-r font-black text-xs" : "text-slate-400 bg-blue-50/30")}>Dosen Pembimbing (35%, 30%, 35%)</th>
                                <th rowSpan={2} className={cn("px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-center border-l", isLowVision ? "text-black border-black border-r font-black text-xs bg-slate-100" : "text-blue-600 bg-blue-50/50")}>Nilai Pembimbing</th>
                                <th colSpan={3} className={cn("px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-center border-l", isLowVision ? "text-black border-black border-r font-black text-xs" : "text-slate-400 bg-orange-50/30")}>Dosen Penguji (35%, 30%, 35%)</th>
                                <th rowSpan={2} className={cn("px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-center border-l", isLowVision ? "text-black border-black border-r font-black text-xs bg-slate-100" : "text-orange-600 bg-orange-50/50")}>Nilai Penguji</th>
                                <th rowSpan={2} className={cn("px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center border-l", isLowVision ? "text-black border-black border-r font-black text-xs bg-slate-200" : "text-slate-900 bg-slate-50 font-black")}>Rata-rata</th>
                                <th rowSpan={2} className={cn("px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-center w-24", isLowVision ? "text-black font-black text-xs" : "text-slate-400")}>Aksi</th>
                            </tr>
                            <tr className={cn(
                                "border-b text-center",
                                isLowVision ? "bg-white border-black text-black" : "bg-white border-slate-100"
                            )}>
                                <th className={cn("px-2 py-2 text-[9px] font-bold border-l", isLowVision ? "border-black font-black text-xs" : "text-slate-400 bg-blue-50/10")}>C1</th>
                                <th className={cn("px-2 py-2 text-[9px] font-bold", isLowVision ? "border-l border-black font-black text-xs" : "text-slate-400 bg-blue-50/10")}>C2</th>
                                <th className={cn("px-2 py-2 text-[9px] font-bold", isLowVision ? "border-l border-black font-black text-xs" : "text-slate-400 bg-blue-50/10")}>C3</th>
                                <th className={cn("px-2 py-2 text-[9px] font-bold border-l", isLowVision ? "border-black font-black text-xs" : "text-slate-400 bg-orange-50/10")}>C1</th>
                                <th className={cn("px-2 py-2 text-[9px] font-bold", isLowVision ? "border-l border-black font-black text-xs" : "text-slate-400 bg-orange-50/10")}>C2</th>
                                <th className={cn("px-2 py-2 text-[9px] font-bold", isLowVision ? "border-l border-black font-black text-xs" : "text-slate-400 bg-orange-50/10")}>C3</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                             {filteredData.length === 0 ? (
                                 <tr>
                                     <td colSpan={12} className={cn("py-20 text-center text-sm", isLowVision ? "text-lg font-black text-black" : "text-slate-400")}>Belum ada data mahasiswa bimbingan dosen ini.</td>
                                 </tr>
                            ) : filteredData.map((item, idx) => (
                                <tr key={item.mahasiswaId} className={cn(
                                    "transition-colors group",
                                    isLowVision ? "hover:bg-slate-200 border-b border-black text-black font-bold" : "hover:bg-slate-50/50 border-b border-slate-100"
                                )}>
                                    <td className={cn("px-4 py-4 text-center text-xs font-medium", isLowVision ? "text-base font-black text-black border-r border-black" : "text-slate-500")}>{idx + 1}</td>
                                    <td className={cn("px-6 py-4 text-xs font-semibold", isLowVision ? "text-base font-black text-black border-r border-black" : "text-slate-600")}>{item.nim}</td>
                                    <td className={cn("px-6 py-4 whitespace-nowrap", isLowVision ? "border-r border-black" : "")}>
                                        <div className="flex flex-col">
                                            <span className={cn("font-bold text-slate-900", isLowVision ? "text-lg font-black text-black" : "text-sm")}>{item.nama}</span>

                                        </div>
                                    </td>
                                    <td className={cn("px-6 py-4 border-l font-bold text-slate-700", isLowVision ? "border-black border-r text-base font-black text-black" : "border-slate-100 text-sm")}>
                                        {item.pembimbingNama || "-"}
                                    </td>
                                    <td className={cn("px-4 py-4 border-l align-top", isLowVision ? "border-black border-r" : "border-slate-100")}>
                                        {item.pengujiNama ? (
                                            <div className="flex flex-col gap-2">
                                                <div className={cn("flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200", isLowVision && "border-2 border-black bg-white")}>
                                                    <span className={cn("text-xs font-bold text-slate-700 truncate", isLowVision && "text-black font-black")}>
                                                        🔒 {item.pengujiNama}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic font-medium px-2 block">Belum ada penguji</span>
                                        )}
                                    </td>
                                    <td className={cn("px-2 py-4 text-center text-xs border-l", isLowVision ? "text-sm border-black font-black text-black" : "bg-blue-50/5")}>{item.p1_k1 || "-"}</td>
                                    <td className={cn("px-2 py-4 text-center text-xs", isLowVision ? "text-sm border-l border-black font-black text-black" : "bg-blue-50/5")}>{item.p1_k2 || "-"}</td>
                                    <td className={cn("px-2 py-4 text-center text-xs", isLowVision ? "text-sm border-l border-black font-black text-black" : "bg-blue-50/5")}>{item.p1_k3 || "-"}</td>
                                    <td className={cn("px-4 py-4 text-center text-xs font-bold border-l", isLowVision ? "text-sm border-black font-black text-black bg-slate-100" : "text-blue-700 bg-blue-50/20")}>{item.p1_total?.toFixed(2) || "-"}</td>
                                    <td className={cn("px-2 py-4 text-center text-xs border-l", isLowVision ? "text-sm border-black font-black text-black" : "bg-orange-50/5")}>{item.p2_k1 || "-"}</td>
                                    <td className={cn("px-2 py-4 text-center text-xs", isLowVision ? "text-sm border-l border-black font-black text-black" : "bg-orange-50/5")}>{item.p2_k2 || "-"}</td>
                                    <td className={cn("px-2 py-4 text-center text-xs", isLowVision ? "text-sm border-l border-black font-black text-black" : "bg-orange-50/5")}>{item.p2_k3 || "-"}</td>
                                    <td className={cn("px-4 py-4 text-center text-xs font-bold border-l", isLowVision ? "text-sm border-black font-black text-black bg-slate-100" : "text-orange-700 bg-orange-50/20")}>{item.p2_total?.toFixed(2) || "-"}</td>
                                    <td className={cn("px-6 py-4 text-center border-l", isLowVision ? "text-base font-black text-black border-black bg-slate-200" : "bg-slate-50/50")}>
                                        <span className={cn("text-sm font-black", getGrade(item.nilai).color, isLowVision && "text-base underline text-black font-black")}>
                                            {item.nilai?.toFixed(2) || "-"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onOpenForm(item)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm",
                                                    isLowVision ? "border-2 border-black w-10 h-10 text-black bg-slate-100 hover:bg-slate-200" : "border-slate-200"
                                                )}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            {item.penilaianId && (
                                                <button
                                                    onClick={() => onDeleteConfirm(item)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm",
                                                        isLowVision ? "border-2 border-black w-10 h-10 text-black bg-slate-100 hover:bg-slate-200" : "border-slate-200"
                                                    )}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
