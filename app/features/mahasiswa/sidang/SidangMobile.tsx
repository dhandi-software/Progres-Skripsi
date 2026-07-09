import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { 
    Calendar, Clock, MapPin, CheckCircle2, AlertCircle, 
    User, Bookmark, FileText, Info, GraduationCap,
    Clock3, ShieldCheck, MapPinned, Users, ChevronRight
} from "lucide-react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
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
        userId: number;
    };
    pengujiId: number | null;
    judul: string;
    tanggalSidang: string | null;
    waktuSidang: string | null;
    lokasi: string | null;
    status: string;
    pembimbingApproved: boolean;
    mahasiswaSeen: boolean;
    catatan: string | null;
    createdAt: string;
}

import { useNavigate } from "react-router";
import { ApplySidangForm } from "./ApplySidangForm";

export function SidangMobile({ title }: { title: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toastProps, setToastProps] = useState<{ title: string, variant: 'success' | 'destructive' } | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await sidangApi.getSidangMahasiswa();
            setSidangs(data);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        const markSeen = async () => {
            if (sidangs.length > 0) {
                const latest = sidangs[0];
                if (!latest.mahasiswaSeen) {
                    try {
                        await sidangApi.markAsSeen(latest.id);
                        // Update local state to remove badge immediately
                        const updatedSidangs = [...sidangs];
                        updatedSidangs[0] = { ...latest, mahasiswaSeen: true };
                        setSidangs(updatedSidangs);
                    } catch (error) {
                        console.error("Mark As Seen Error Mobile:", error);
                    }
                }
            }
        };
        markSeen();
    }, [sidangs]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "TERJADWAL":
                return { 
                    label: "Terjadwal", 
                    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
                    icon: CheckCircle2
                };
            case "MENUNGGU_PERSETUJUAN_PEMBIMBING":
                return { 
                    label: "ACC Pembimbing", 
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    icon: Clock3
                };
            case "MENUNGGU_VERIFIKASI_KAPRODI":
                return { 
                    label: "Verifikasi Kaprodi", 
                    color: "text-purple-600 bg-purple-50 border-purple-100",
                    icon: ShieldCheck
                };
            default:
                return { 
                    label: status.replace(/_/g, " "), 
                    color: "text-slate-600 bg-slate-100 border-slate-200",
                    icon: Info
                };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 p-6 gap-6">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-64 bg-white rounded-3xl animate-pulse" />
                <div className="h-48 bg-white rounded-3xl animate-pulse" />
            </div>
        );
    }

    if (sidangs.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 pb-12">
                <div className="bg-slate-900 pt-12 pb-16 px-6 relative overflow-hidden shrink-0">
                    <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#FF7A00]/20 rounded-full blur-[60px]" />
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black text-white tracking-tight mb-2">{title}</h1>
                        <p className="text-white/80 text-xs">Formulir Pendaftaran Sidang Kerja Praktik</p>
                    </div>
                </div>

                <div className="px-4 -mt-8 relative z-20 flex-1">
                    <ApplySidangForm onApplied={() => {
                        fetchData();
                        setToastProps({ title: "Berhasil mengajukan laporan sidang!", variant: "success" });
                    }} />
                </div>
            </div>
        );
    }

    const latestSidang = sidangs[0];
    const statusInfo = getStatusInfo(latestSidang.status);
    const StatusIcon = statusInfo.icon;
    
    const isPenjadwalanDone = ["MENUNGGU_VERIFIKASI_KAPRODI", "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI", "TERJADWAL", "SELESAI"].includes(latestSidang.status);
    const isKaprodiDone = ["TERJADWAL", "SELESAI"].includes(latestSidang.status);

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pb-12">
            {/* Banner Header: Menampilkan judul halaman dan status saat ini dengan latar belakang gelap */}
            <div className="bg-slate-900 pt-12 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#FF7A00]/20 rounded-full blur-[60px]" />
                <div className="relative z-10">
                    <h1 className="text-2xl font-black text-white tracking-tight mb-2">{title}</h1>
                    {/* Badge Status: Menggunakan warna semi-transparan agar kontras dengan latar belakang gelap */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-[11px] font-bold shadow-sm mt-2">
                        <StatusIcon size={14} className="text-[#FF7A00]" />
                        {statusInfo.label}
                    </div>
                </div>
            </div>

            {/* Area Konten Utama: Berisi detail laporan dan jadwal pelaksanaan */}
            <div className="px-4 -mt-14 relative z-20 space-y-4">
                {/* Kartu Informasi Laporan: Menampilkan Judul, NPM, dan Pembimbing */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col gap-5">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 px-3 py-1 rounded-full w-fit">
                            <Bookmark size={12} /> Judul Laporan
                        </span>
                        <h2 className="text-lg font-black text-slate-900 leading-snug">"{latestSidang.judul || 'Sistem Informasi Akademik'}"</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-100">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NPM Mahasiswa</p>
                            <p className="text-base font-black text-slate-800 break-words">{latestSidang.mahasiswa.nim}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pembimbing</p>
                            <p className="text-base font-black text-slate-800 break-words leading-tight">{latestSidang.dosen.nama}</p>
                        </div>
                    </div>

                    {/* Detail Waktu dan Lokasi: Hanya muncul jika jadwal sudah tersedia */}
                    {latestSidang.tanggalSidang ? (
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-[#FF7A00]/30 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Hari & Tanggal</p>
                                    <p className="text-sm font-black text-slate-900 truncate">
                                        {format(new Date(latestSidang.tanggalSidang), "EEEE, dd MMM yyyy", { locale: id })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 flex items-center gap-4 hover:border-[#FF7A00]/30 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] shrink-0">
                                    <Clock size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Waktu</p>
                                    <p className="text-sm font-black text-slate-900">{latestSidang.waktuSidang || "--:--"}</p>
                                </div>
                            </div>
                            <div className="bg-[#FF7A00]/5 p-4 rounded-xl border border-[#FF7A00]/20 flex items-center gap-4 hover:border-[#FF7A00]/40 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-md shadow-[#FF7A00]/30 shrink-0">
                                    <MapPinned size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-[#FF7A00]/80 uppercase tracking-widest mb-0.5">Lokasi</p>
                                    <p className="text-sm font-black text-slate-900 line-clamp-2">{latestSidang.lokasi || "Ditentukan Prodi"}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-4 bg-amber-50 rounded-2xl border border-amber-100 text-center px-4">
                            <AlertCircle size={24} className="text-amber-600 mb-2" />
                            <p className="text-xs font-black text-amber-900 italic">Jadwal resmi belum dirilis oleh Prodi</p>
                        </div>
                    )}
                </div>

                {/* Linimasa Tahapan: Visualisasi status verifikasi dari Pembimbing ke Kaprodi */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 mb-5 uppercase tracking-wider">Progres Verifikasi</h3>
                    <div className="space-y-4 relative pb-2">
                        <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-100" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                latestSidang.pembimbingApproved ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300"
                            )}>
                                <CheckCircle2 size={16} />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">ACC Pembimbing</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                    {latestSidang.pembimbingApproved ? "Disetujui Dosen" : "Menunggu validasi"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                isPenjadwalanDone ? "bg-[#FF7A00] text-white" : "bg-white border border-slate-200 text-slate-300"
                            )}>
                                <Calendar size={16} />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">Penjadwalan</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                    {isPenjadwalanDone ? "Jadwal Disusun Prodi" : "Menunggu penentuan"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                isKaprodiDone ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300"
                            )}>
                                <ShieldCheck size={16} />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider leading-tight">Verifikasi Kaprodi</h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                    {isKaprodiDone ? "Telah diverifikasi" : "Menunggu konfirmasi"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bagian Bantuan: Memberikan panduan lanjut jika mahasiswa memiliki kendala */}
                <div className="flex flex-col gap-3">
                    <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Info size={18} className="text-[#FF7A00] shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                <span className="font-bold text-[#FF7A00]">{statusInfo.label}</span>: 
                                {" "}{
                                    latestSidang.status === "TERJADWAL" ? "Jadwal sidang Anda telah dikonfirmasi dan final." :
                                    latestSidang.status === "MENUNGGU_VERIFIKASI_KAPRODI" || latestSidang.status === "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI" ? "Jadwal telah disusun, saat ini menunggu validasi akhir Kaprodi." :
                                    latestSidang.pembimbingApproved ? "Sedang menunggu pihak Prodi untuk merilis jadwal sidang Anda." :
                                    "Mohon segera hubungi pembimbing untuk ACC."
                                }
                            </p>
                        </div>
                    </div>

                    {/* Tombol Hubungi Pembimbing: Membuka fitur chat dengan dosen */}
                    <div 
                        onClick={() => navigate(`/mahasiswa/chat?userId=${latestSidang.dosen.userId}`)}
                        className="bg-[#FF7A00] rounded-2xl p-5 text-white flex items-center justify-between group overflow-hidden relative shadow-md shadow-[#FF7A00]/20 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                        <div className="absolute right-[-10%] bottom-[-20%] w-24 h-24 bg-white/20 rounded-full blur-2xl" />
                        <div className="relative z-10">
                            <h4 className="text-base font-black tracking-tight leading-none mb-1">Butuh Bantuan?</h4>
                            <p className="text-white/80 text-[11px] font-medium leading-tight">Hubungi Dosen Pembimbing untuk koordinasi lebih lanjut terkait persidangan.</p>
                        </div>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toastProps && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
        </div>
    );
}
