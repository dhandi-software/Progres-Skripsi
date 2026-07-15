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
    catatan: string | null;
}

export function StafSidangDesktop() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const sidangData = await sidangApi.getAllSidang();
            setSidangs(sidangData);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
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

                        </div>
                    ))}
                </div>

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
