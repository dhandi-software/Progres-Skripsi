    import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { bimbinganApi } from "~/api/bimbinganApi";
import { 
    Calendar, Clock, MapPin, CheckCircle, AlertCircle, 
    MoreVertical, Edit3, Trash2, Search, User, Filter,
    Check
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Toast } from "~/components/ui/toast";

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
    };
    dosenId: number;
    pengujiId: number | null;
    judul: string;
    tanggalSidang: string | null;
    waktuSidang: string | null;
    lokasi: string | null;
    status: string;
    pembimbingApproved: boolean;
    catatan: string | null;
}

export default function SidangManagement() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [bimbinganStudents, setBimbinganStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"sidang" | "pengajuan">("sidang");
    const [isScheduling, setIsScheduling] = useState<SidangItem | null>(null);
    const [isApplying, setIsApplying] = useState<any | null>(null);
    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);
    
    // Scheduling Form
    const [schedData, setSchedData] = useState({
        tanggalSidang: "",
        waktuSidang: "09:00 - 11:00",
        lokasi: "Ruang Sidang Lt. 3",
        catatan: ""
    });

    const isProdi = user?.jabatan === "Pejabat Prodi" || user?.jabatan === "Koordinator KP";

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sidangData, bimbinganData] = await Promise.all([
                sidangApi.getSidangByDosen(),
                bimbinganApi.getDosenBimbinganStudents()
            ]);
            setSidangs(sidangData);
            setBimbinganStudents(bimbinganData);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleApply = async () => {
        if (!isApplying) return;
        try {
            const formData = new FormData();
            formData.append("mahasiswaId", isApplying.mahasiswa.id.toString());
            formData.append("judul", isApplying.judul || "Skripsi");
            
            await sidangApi.applyForSidang(formData);
            setIsApplying(null);
            fetchData();
            setToast({ title: "Berhasil mengajukan sidang!", variant: "success" });
        } catch (error) {
            setToast({ title: "Gagal mengajukan sidang.", variant: "destructive" });
        }
    };

    const handleApprovePembimbing = async (id: number) => {
        try {
            await sidangApi.pembimbingApprove(id);
            fetchData();
            setToast({ title: "Berhasil menyetujui sidang!", variant: "success" });
        } catch (error) {
            setToast({ title: "Gagal menyetujui.", variant: "destructive" });
        }
    };

    const handleSchedule = async () => {
        if (!isScheduling) return;
        try {
            await sidangApi.scheduleByProdi(isScheduling.id, {
                ...schedData,
                pengujiId: null // Future: select from list
            });
            setIsScheduling(null);
            fetchData();
            setToast({ title: "Berhasil menyimpan jadwal!", variant: "success" });
        } catch (error) {
            setToast({ title: "Gagal menjadwalkan.", variant: "destructive" });
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "MENUNGGU_PERSETUJUAN_PEMBIMBING":
                return { label: "Menunggu ACC Pembimbing", color: "text-amber-600 bg-amber-50" };
            case "MENUNGGU_PENJADWALAN_KOORDINATOR":
                return { label: "Menunggu Jadwal Prodi", color: "text-blue-600 bg-blue-50" };
            case "TERJADWAL":
                return { label: "Terjadwal", color: "text-emerald-600 bg-emerald-50" };
            case "SELESAI":
                return { label: "Selesai", color: "text-slate-600 bg-slate-50" };
            default:
                return { label: status, color: "text-slate-600 bg-slate-50" };
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-6 font-['Noto_Sans']">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                     <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Persidangan</h1>
                     <p className="text-slate-500 text-sm mt-1">Kelola pengajuan, persetujuan, dan penjadwalan sidang skripsi.</p>
                </div>
            </div>

            {/* Tabs */}
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
                    Ajukan Sidang Baru
                </button>
            </div>

            {activeTab === "sidang" ? (
                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="h-32 bg-white rounded-2xl animate-pulse" />
                    ) : sidangs.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
                             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                 <Calendar size={32} />
                             </div>
                             <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Sidang</h3>
                             <p className="text-slate-500 max-w-xs mx-auto mt-2">Daftar sidang yang diajukan atau dijadwalkan akan muncul di sini.</p>
                        </div>
                    ) : sidangs.map(item => (
                        <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                                    <User size={24} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-black text-slate-900 tracking-tight truncate">{item.mahasiswa.nama}</span>
                                        <span className={cn("text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0", getStatusInfo(item.status).color)}>
                                            {getStatusInfo(item.status).label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">NPM: {item.mahasiswa.nim}</span>
                                    <span className="text-xs text-slate-500 italic mt-1 truncate">"{item.judul}"</span>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pr-6 md:border-r border-slate-100">
                                {item.tanggalSidang ? (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jadwal Sidang</span>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                            <Calendar size={14} className="text-brand-primary" />
                                            {format(new Date(item.tanggalSidang), "EEEE, dd MMM yyyy", { locale: localeId })}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium ml-5">
                                            <Clock size={12} />
                                            {item.waktuSidang}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Jadwal</span>
                                         <span className="text-xs font-bold text-amber-500">Belum Dijadwalkan</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Lokasi</span>
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                                        <MapPin size={14} className="text-slate-400" />
                                        {item.lokasi || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* Action for Supervisor */}
                                {item.status === "MENUNGGU_PERSETUJUAN_PEMBIMBING" && item.dosenId === user?.id && (
                                    <Button 
                                        onClick={() => handleApprovePembimbing(item.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2"
                                    >
                                        <Check size={14} />
                                        Beri ACC Sidang
                                    </Button>
                                )}

                                {/* Action for Prodi */}
                                {isProdi && item.status === "MENUNGGU_PENJADWALAN_KOORDINATOR" && (
                                    <Button 
                                        onClick={() => setIsScheduling(item)}
                                        className="bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2 shadow-lg shadow-brand-primary/20"
                                    >
                                        <Calendar size={14} />
                                        Jadwalkan Sidang
                                    </Button>
                                )}

                                {isProdi && item.status === "TERJADWAL" && (
                                    <Button 
                                        onClick={() => setIsScheduling(item)}
                                        variant="outline"
                                        className="rounded-xl h-10 px-4 font-bold text-xs gap-2 border-slate-200"
                                    >
                                        <Edit3 size={14} />
                                        Ubah Jadwal
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Ajukan Sidang Baru Tab */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bimbinganStudents.filter(m => !sidangs.some(s => s.mahasiswaId === m.mahasiswa.id)).map(student => (
                         <div key={student.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                             <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4 font-black text-xl">{student.mahasiswa.nama.substring(0,1)}</div>
                             <h4 className="font-black text-slate-900 tracking-tight">{student.mahasiswa.nama}</h4>
                             <p className="text-[10px] font-bold text-slate-400 mb-4">{student.mahasiswa.nim}</p>
                             <div className="w-full pt-4 border-t border-slate-50 mt-auto">
                                 <Button 
                                    onClick={() => setIsApplying(student)}
                                    className="w-full bg-slate-900 hover:bg-black text-white rounded-2xl h-11 font-black text-xs gap-2"
                                 >
                                    Ajukan Untuk Sidang
                                 </Button>
                             </div>
                         </div>
                    ))}
                    {bimbinganStudents.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-400 font-bold">Tidak ada mahasiswa bimbingan aktif.</div>
                    )}
                </div>
            )}

            {/* Modal Scheduling */}
            {isScheduling && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden">
                         <div className="p-8 border-b border-slate-50">
                             <h3 className="text-xl font-black text-slate-900 tracking-tight">Atur Jadwal Sidang</h3>
                             <p className="text-slate-400 text-sm font-medium mt-1">Mahasiswa: {isScheduling.mahasiswa.nama}</p>
                         </div>
                         <div className="p-8 flex flex-col gap-6">
                             <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pilih Tanggal</label>
                                 <Input 
                                    type="date" 
                                    value={schedData.tanggalSidang}
                                    onChange={e => setSchedData({...schedData, tanggalSidang: e.target.value})}
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Waktu Sidang</label>
                                 <Input 
                                    value={schedData.waktuSidang}
                                    onChange={e => setSchedData({...schedData, waktuSidang: e.target.value})}
                                    placeholder="09:00 - 11:00"
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lokasi / Ruangan</label>
                                 <Input 
                                    value={schedData.lokasi}
                                    onChange={e => setSchedData({...schedData, lokasi: e.target.value})}
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                         </div>
                         <div className="p-8 bg-slate-50 flex gap-3">
                             <Button variant="ghost" onClick={() => setIsScheduling(null)} className="flex-1 rounded-2xl font-bold">Batal</Button>
                             <Button onClick={handleSchedule} className="flex-[2] bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20">Konfirmasi Jadwal</Button>
                         </div>
                    </div>
                </div>
            )}

            {/* Modal Confirm Apply */}
            {isApplying && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-10 shadow-2xl text-center max-w-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Ajukan Sidang?</h4>
                        <p className="text-slate-500 text-sm mt-3 mb-8">Anda akan mengajukan <strong>{isApplying.mahasiswa.nama}</strong> untuk tahap persidangan. Pastikan bimbingan telah selesai.</p>
                        <div className="flex gap-3">
                             <Button variant="ghost" onClick={() => setIsApplying(null)} className="flex-1 rounded-2xl font-bold">Batal</Button>
                             <Button onClick={handleApply} className="flex-[2] bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-600/20">Ya, Ajukan</Button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-10 right-10 z-[300]">
                    <Toast 
                        title={toast.title} 
                        variant={toast.variant} 
                        onClose={() => setToast(null)} 
                    />
                </div>
            )}
        </div>
    );
}
