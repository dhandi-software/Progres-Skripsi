import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { bimbinganApi } from "~/api/bimbinganApi";
import { 
    Calendar, Clock, MapPin, CheckCircle, AlertCircle, 
    MoreVertical, Edit3, Trash2, Search, User, Filter,
    Check, CheckCircle2, XCircle, MapPinned, Users, ArrowRight
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { MonthYearFilter } from "~/components/ui/calendar";
import { SidangPengajuanForm } from "../../dosen/sidang/SidangPengajuanForm";

interface SidangItem {
    id: number;
    mahasiswaId: number;
    mahasiswa: {
        nama: string;
        nim: string;
        jurusan: string;
    };
    dosen: {
        nama: string;
        userId: number;
    };
    dosenId: number;
    pengujiId: number | null;
    judul: string;
    tanggalSidang: string | null;
    waktuSidang: string | null;
    lokasi: string | null;
    status: string;
    pembimbingApproved: boolean;
    prodiApproved: boolean;
    catatan: string | null;
}

export function StafSidangDesktop() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [bimbinganStudents, setBimbinganStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"sidang" | "pengajuan">("sidang");
    const [isScheduling, setIsScheduling] = useState<SidangItem | null>(null);
    const [isApplying, setIsApplying] = useState<any | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter students who are ready for defense (Bab 5 Approved) but don't have a record yet
    const eligibleStudents = bimbinganStudents
        .filter(m => !sidangs.some(s => s.mahasiswaId === m.mahasiswa.id))
        .filter(m => m.mahasiswa.bimbingan && m.mahasiswa.bimbingan.some((b: any) => 
            b.status === 'APPROVED' && 
            (
                b.topik.toLowerCase().includes('bab 5') || 
                b.topik.toLowerCase().includes('bab v') ||
                b.topik.toLowerCase().includes('bab v ') ||
                b.topik.toLowerCase().includes('bab 5 ') ||
                b.topik.toLowerCase().includes('final')
            )
        ));
    
    // Scheduling Form
    const [schedData, setSchedData] = useState({
        tanggalSidang: "",
        waktuSidang: "09:00",
        lokasi: "Ruang Sidang Lt. 3",
        catatan: ""
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sidangData, bimbinganData] = await Promise.all([
                sidangApi.getAllSidang(),
                bimbinganApi.getDosenBimbinganStudents()
            ]);
            setSidangs(sidangData);
            setBimbinganStudents(bimbinganData);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleApply = async (formData: { tanggalSidang: string; waktuSidang: string; lokasi: string }) => {
        if (!isApplying) return;
        try {
            await sidangApi.applyForSidang({
                mahasiswaId: isApplying.mahasiswa.id,
                judul: isApplying.judul || "Skripsi",
                ...formData
            });
            setIsApplying(null);
            fetchData();
            showToast("success", "Berhasil menjadwalkan sidang! Menunggu ACC Pembimbing.");
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Gagal menjadwalkan sidang.");
        }
    };

    const handleSchedule = async () => {
        if (!isScheduling || !selectedDate) return;
        try {
            await sidangApi.scheduleByProdi(isScheduling.id, {
                tanggalSidang: format(selectedDate, "yyyy-MM-dd"),
                waktuSidang: schedData.waktuSidang,
                lokasi: schedData.lokasi,
                pengujiId: null,
                catatan: schedData.catatan
            });
            setIsScheduling(null);
            fetchData();
            showToast("success", "Jadwal berhasil diperbarui!");
        } catch (error: any) {
            showToast("error", error.response?.data?.message || "Gagal memperbarui jadwal.");
        }
    };

    const getStatusInfo = (status: string) => {
        if (status === "TERJADWAL") return { label: "Terjadwal", color: "text-emerald-600 bg-emerald-50" };
        switch (status) {
            case "MENUNGGU_PERSETUJUAN_PEMBIMBING":
                return { label: "Menunggu ACC Pembimbing", color: "text-amber-600 bg-amber-50" };
            case "MENUNGGU_VERIFIKASI_KAPRODI":
                return { label: "Menunggu Verifikasi Kaprodi", color: "text-purple-600 bg-purple-50" };
            case "MENUNGGU_PENJADWALAN_PRODI":
                return { label: "Menunggu Jadwal Prodi", color: "text-blue-600 bg-blue-50" };
            case "SELESAI":
                return { label: "Selesai", color: "text-slate-600 bg-slate-50" };
            default:
                return { label: status, color: "text-slate-600 bg-slate-50" };
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-8 md:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Penjadwalan Sidang (Staff)</h1>
                     <p className="text-slate-500 text-sm mt-1">Atur dan kelola jadwal sidang mahasiswa.</p>
                </div>
            </div>

            <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-6">
                <button 
                    onClick={() => setActiveTab("sidang")}
                    className={cn(
                        "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                        activeTab === "sidang" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Daftar Sidang
                </button>
                <button 
                    onClick={() => setActiveTab("pengajuan")}
                    className={cn(
                        "px-6 py-2 text-sm font-bold rounded-lg transition-all",
                        activeTab === "pengajuan" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    Siap Sidang
                </button>
            </div>

            {activeTab === "sidang" ? (
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="h-40 bg-white rounded-[32px] animate-pulse" />
                    ) : sidangs.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                 <Calendar size={48} />
                             </div>
                             <h3 className="text-xl font-black text-slate-900 tracking-tight">Belum Ada Data Sidang</h3>
                             <p className="text-slate-400 mx-auto mt-3 font-medium">Semua data pengajuan sidang akan muncul di sini.</p>
                        </div>
                    ) : sidangs.map(item => (
                        <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                            <div className="flex items-center gap-6 flex-1 min-w-0">
                                <div className="w-16 h-16 rounded-[22px] bg-brand-primary/5 flex items-center justify-center text-brand-primary shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                    <User size={32} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col min-w-0 gap-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-lg font-black text-slate-900 tracking-tight truncate">{item.mahasiswa.nama}</span>
                                        <span className={cn("text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-sm", getStatusInfo(item.status).color.replace('bg-', 'bg-opacity-20 bg-'))}>
                                            {getStatusInfo(item.status).label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded">NPM: {item.mahasiswa.nim}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-brand-primary/80">Pembimbing: {item.dosen?.nama || "Belum ditentukan"}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 italic mt-1 line-clamp-1 opacity-70">"{item.judul || 'Skripsi'}"</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 xl:pr-10 xl:border-r border-slate-100">
                                {item.tanggalSidang ? (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Jadwal Pelaksanaan</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                                <Calendar size={18} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900">{format(new Date(item.tanggalSidang), "EEEE, dd MMM yyyy", { locale: id })}</span>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold">
                                                    <Clock size={12} />
                                                    {item.waktuSidang}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Jadwal</span>
                                         <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                             <AlertCircle size={14} />
                                             <span className="text-xs font-black">Belum Dijadwalkan</span>
                                         </div>
                                    </div>
                                )}
 
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Lokasi Sidang</span>
                                    <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100/50">
                                        <MapPin size={16} className="text-slate-300" />
                                        {item.lokasi || "Belum ditentukan"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <Button 
                                    onClick={() => {
                                        setIsScheduling(item);
                                        setSchedData({
                                            tanggalSidang: item.tanggalSidang || "",
                                            waktuSidang: item.waktuSidang || "09:00",
                                            lokasi: item.lokasi || "Ruang Sidang Lt. 3",
                                            catatan: item.catatan || ""
                                        });
                                        if (item.tanggalSidang) setSelectedDate(new Date(item.tanggalSidang));
                                        else setSelectedDate(undefined);
                                    }}
                                    className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2 shadow-lg shadow-brand-primary/20"
                                >
                                    <Calendar size={14} />
                                    {item.tanggalSidang ? "Ubah Jadwal" : "Atur Jadwal"}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eligibleStudents.length > 0 ? (
                        eligibleStudents.map(student => (
                            <div key={student.id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                <div className="w-20 h-20 rounded-[28px] bg-brand-primary/5 flex items-center justify-center text-brand-primary mb-6 font-black text-2xl group-hover:scale-110 transition-transform duration-500">
                                    {student.mahasiswa.nama.substring(0,1)}
                                </div>
                                <h4 className="font-black text-slate-900 tracking-tight text-lg mb-1">{student.mahasiswa.nama}</h4>
                                <p className="text-[11px] font-bold text-slate-400 mb-2 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-wider">{student.mahasiswa.nim}</p>
                                
                                <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 shadow-inner">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dosen Pembimbing</span>
                                    <span className="text-sm font-bold text-brand-primary">{student.dosen?.nama || "Belum ditentukan"}</span>
                                </div>
                                
                                <div className="w-full pt-2 mt-auto">
                                    <Button 
                                        onClick={() => setIsApplying(student)}
                                        className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-12 font-black text-xs gap-3 shadow-lg shadow-slate-200"
                                    >
                                        Mulai Penjadwalan
                                        <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white rounded-[48px] p-24 text-center border-2 border-dashed border-slate-100 shadow-sm">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                                <Users size={48} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Belum Ada Mahasiswa Siap Sidang</h3>
                            <p className="w-full text-slate-400 mx-auto mt-4 font-medium leading-relaxed">
                                Mahasiswa akan muncul di sini jika bimbingan Bab 5 mereka sudah disetujui oleh Pembimbing.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {isScheduling && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 md:p-16 transition-all animate-in fade-in duration-300">
                    <div className="w-full max-w-[800px] bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                        <div className="w-full md:w-1/3 bg-[#0F172A] p-12 text-white relative flex flex-col justify-between overflow-hidden">
                             <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-brand-primary/20 rounded-full blur-[60px]" />
                             <div className="relative z-10 space-y-6">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                                    <MapPinned size={32} className="text-brand-primary" />
                                </div>
                                <h3 className="text-3xl font-black tracking-tight leading-tight">Detail<br />Penjadwalan</h3>
                                <div className="space-y-4 pt-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <User size={18} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mahasiswa</p>
                                            <p className="text-sm font-bold">{isScheduling.mahasiswa.nama}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                            <Users size={18} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pembimbing</p>
                                            <p className="text-sm font-bold">{isScheduling.dosen?.nama || "Belum ditentukan"}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        <div className="flex-1 p-12 flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-slate-900">Atur Jadwal</h3>
                                <button onClick={() => setIsScheduling(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <XCircle size={24} className="text-slate-300 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="space-y-8 flex-1">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal Sidang</label>
                                    <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100 group focus-within:border-brand-primary/30 transition-all">
                                        <MonthYearFilter 
                                            date={selectedDate}
                                            setDate={setSelectedDate}
                                            showLabel={false}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3 font-geist">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Clock size={12} className="text-brand-primary" /> Waktu
                                        </label>
                                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400">Jam</span>
                                            <input 
                                                type="time"
                                                value={schedData.waktuSidang || "09:00"}
                                                onChange={(e) => setSchedData({...schedData, waktuSidang: e.target.value})}
                                                className="bg-transparent border-none outline-none font-black text-slate-900 text-lg tracking-wider"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <MapPin size={12} className="text-brand-primary" /> Lokasi
                                        </label>
                                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100">
                                            <input 
                                                value={schedData.lokasi || ""}
                                                onChange={(e) => setSchedData({...schedData, lokasi: e.target.value})}
                                                placeholder="Cth: Ruang 301"
                                                className="w-full bg-transparent border-none outline-none font-bold text-slate-900 text-sm placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <Button variant="ghost" onClick={() => setIsScheduling(null)} className="flex-1 h-16 rounded-[24px] font-black text-slate-400 hover:text-brand-primary transition-all uppercase tracking-widest text-xs">
                                    Batal
                                </Button>
                                <Button onClick={handleSchedule} className="flex-[2] h-16 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl shadow-brand-primary/20 transition-all gap-3">
                                    Simpan Jadwal <CheckCircle2 size={24} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isApplying && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 md:p-16 transition-all animate-in fade-in duration-300">
                    <div className="w-full flex justify-center items-center">
                        <div className="w-full xl:w-[95%] 2xl:w-[90%]">
                            <SidangPengajuanForm 
                                mahasiswaNama={isApplying.mahasiswa.nama}
                                mahasiswaNim={isApplying.mahasiswa.nim}
                                onSubmit={handleApply}
                                onCancel={() => setIsApplying(null)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={cn(
                    "fixed top-8 right-8 z-[300] px-6 py-4 rounded-[24px] flex items-center gap-4 shadow-2xl transition-all duration-500 animate-in slide-in-from-right-10",
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="font-black text-sm tracking-tight">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
