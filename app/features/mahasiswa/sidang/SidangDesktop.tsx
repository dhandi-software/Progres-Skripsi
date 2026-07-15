import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { 
    Calendar, Clock, MapPin, CheckCircle2, AlertCircle, 
    User, Users, Bookmark, FileText, Info, GraduationCap,
    Clock3, ShieldCheck, MapPinned, MessageCircle
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

export function SidangDesktop({ title }: { title: string }) {
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
                        console.error("Mark As Seen Error:", error);
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
                    description: "Jadwal sidang Anda telah diverifikasi oleh Kaprodi.",
                    icon: CheckCircle2
                };
            case "MENUNGGU_PERSETUJUAN_PEMBIMBING":
                return { 
                    label: "Menunggu ACC Pembimbing", 
                    color: "text-amber-600 bg-amber-50 border-amber-100",
                    description: "Pengajuan Anda menunggu persetujuan dari Dosen Pembimbing.",
                    icon: Clock3
                };
            case "MENUNGGU_VERIFIKASI_KAPRODI":
                return { 
                    label: "Verifikasi Kaprodi", 
                    color: "text-purple-600 bg-purple-50 border-purple-100",
                    description: "Menunggu verifikasi akhir dari Kepala Program Studi.",
                    icon: ShieldCheck
                };
            case "MENUNGGU_PENJADWALAN_PRODI":
                return { 
                    label: "Penjadwalan Prodi", 
                    color: "text-blue-600 bg-blue-50 border-blue-100",
                    description: "Data Anda sedang diproses oleh Tim Prodi untuk penentuan jadwal.",
                    icon: Calendar
                };
            case "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI":
                return { 
                    label: "Konfirmasi Jadwal", 
                    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
                    description: "Jadwal telah disusun, menunggu konfirmasi resmi dari Kaprodi.",
                    icon: Info
                };
            case "SELESAI":
                return { 
                    label: "Selesai", 
                    color: "text-slate-600 bg-slate-100 border-slate-200",
                    description: "Kegiatan persidangan telah selesai dilaksanakan.",
                    icon: GraduationCap
                };
            default:
                return { 
                    label: status, 
                    color: "text-slate-600 bg-slate-100 border-slate-200",
                    description: "Status pengajuan saat ini.",
                    icon: AlertCircle
                };
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50/50 p-12 lg:p-20">
                <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse mb-8" />
                <div className="grid grid-cols-1 gap-8">
                    {[1].map(i => (
                        <div key={i} className="h-96 bg-white rounded-[48px] shadow-sm animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (sidangs.length === 0) {
        return (
            <div className="flex flex-col h-screen overflow-hidden bg-slate-50/50 p-6 lg:p-8 animate-in fade-in duration-700">
                <div className="mb-6 flex items-center justify-between shrink-0">
                    <div>
                         <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
                         <p className="text-slate-500 text-sm mt-1 font-medium">Informasi pelaksanaan sidang kerja praktik Anda.</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
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
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50/50 p-6 lg:p-8 animate-in fade-in duration-700">
            {/* Area Header: Menampilkan judul halaman dan ringkasan status dalam bentuk badge */}
            <div className="mb-6 flex items-center justify-between shrink-0">
                <div>
                     <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h1>
                     <p className="text-slate-500 text-sm mt-1 font-medium">Informasi pelaksanaan sidang kerja praktik Anda.</p>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs shadow-sm shadow-slate-200/50 transition-all duration-500",
                    statusInfo.color
                )}>
                    <StatusIcon size={16} />
                    {statusInfo.label}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Kolom Utama: Menampilkan Detail Laporan dan Jadwal Pelaksanaan */}
                <div className="xl:col-span-2 flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden group">
                        {/* Bagian Judul Laporan: Menggunakan tema gelap (Slate-900) dengan aksen oranye */}
                        <div className="bg-slate-900 p-8 text-white relative shrink-0">
                            <div className="absolute top-[-20%] right-[-5%] w-48 h-48 bg-[#FF7A00]/20 rounded-full blur-[60px] group-hover:bg-[#FF7A00]/30 transition-all duration-700" />
                            <div className="relative z-10">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-[#FF7A00] mb-4 border border-white/5">
                                    <Bookmark size={12} /> Judul Laporan KP
                                </span>
                                <h2 className="text-2xl lg:text-3xl font-black leading-snug tracking-tight mb-5 line-clamp-2">
                                    "{latestSidang.judul || 'Sistem Informasi Akademik'}"
                                </h2>
                                <div className="flex flex-wrap gap-8 pt-5 border-t border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <User size={20} className="text-[#FF7A00]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Dosen Pembimbing</p>
                                            <p className="text-base font-black">{latestSidang.dosen.nama}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <FileText size={20} className="text-[#FF7A00]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">NPM Mahasiswa</p>
                                            <p className="text-base font-black">{latestSidang.mahasiswa.nim}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Pelaksanaan: Menampilkan Hari, Waktu, dan Lokasi Sidang */}
                        <div className="p-8 flex-1 flex flex-col justify-center overflow-y-auto">
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Info size={20} className="text-[#FF7A00]" /> 
                                Detail Pelaksanaan
                            </h3>
                            
                            {latestSidang.tanggalSidang ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-[#FF7A00]/30 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] shrink-0">
                                                <Calendar size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hari & Tanggal</p>
                                        </div>
                                        <p className="text-sm lg:text-base font-black text-slate-900 pl-11 line-clamp-2">
                                            {format(new Date(latestSidang.tanggalSidang), "EEEE, dd MMM yyyy", { locale: id })}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 hover:border-[#FF7A00]/30 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-[#FF7A00]/10 flex items-center justify-center text-[#FF7A00] shrink-0">
                                                <Clock size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waktu Sidang</p>
                                        </div>
                                        <p className="text-sm lg:text-base font-black text-slate-900 pl-11">
                                            {latestSidang.waktuSidang || "--:--"}
                                        </p>
                                    </div>

                                    <div className="bg-[#FF7A00]/5 p-5 rounded-2xl border border-[#FF7A00]/20 hover:border-[#FF7A00]/40 transition-all duration-300">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-md shadow-[#FF7A00]/30 shrink-0">
                                                <MapPinned size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-[#FF7A00]/80 uppercase tracking-widest">Lokasi Persidangan</p>
                                        </div>
                                        <p className="text-sm lg:text-base font-black text-slate-900 pl-11 line-clamp-2">
                                            {latestSidang.lokasi || "Ditentukan Prodi"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-amber-900">Jadwal Belum Dirilis</h4>
                                        <p className="text-amber-700/80 text-sm mt-1 leading-relaxed">
                                            Tim Prodi sedang menyusun jadwal persidangan. 
                                            Periksa status secara berkala untuk pembaruan.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {latestSidang.catatan && (
                                <div className="mt-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Catatan dari Prodi</p>
                                    <p className="text-slate-700 italic text-sm font-medium">"{latestSidang.catatan}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Kolom Samping: Menampilkan Status Pengajuan dan Tombol Bantuan */}
                <div className="flex flex-col h-full min-h-0">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
                        {/* Linimasa Status: Visualisasi progres dari ACC Pembimbing hingga Verifikasi Final */}
                        <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Status Pengajuan</h3>
                        <div className="px-2 pb-6 space-y-6 relative flex-1 overflow-y-auto custom-scrollbar">
                            {/* Garis Vertikal Linimasa */}
                            <div className="absolute left-[23px] top-2 bottom-6 w-0.5 bg-slate-100" />
                            
                            <div className="flex gap-4 relative z-10">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    latestSidang.pembimbingApproved ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300"
                                )}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="pt-1.5">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">ACC Pembimbing</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {latestSidang.pembimbingApproved ? "Disetujui Dosen Pembimbing" : "Menunggu validasi"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative z-10">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    isPenjadwalanDone ? "bg-[#FF7A00] text-white" : "bg-white border border-slate-200 text-slate-300"
                                )}>
                                    <Calendar size={16} />
                                </div>
                                <div className="pt-1.5">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Penjadwalan</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {isPenjadwalanDone ? "Jadwal disusun oleh Prodi" : "Menunggu penentuan jadwal"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative z-10">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    isKaprodiDone ? "bg-emerald-500 text-white" : "bg-white border border-slate-200 text-slate-300"
                                )}>
                                    <ShieldCheck size={16} />
                                </div>
                                <div className="pt-1.5">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verifikasi Kaprodi</h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        {isKaprodiDone ? "Telah diverifikasi" : "Menunggu konfirmasi"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Area Footer Sidebar: Menampilkan Ringkasan Status dan Tombol Bantuan Terintegrasi */}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4">
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <Info size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        Status saat ini: <span className="text-[#FF7A00] font-bold">{statusInfo.label}</span>. 
                                        {" "}{statusInfo.description}
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Hubungi Pembimbing: Memfasilitasi koordinasi langsung dengan dosen melalui chat */}
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 mb-2">
                                <div className="flex items-start gap-3">
                                    <Info size={16} className="text-[#FF7A00] shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                        Silakan hubungi Dosen Pembimbing untuk koordinasi lebih lanjut terkait jadwal, lokasi, atau kendala teknis persidangan lainnya.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/mahasiswa/chat?userId=${latestSidang.dosen.userId}`)}
                                className="w-full bg-[#FF7A00] hover:bg-[#E66E00] text-white py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-[#FF7A00]/20"
                            >
                                <MessageCircle size={16} />
                                Butuh Bantuan?
                            </button>
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
