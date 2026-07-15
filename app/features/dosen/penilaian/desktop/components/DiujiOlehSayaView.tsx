import React, { useState } from "react";
import { getGrade } from "~/features/dosen/penilaian/desktop/PenilaianDesktop";
import type { PenilaianItem } from "~/features/dosen/penilaian/desktop/PenilaianDesktop";
import { Input } from "~/components/ui/input";
import { Search, Edit3, Trash2, FileText } from "lucide-react";
import { UPLOADS_URL } from "~/api/client";
import { cn } from "~/lib/utils";

interface DiujiOlehSayaViewProps {
    data: PenilaianItem[];
    dosenList: { id: string; nama: string }[];
    isLowVision: boolean;
    user: any;
    onOpenForm: (item: PenilaianItem) => void;
    onDeleteConfirm: (item: PenilaianItem) => void;
}

export function DiujiOlehSayaView({
    data,
    dosenList,
    isLowVision,
    user,
    onOpenForm,
    onDeleteConfirm
}: DiujiOlehSayaViewProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const currentDosen = dosenList.find(d => d.nama === user?.name);
    const myDosenId = currentDosen?.id || null;

    const examinedStudents = data.filter(item => item.pengujiId === myDosenId || item.pengujiNama === user?.name);

    const filteredData = examinedStudents.filter(item =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.includes(searchQuery) ||
        (item.judulSkripsi && item.judulSkripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

            {/* Read-only Examiner Mode Card */}
            <div className={cn(
                "rounded-2xl p-6 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all",
                isLowVision
                    ? "bg-white border-4 border-black text-black"
                    : "bg-white border border-slate-200/80 shadow-sm"
            )}>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Dosen Penguji</span>
                    <span className={cn("text-base font-black text-slate-800", isLowVision && "text-lg text-black font-black")}>
                        {currentDosen?.nama || user?.name}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Mahasiswa Diuji</span>
                        <span className={cn("text-2xl font-black text-slate-900", isLowVision && "text-black text-3xl font-black")}>
                            {examinedStudents.length} Mahasiswa
                        </span>
                    </div>
                    {examinedStudents.find(s => s.suratTugasUrl) && (
                        <a 
                            href={`${UPLOADS_URL}${examinedStudents.find(s => s.suratTugasUrl)?.suratTugasUrl}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className={cn(
                                "text-xs font-black px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm",
                                isLowVision 
                                    ? "bg-black text-white border-2 border-black hover:bg-slate-800" 
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                        >
                            <FileText size={14} /> Lihat Surat Tugas
                        </a>
                    )}
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
                                <th colSpan={10} className="px-6 py-3 text-center">
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
                                    <td colSpan={10} className={cn("py-20 text-center text-sm", isLowVision ? "text-lg font-black text-black" : "text-slate-400")}>Belum ada data mahasiswa yang Anda uji.</td>
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
