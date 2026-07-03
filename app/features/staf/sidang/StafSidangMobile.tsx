import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { bimbinganApi } from "~/api/bimbinganApi";
import { 
    Calendar, Clock, MapPin, CheckCircle, AlertCircle, 
    MoreVertical, Edit3, Trash2, Search, User, Filter,
    Check, X, Save, ArrowRight, Users
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
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

export function StafSidangMobile() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const sidangData = await sidangApi.getAllSidang();
            setSidangs(sidangData || []);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "MENUNGGU_PERSETUJUAN_PEMBIMBING":
                return { label: "Menunggu ACC Pembimbing", color: "text-amber-600 bg-amber-50" };
            case "MENUNGGU_PENJADWALAN_PRODI":
                return { label: "Menunggu Jadwal Prodi", color: "text-blue-600 bg-blue-50" };
            case "TERJADWAL":
                return { label: "Terjadwal", color: "text-emerald-600 bg-emerald-50" };
            case "SELESAI":
                return { label: "Selesai", color: "text-slate-600 bg-slate-50" };
            default:
                return { label: status, color: "text-slate-600 bg-slate-50" };
        }
    };

    const filteredSidangs = sidangs.filter(s => 
        s.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.mahasiswa.nim.includes(searchQuery)
    );

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <div className="bg-white px-5 pt-8 pb-4 border-b border-slate-100 sticky top-0 z-10 w-full">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Penjadwalan Sidang (Staff)</h1>
                <p className="text-[11px] text-slate-500 mt-0.5 font-bold">Atur dan kelola jadwal sidang mahasiswa.</p>

                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder="Cari mahasiswa..." 
                        className="pl-9 bg-slate-50 border-none rounded-xl h-10 text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 p-5 flex flex-col gap-4 w-full">
                    <>
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse w-full" />)
                        ) : filteredSidangs.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Calendar size={32} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-400">Tidak ada data sidang</h3>
                            </div>
                        ) : filteredSidangs.map(item => (
                            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
                                <div className="p-5 border-b border-slate-50">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black shrink-0">
                                                {item.mahasiswa.nama.substring(0, 1)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-black text-slate-900 truncate tracking-tight">{item.mahasiswa.nama}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.mahasiswa.nim}</span>
                                            </div>
                                        </div>
                                        <span className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-full shrink-0", getStatusInfo(item.status).color)}>
                                            {getStatusInfo(item.status).label}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-2">Nomor Pembimbing: {item.dosen?.nama || "Belum ditentukan"}</p>
                                    <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">"{item.judul || 'Skripsi'}"</p>
                                </div>

                                <div className="px-5 py-4 bg-slate-50/30 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jadwal</span>
                                            <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px]">
                                                <Calendar size={12} className="text-brand-primary" />
                                                {item.tanggalSidang ? format(new Date(item.tanggalSidang), "dd MMM yyyy", { locale: id }) : "-"}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 text-right">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Waktu</span>
                                            <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px] justify-end">
                                                <Clock size={12} className="text-slate-400" />
                                                {item.waktuSidang || "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lokasi</span>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px]">
                                            <MapPin size={12} className="text-slate-400" />
                                            {item.lokasi || "Belum ditentukan"}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </>
            </div>

            {toast && (
                <div className={cn(
                    "fixed top-8 right-5 left-5 md:left-auto md:w-80 z-[200] p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-10 duration-300",
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-[13px] font-black tracking-tight">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
