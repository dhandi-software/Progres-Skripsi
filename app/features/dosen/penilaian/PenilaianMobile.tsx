import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import { CheckCircle, Edit3, Trash2, X, Save, AlertCircle, Search, User, GraduationCap, ChevronRight, Calculator, Info } from "lucide-react";
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
    if (nilai >= 85) return { huruf: "A", color: "text-emerald-700", bg: "bg-emerald-100" };
    if (nilai >= 75) return { huruf: "B", color: "text-blue-700", bg: "bg-blue-100" };
    if (nilai >= 65) return { huruf: "C", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (nilai >= 55) return { huruf: "D", color: "text-orange-700", bg: "bg-orange-100" };
    return { huruf: "E", color: "text-red-700", bg: "bg-red-100" };
}

export function PenilaianMobile() {
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
            showToast("error", "Gagal memuat data.");
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
            showToast("success", "Nilai disimpan!");
        } catch {
            showToast("error", "Gagal menyimpan.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredData = data.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nim.includes(searchQuery)
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
        <div className="flex flex-col min-h-full bg-slate-50 font-['Noto_Sans']">
            {/* Mobile Header */}
            <div className="bg-white px-5 pt-8 pb-3 border-b border-slate-100 sticky top-0 z-10">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Penilaian Sidang</h1>
                <p className="text-xs text-slate-500 mt-0.5">Input nilai penguji untuk mahasiswa bimbingan.</p>
                
                <div className="mt-4 relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Cari nama..." 
                        className="pl-9 bg-slate-50 border-none rounded-xl h-10 text-sm focus-visible:ring-brand-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List Body */}
            <div className="flex-1 p-5 flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-32 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4"><AlertCircle size={32} /></div>
                        <p className="text-sm font-bold text-slate-400">Tidak ada data mahasiswa</p>
                    </div>
                ) : filteredData.map(item => (
                    <div key={item.mahasiswaId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-4 flex items-start justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">{item.nama.substring(0, 1)}</div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-bold text-slate-900 truncate pr-4">{item.nama}</span>
                                    <span className="text-[10px] text-slate-400 font-medium">{item.nim}</span>
                                </div>
                            </div>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0", getGrade(item.nilai).bg, getGrade(item.nilai).color)}>
                                {getGrade(item.nilai).huruf}
                            </div>
                        </div>
                        
                        {item.penilaianId ? (
                            <div className="px-4 py-3 bg-slate-50/50 flex items-center justify-between">
                                <div className="grid grid-cols-2 gap-4 flex-1 pr-4 border-r border-slate-200">
                                     <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dosen Pembimbing</span>
                                        <span className="text-sm font-black text-blue-600">{item.p1_total?.toFixed(1) || "-"}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dosen Penguji</span>
                                        <span className="text-sm font-black text-orange-600">{item.p2_total?.toFixed(1) || "-"}</span>
                                    </div>

                                </div>
                                <div className="pl-4 flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Rata-rata</span>
                                    <span className="text-lg font-black text-slate-900">{item.nilai?.toFixed(1)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="px-4 py-4 flex items-center justify-center gap-2 bg-amber-50/30">
                                <Info size={12} className="text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600 uppercase">Belum ada penilaian</span>
                            </div>
                        )}

                        <div className="p-2 border-t border-slate-50 flex items-center justify-end gap-2">
                             <button 
                                onClick={() => openForm(item)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all",
                                    item.penilaianId ? "bg-slate-100 text-slate-600" : "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
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
                <div className="fixed inset-0 z-[100] bg-white flex flex-col pt-safe animate-in slide-in-from-bottom-5 duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                        <button onClick={() => setForm(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={20} /></button>
                        <h2 className="text-lg font-black text-slate-900">Form Nilai Sidang</h2>
                        <div className="w-8" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-['Noto_Sans']">
                        <div className="flex flex-col mb-2">
                             <span className="text-2xl font-black text-slate-900 leading-tight">{form.nama}</span>
                             <span className="text-sm font-bold text-slate-400">{form.nim}</span>
                        </div>

                        {/* P1 Card Mobile */}
                        <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                                 <div className="flex items-center gap-2 mb-4">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
                                    <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Dosen Pembimbing</span>
                                 </div>
                                 <div className="flex flex-col gap-4">
                                     <Input value={form.p1_nama} onChange={e => setForm({...form, p1_nama: e.target.value})} placeholder="Nama Dosen Pembimbing" className="bg-white border-blue-100 h-10 text-sm" />

                                 <div className="grid grid-cols-3 gap-3">
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-blue-600 uppercase ml-1">K1 (35%)</label>
                                        <Input type="number" value={form.p1_k1} onChange={e => setForm({...form, p1_k1: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-blue-600 uppercase ml-1">K2 (30%)</label>
                                        <Input type="number" value={form.p1_k2} onChange={e => setForm({...form, p1_k2: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-blue-600 uppercase ml-1">K3 (35%)</label>
                                        <Input type="number" value={form.p1_k3} onChange={e => setForm({...form, p1_k3: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                 </div>
                             </div>
                        </div>
                        
                        {/* P2 Card Mobile */}
                        <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                                <span className="text-xs font-black text-orange-900 uppercase tracking-widest">Dosen Penguji</span>
                             </div>
                             <div className="flex flex-col gap-4">
                                 <Input value={form.p2_nama} onChange={e => setForm({...form, p2_nama: e.target.value})} placeholder="Nama Dosen Penguji" className="bg-white border-orange-100 h-10 text-sm" />

                                 <div className="grid grid-cols-3 gap-3">
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-orange-600 uppercase ml-1">K1 (35%)</label>
                                        <Input type="number" value={form.p2_k1} onChange={e => setForm({...form, p2_k1: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-orange-600 uppercase ml-1">K2 (30%)</label>
                                        <Input type="number" value={form.p2_k2} onChange={e => setForm({...form, p2_k2: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                     <div className="flex flex-col gap-1">
                                        <label className="text-[9px] font-bold text-orange-600 uppercase ml-1">K3 (35%)</label>
                                        <Input type="number" value={form.p2_k3} onChange={e => setForm({...form, p2_k3: e.target.value})} className="h-10 text-center font-bold" />
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Result Summary Mobile */}
                        <div className="bg-slate-900 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
                             <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                       <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Rata-rata</span>
                                       <span className="text-4xl font-black text-white">{avg.toFixed(1)}</span>
                                  </div>
                                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black", getGrade(avg).bg, getGrade(avg).color)}>
                                       {getGrade(avg).huruf}
                                  </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                  <div className="flex flex-col">
                                       <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Total Pembimbing</span>
                                       <span className="text-sm font-bold text-slate-300">{calcP1Total().toFixed(1)}</span>
                                  </div>
                                  <div className="flex flex-col">
                                       <span className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">Total Penguji</span>
                                       <span className="text-sm font-bold text-slate-300">{calcP2Total().toFixed(1)}</span>
                                  </div>

                             </div>
                        </div>
                        
                        <div className="pb-10">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">Catatan Tambahan</label>
                            <textarea 
                                value={form.keterangan}
                                onChange={e => setForm({...form, keterangan: e.target.value})}
                                placeholder="..."
                                className="w-full h-24 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] flex gap-3 shrink-0">
                         <button onClick={() => setForm(null)} className="flex-1 h-12 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm">Batal</button>
                         <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] h-12 rounded-2xl bg-brand-primary text-white font-black text-sm shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                         >
                            <Save size={16} />
                            {isSaving ? "Menyimpan..." : "Simpan Nilai"}
                         </button>
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
