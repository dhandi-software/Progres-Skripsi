import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, Download, FileText, User, GraduationCap } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface PenilaianItem {
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
    if (nilai === null) return { huruf: "?", color: "text-gray-400", bg: "bg-gray-100" };
    if (nilai >= 85) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 75) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 65) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 55) return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
    return { huruf: "E", color: "text-red-700", bg: "bg-red-100" };
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

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const result = await penilaianApi.getPenilaianByDosen();
            setData(result || []);
        } catch {
            showToast("error", "Gagal memuat data penilaian.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

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
            p1_nama: item.p1_nama || user?.name || "",
            p2_k1: item.p2_k1 !== null ? String(item.p2_k1) : "",
            p2_k2: item.p2_k2 !== null ? String(item.p2_k2) : "",
            p2_k3: item.p2_k3 !== null ? String(item.p2_k3) : "",
            p2_nama: item.p2_nama || "",
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

    const filteredData = data.filter(item => 
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

    return (
        <div className="flex flex-col min-h-full bg-[#f8fafc] p-8 font-['Noto_Sans']">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Penilaian Sidang Skripsi</h1>
                     <p className="text-slate-500 mt-1 text-sm">Kelola nilai akhir penguji untuk mahasiswa bimbingan yang telah lulus tahap monitoring.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Cari nama, nim..." 
                            className="pl-9 bg-white border-slate-200 focus-visible:ring-brand-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm w-10 h-10">
                                    <Download className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Unduh Excel</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Excel-like Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            {/* University Header Row */}
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th colSpan={10} className="px-6 py-3 text-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Fakultas Teknik Universitas Pancasila</span>
                                </th>
                            </tr>
                            <tr className="bg-white border-b border-slate-100">
                                <th rowSpan={2} className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center w-12">No.</th>
                                <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-32">NPM</th>
                                <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-64">Nama Mahasiswa</th>
                                
                                <th colSpan={3} className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center border-l bg-blue-50/30">Dosen Pembimbing (35%, 30%, 35%)</th>
                                <th rowSpan={2} className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-blue-600 text-center border-l bg-blue-50/50">Nilai Pembimbing</th>
                                
                                <th colSpan={3} className="px-6 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center border-l bg-orange-50/30">Dosen Penguji (35%, 30%, 35%)</th>
                                <th rowSpan={2} className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-orange-600 text-center border-l bg-orange-50/50">Nilai Penguji</th>
                                
                                <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-900 text-center border-l bg-slate-50 font-black">Rata-rata</th>
                                <th rowSpan={2} className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 w-48 border-l">Tim Penilai</th>

                                <th rowSpan={2} className="px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center w-24">Aksi</th>
                            </tr>
                            <tr className="bg-white border-b border-slate-100 text-center">
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 border-l bg-blue-50/10">C1</th>
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 bg-blue-50/10">C2</th>
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 bg-blue-50/10">C3</th>
                                
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 border-l bg-orange-50/10">C1</th>
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 bg-orange-50/10">C2</th>
                                <th className="px-2 py-2 text-[9px] font-bold text-slate-400 bg-orange-50/10">C3</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={14} className="py-20 text-center">
                                        <div className="w-8 h-8 rounded-full border-3 border-slate-200 border-t-brand-primary animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="py-20 text-center text-slate-400 text-sm">Belum ada data mahasiswa bimbingan.</td>
                                </tr>
                            ) : filteredData.map((item, idx) => (
                                <tr key={item.mahasiswaId} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-4 py-4 text-center text-xs text-slate-500 font-medium">{idx + 1}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{item.nim}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">{item.nama}</span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-tight">{item.jurusan}</span>
                                        </div>
                                    </td>
                                    
                                    {/* P1 Components */}
                                    <td className="px-2 py-4 text-center text-xs border-l bg-blue-50/5">{item.p1_k1 || "-"}</td>
                                    <td className="px-2 py-4 text-center text-xs bg-blue-50/5">{item.p1_k2 || "-"}</td>
                                    <td className="px-2 py-4 text-center text-xs bg-blue-50/5">{item.p1_k3 || "-"}</td>
                                    <td className="px-4 py-4 text-center text-xs font-bold text-blue-700 border-l bg-blue-50/20">{item.p1_total?.toFixed(2) || "-"}</td>
                                    
                                    {/* P2 Components */}
                                    <td className="px-2 py-4 text-center text-xs border-l bg-orange-50/5">{item.p2_k1 || "-"}</td>
                                    <td className="px-2 py-4 text-center text-xs bg-orange-50/5">{item.p2_k2 || "-"}</td>
                                    <td className="px-2 py-4 text-center text-xs bg-orange-50/5">{item.p2_k3 || "-"}</td>
                                    <td className="px-4 py-4 text-center text-xs font-bold text-orange-700 border-l bg-orange-50/20">{item.p2_total?.toFixed(2) || "-"}</td>
                                    
                                    <td className="px-6 py-4 text-center border-l bg-slate-50/50">
                                        <span className={cn("text-sm font-black", getGrade(item.nilai).color)}>
                                            {item.nilai?.toFixed(2) || "-"}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 border-l">
                                        <div className="flex flex-col gap-1">
                                            {item.p1_nama ? (
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">1</span>
                                                    <span className="truncate">{item.p1_nama}</span>
                                                </div>
                                            ) : <span className="text-[10px] text-slate-300 italic">P1: -</span>}
                                            {item.p2_nama ? (
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                                    <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">2</span>
                                                    <span className="truncate">{item.p2_nama}</span>
                                                </div>
                                            ) : <span className="text-[10px] text-slate-300 italic">P2: -</span>}
                                        </div>
                                    </td>
                                    
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openForm(item)}
                                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            {item.penilaianId && (
                                                <button 
                                                    onClick={() => setDeleteConfirm(item)}
                                                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
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

            {/* Comparison Logic / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><GraduationCap size={20} /></div>
                        <h3 className="font-bold text-slate-800">Status Penilaian</h3>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-slate-900">{data.filter(d => d.penilaianId).length}<span className="text-sm font-normal text-slate-400 ml-1">/{data.length}</span></span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">DIPENUHI</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle size={20} /></div>
                        <h3 className="font-bold text-slate-800">Rata-rata Kelas</h3>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-black text-slate-900">
                             {(data.reduce((acc, curr) => acc + (curr.nilai || 0), 0) / (data.filter(d => d.nilai).length || 1)).toFixed(2)}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-sans">B+</span>
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Informasi Sidang</p>
                    <p className="text-white text-sm leading-relaxed mt-2 italic font-serif">"Pastikan seluruh komponen nilai (K1-K3) telah diverifikasi dari lembar penilaian fisik masing-masing penguji."</p>
                    <div className="mt-4 flex items-center gap-2 text-slate-400 text-[10px]">
                        <Clock size={12} />
                        <span>Pembaharuan terakhir: {new Date().toLocaleDateString("id-ID")}</span>
                    </div>
                </div>
            </div>

            {/* ===== GRADING MODAL ===== */}
            {form && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full  overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
                         <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary"><Edit3 size={20} /></div>
                                 <div>
                                     <h2 className="text-lg font-bold text-slate-900 leading-none">Beri Nilai Sidang</h2>
                                     <p className="text-xs text-slate-500 mt-1">{form.nama} • {form.nim}</p>
                                 </div>
                             </div>
                             <button onClick={() => setForm(null)} className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-400"><X size={20} /></button>
                         </div>
                         
                         <div className="p-6 md:p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto">
                             {/* Penguji 1 Section */}
                             <div className="bg-blue-50/30 rounded-2xl border border-blue-100/50 p-5">
                                 <div className="flex items-center gap-2 mb-4">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
                                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Dosen Pembimbing</span>
                                 </div>
                                 <div className="flex flex-col gap-4">
                                     <Input value={form.p1_nama} onChange={e => setForm({...form, p1_nama: e.target.value})} placeholder="Nama Dosen Pembimbing" className="bg-white border-blue-100 h-10 text-sm" />
                                     <div className="grid grid-cols-3 gap-3">
                                         <div>
                                             <label className="text-[10px] font-bold text-blue-700 uppercase mb-1.5 block">K1 (35%)</label>
                                             <Input type="number" value={form.p1_k1} onChange={e => setForm({...form, p1_k1: e.target.value})} className="bg-white border-blue-200 h-11 text-center font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] font-bold text-blue-700 uppercase mb-1.5 block">K2 (30%)</label>
                                             <Input type="number" value={form.p1_k2} onChange={e => setForm({...form, p1_k2: e.target.value})} className="bg-white border-blue-200 h-11 text-center font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] font-bold text-blue-700 uppercase mb-1.5 block">K3 (35%)</label>
                                             <Input type="number" value={form.p1_k3} onChange={e => setForm({...form, p1_k3: e.target.value})} className="bg-white border-blue-200 h-11 text-center font-bold" />
                                         </div>
                                     </div>
                                 </div>
                                 <div className="mt-4 pt-3 flex justify-end">
                                     <span className="text-[11px] font-bold text-blue-800">Total P1: <span className="text-lg ml-1 font-black underline decoration-2 underline-offset-4">{calcP1Total().toFixed(2)}</span></span>
                                 </div>
                             </div>

                             {/* Penguji 2 Section */}
                             <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
                                 <div className="flex items-center gap-2 mb-4">
                                    <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                                    <span className="text-xs font-black text-orange-900 uppercase tracking-widest">Dosen Penguji</span>
                                 </div>
                                 <div className="flex flex-col gap-4">
                                     <Input value={form.p2_nama} onChange={e => setForm({...form, p2_nama: e.target.value})} placeholder="Nama Dosen Penguji" className="bg-white border-orange-100 h-10 text-sm" />
                                     <div className="grid grid-cols-3 gap-3">
                                         <div>
                                             <label className="text-[10px] font-bold text-orange-700 uppercase mb-1.5 block">K1 (35%)</label>
                                             <Input type="number" value={form.p2_k1} onChange={e => setForm({...form, p2_k1: e.target.value})} className="bg-white border-orange-200 h-11 text-center font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] font-bold text-orange-700 uppercase mb-1.5 block">K2 (30%)</label>
                                             <Input type="number" value={form.p2_k2} onChange={e => setForm({...form, p2_k2: e.target.value})} className="bg-white border-orange-200 h-11 text-center font-bold" />
                                         </div>
                                         <div>
                                             <label className="text-[10px] font-bold text-orange-700 uppercase mb-1.5 block">K3 (35%)</label>
                                             <Input type="number" value={form.p2_k3} onChange={e => setForm({...form, p2_k3: e.target.value})} className="bg-white border-orange-200 h-11 text-center font-bold" />
                                         </div>
                                     </div>
                                 </div>
                                 <div className="mt-4 pt-3 flex justify-end">
                                     <span className="text-[11px] font-bold text-orange-800">Total P2: <span className="text-lg ml-1 font-black underline decoration-2 underline-offset-4">{calcP2Total().toFixed(2)}</span></span>
                                 </div>
                             </div>

                             {/* Final Summary Card */}
                             <div className="bg-slate-900 rounded-2xl p-6 flex items-center justify-between shadow-lg">
                                 <div>
                                     <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest block mb-1">Nilai Rata-rata Akhir</span>
                                     <span className="text-4xl font-black text-white">{avg.toFixed(2)}</span>
                                 </div>
                                 <div className="flex flex-col items-center gap-1 group">
                                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner shadow-black/20", getGrade(avg).bg, getGrade(avg).color)}>
                                         {getGrade(avg).huruf}
                                     </div>
                                     <span className="text-slate-500 text-[10px] font-bold truncate max-w-[80px]">HURUF MUTU</span>
                                 </div>
                             </div>

                             {/* Keterangan */}
                             <div>
                                 <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block leading-none">Keterangan / Catatan Sidang</label>
                                 <textarea 
                                     value={form.keterangan}
                                     onChange={e => setForm({...form, keterangan: e.target.value})}
                                     placeholder="Tambahkan catatan hasil sidang jika ada..."
                                     className="w-full min-h-[80px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none font-sans"
                                 />
                             </div>
                         </div>

                         <div className="bg-slate-50 px-6 py-5 flex items-center justify-end gap-3 border-t border-slate-100">
                             <button onClick={() => setForm(null)} className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors">Batal</button>
                             <button 
                                 onClick={handleSave} 
                                 disabled={isSaving}
                                 className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                             >
                                 <Save size={16} />
                                 {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
                             </button>
                         </div>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRM ===== */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[1010] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-5">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Penilaian?</h3>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">Seluruh data komponen nilai untuk <strong>{deleteConfirm.nama}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Batal</button>
                            <button onClick={handleDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors">Hapus</button>
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
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

