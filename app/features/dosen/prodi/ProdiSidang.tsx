"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { 
    Calendar, Clock, MapPin, CheckCircle, AlertCircle, 
    Search, User, Filter, Check, MoreVertical,
    CheckCircle2, XCircle, Info, ChevronRight,
    Users, LayoutDashboard, Clock3, MapPinned, Edit3, FileText, Trash2
} from "lucide-react";
import { UPLOADS_URL } from "~/api/client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { MonthYearFilter } from "~/components/ui/calendar";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";

interface SidangItem {
    id: number;
    mahasiswaId: number;
    mahasiswa: {
        nama: string;
        nim: string;
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
    laporanUrl?: string;
}

export function ProdiSidang() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSidangId, setSelectedSidangId] = useState<number | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState("");
    
    // Scheduling Form State
    const [isScheduling, setIsScheduling] = useState<SidangItem | null>(null);
    const [schedData, setSchedData] = useState({
        tanggalSidang: "",
        waktuSidang: "09:00",
        lokasi: "Ruang Sidang Lt. 3",
        catatan: ""
    });
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    const userJabatan = user?.jabatan?.toLowerCase() || "";
    const userRole = user?.role?.toLowerCase() || "";
    const isProdi = userJabatan.includes("prodi") || 
                    userJabatan.includes("koordinator") || 
                    userRole === "kaprodi";
    
    // Specifically for Kaprodi / Head of Dept approval steps
    const isKaprodi = userRole === "kaprodi" || 
                      userJabatan.includes("prodi") ||
                      userJabatan.includes("kaprodi");

    const confirmDelete = (id: number, name: string) => {
        setSelectedSidangId(id);
        setSelectedStudentName(name);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSidang = async () => {
        if (selectedSidangId === null) return;
        try {
            await sidangApi.deleteSidang(selectedSidangId);
            fetchData();
        } catch (error) {
            console.error("Failed to delete sidang:", error);
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedSidangId(null);
            setSelectedStudentName("");
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await sidangApi.getAllSidang();
            setSidangs(data || []);
        } catch (error) {
            console.error("Fetch All Sidang Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleACC = async (sidangId: number) => {
        try {
            await sidangApi.prodiApprove(sidangId);
            fetchData();
        } catch (error) {
            console.error("ACC Error:", error);
        }
    };

    const handleVerifyKaprodi = async (sidangId: number) => {
        try {
            await sidangApi.verifyByKaprodi(sidangId);
            fetchData();
        } catch (error) {
            console.error("Verify Error:", error);
        }
    };

    const handleConfirmJadwalKaprodi = async (sidangId: number) => {
        try {
            await sidangApi.confirmScheduleByKaprodi(sidangId);
            fetchData();
        } catch (error) {
            console.error("Confirm Error:", error);
        }
    };

    const handleReject = async (sidangId: number) => {
        if (!confirm("Apakah Anda yakin ingin menolak pengajuan sidang ini?")) return;
        try {
            // Check if there's a specific reject endpoint, if not used delete or status update
            await sidangApi.deleteSidang(sidangId); 
            fetchData();
        } catch (error) {
            console.error("Reject Error:", error);
        }
    };

    const handleScheduleSubmit = async () => {
        if (!isScheduling || !selectedDate) return;
        try {
            await sidangApi.scheduleByProdi(isScheduling.id, {
                tanggalSidang: format(selectedDate, "yyyy-MM-dd"),
                waktuSidang: schedData.waktuSidang,
                lokasi: schedData.lokasi,
                pengujiId: null, // Future enhancement
                catatan: schedData.catatan
            });
            setIsScheduling(null);
            fetchData();
        } catch (error) {
            console.error("Schedule Error:", error);
        }
    };

    const filteredSidangs = sidangs.filter(s => 
        s.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mahasiswa.nim.includes(searchQuery) ||
        s.dosen.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusInfo = (sidang: SidangItem) => {
        if (sidang.status === "TERJADWAL") return { label: "Terjadwal", color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 };
        if (sidang.status === "MENUNGGU_VERIFIKASI_KAPRODI") return { label: "Menunggu Verifikasi Kaprodi", color: "text-purple-600 bg-purple-50 border-purple-100", icon: Clock3 };
        if (sidang.status === "MENUNGGU_PENJADWALAN_KOORDINATOR") return { label: "Menunggu Jadwal Koordinator", color: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock3 };
        if (sidang.status === "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI") return { label: "Konfirmasi Jadwal (Kaprodi)", color: "text-indigo-600 bg-indigo-50 border-indigo-100", icon: Info };
        if (sidang.pembimbingApproved) return { label: "Menunggu Verifikasi", color: "text-amber-600 bg-amber-50 border-amber-100", icon: AlertCircle };
        return { label: "Menunggu ACC Pembimbing", color: "text-slate-600 bg-slate-50 border-slate-100", icon: Clock3 };
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-geist">
            {/* Header section with Stats */}
            <div className="max-w-[1600px] mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                <LayoutDashboard size={22} />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pusat Persetujuan Sidang</h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-13">Kelola dan jadwalkan sidang kerja praktik seluruh mahasiswa.</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Butuh Proses</span>
                            <span className="text-xl font-black text-amber-700">{sidangs.filter(s => s.pembimbingApproved && s.status !== "TERJADWAL").length}</span>
                        </div>
                        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Total Sidang</span>
                            <span className="text-xl font-black text-emerald-700">{sidangs.length}</span>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-[450px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={20} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari mahasiswa, NIM, atau dosen pembimbing..."
                            className="w-full h-14 pl-14 pr-6 bg-white border border-slate-200 rounded-[22px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary transition-all shadow-sm shadow-slate-100/50 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* List Table/Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {isLoading ? (
                        <div className="p-20 flex justify-center"><CheckCircle2 className="animate-spin text-brand-primary" size={40} /></div>
                    ) : filteredSidangs.length === 0 ? (
                        <div className="bg-white p-20 rounded-[40px] border border-dashed border-slate-200 text-center flex flex-col items-center">
                            <Info size={48} className="text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">Tidak ada pengajuan sidang ditemukan</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredSidangs.map((sidang) => {
                                const status = getStatusInfo(sidang);
                                const StatusIcon = status.icon;
                                
                                return (
                                    <div key={sidang.id} className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden flex flex-col lg:flex-row">
                                        {/* Status Sidebar */}
                                        <div className={cn("w-full lg:w-3 border-b lg:border-b-0 lg:border-r border-black/5", 
                                            sidang.status === "TERJADWAL" ? "bg-emerald-500" :
                                            sidang.pembimbingApproved ? "bg-blue-500" : "bg-amber-500"
                                        )} />
                                        
                                        <div className="flex-1 p-8 space-y-6">
                                            {/* Header */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="space-y-2">
                                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", status.color, "border")}>
                                                        <StatusIcon size={12} />
                                                        {status.label}
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2">{sidang.judul}</h3>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-2xl">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Capaian</div>
                                                    <div className="text-sm font-black text-slate-700">Kerja Praktik</div>
                                                </div>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <User size={12} className="text-brand-primary" /> Mahasiswa
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">{sidang.mahasiswa.nama}</p>
                                                    <p className="text-[11px] font-mono text-slate-400">{sidang.mahasiswa.nim}</p>
                                                </div>
                                                <div className="space-y-1 text-right lg:text-left">
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 lg:justify-start justify-end">
                                                        <Users size={12} className="text-brand-primary" /> Pembimbing
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">{sidang.dosen.nama}</p>
                                                </div>
                                            </div>

                                            {/* Schedule Info if exists */}
                                            {(sidang.tanggalSidang || sidang.waktuSidang || sidang.lokasi) && (
                                                <div className="flex flex-wrap gap-4 pt-1">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-xl">
                                                        <Calendar size={14} className="text-brand-primary" />
                                                        {sidang.tanggalSidang ? format(new Date(sidang.tanggalSidang), "dd MMM yyyy", { locale: id }) : "-"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-xl">
                                                        <Clock size={14} className="text-brand-primary" />
                                                        {sidang.waktuSidang || "-"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-xl">
                                                        <MapPin size={14} className="text-brand-primary" />
                                                        {sidang.lokasi || "-"}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-4 pt-2">
                                                {sidang.laporanUrl && (
                                                    <a 
                                                        href={`${UPLOADS_URL}${sidang.laporanUrl}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="h-14 px-6 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border border-blue-100 whitespace-nowrap"
                                                        title="Lihat Laporan Sidang"
                                                    >
                                                        <FileText size={18} /> Lihat Laporan
                                                    </a>
                                                )}
                                                {/* Kaprodi Verification Step */}
                                                {sidang.status === "MENUNGGU_VERIFIKASI_KAPRODI" && isKaprodi && (
                                                    <div className="flex gap-3 w-full">
                                                        <Button 
                                                            onClick={() => handleVerifyKaprodi(sidang.id)}
                                                            className="flex-1 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black shadow-lg shadow-purple-200 transition-all gap-2"
                                                        >
                                                            <CheckCircle2 size={18} /> Verifikasi Pengajuan
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleReject(sidang.id)}
                                                            variant="outline"
                                                            className="h-14 px-6 rounded-2xl font-black text-rose-500 border-2 border-rose-50 hover:bg-rose-50 transition-all"
                                                            title="Tolak Pengajuan"
                                                        >
                                                            <XCircle size={20} /> Tolak
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* 
                                                   Tombol Atur Jadwal: 
                                                   Hanya muncul untuk Tim/Koordinator Prodi biasa (bukan Kaprodi)
                                                */}
                                                {sidang.status === "MENUNGGU_PENJADWALAN_KOORDINATOR" && !isKaprodi && (
                                                    <Button 
                                                        onClick={() => {
                                                            setIsScheduling(sidang);
                                                            setSchedData({
                                                                tanggalSidang: sidang.tanggalSidang || "",
                                                                waktuSidang: sidang.waktuSidang || "09:00",
                                                                lokasi: sidang.lokasi || "Ruang Sidang Lt. 3",
                                                                catatan: sidang.catatan || ""
                                                            });
                                                            if (sidang.tanggalSidang) setSelectedDate(new Date(sidang.tanggalSidang));
                                                        }}
                                                        className="flex-1 h-14 bg-brand-primary hover:bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 transition-all gap-2"
                                                    >
                                                        <Calendar size={18} /> Atur Jadwal
                                                    </Button>
                                                )}

                                                {/* Kaprodi Confirmation Step */}
                                                {sidang.status === "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI" && (
                                                    <>
                                                        {isKaprodi ? (
                                                            <Button 
                                                                onClick={() => handleConfirmJadwalKaprodi(sidang.id)}
                                                                className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 transition-all gap-2"
                                                            >
                                                                <Check size={18} /> Konfirmasi Jadwal
                                                            </Button>
                                                        ) : (
                                                            <div className="flex-1 h-14 bg-slate-50 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center font-bold gap-2 italic">
                                                                <Clock size={18} /> Menunggu Konfirmasi Kaprodi
                                                            </div>
                                                        )}
                                                        <Button 
                                                            onClick={() => {
                                                                setIsScheduling(sidang);
                                                                setSchedData({
                                                                    tanggalSidang: sidang.tanggalSidang || "",
                                                                    waktuSidang: sidang.waktuSidang || "09:00",
                                                                    lokasi: sidang.lokasi || "Ruang Sidang Lt. 3",
                                                                    catatan: sidang.catatan || ""
                                                                });
                                                                if (sidang.tanggalSidang) setSelectedDate(new Date(sidang.tanggalSidang));
                                                            }}
                                                            variant="outline"
                                                            className="h-14 px-6 rounded-2xl font-black text-slate-600 border-2 border-slate-100 hover:bg-slate-50 transition-all"
                                                            title="Ubah Jadwal"
                                                        >
                                                            <Edit3 size={20} />
                                                        </Button>
                                                    </>
                                                )}

                                                {/* Scheduled / Finished State */}
                                                {sidang.status === "TERJADWAL" && (
                                                    <div className="flex-1 flex gap-3">
                                                        <Button 
                                                            disabled 
                                                            className="flex-1 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black gap-2 opacity-80"
                                                        >
                                                            <CheckCircle2 size={18} /> Jadwal Terkonfirmasi
                                                        </Button>
                                                        
                                                        {(!isKaprodi || isProdi) && (
                                                            <Button 
                                                                onClick={() => {
                                                                    setIsScheduling(sidang);
                                                                    setSchedData({
                                                                        tanggalSidang: sidang.tanggalSidang || "",
                                                                        waktuSidang: sidang.waktuSidang || "09:00",
                                                                        lokasi: sidang.lokasi || "Ruang Sidang Lt. 3",
                                                                        catatan: sidang.catatan || ""
                                                                    });
                                                                    if (sidang.tanggalSidang) setSelectedDate(new Date(sidang.tanggalSidang));
                                                                }}
                                                                variant="outline"
                                                                className="h-14 px-6 rounded-2xl font-black text-slate-600 border-2 border-slate-100 hover:bg-slate-50 transition-all"
                                                                title="Ubah Jadwal"
                                                            >
                                                                <Edit3 size={20} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Fallback / General Actions (e.g. for rejected or waiting supervisor) */}
                                                {!["MENUNGGU_VERIFIKASI_KAPRODI", "MENUNGGU_PENJADWALAN_KOORDINATOR", "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI", "TERJADWAL"].includes(sidang.status) && (
                                                    <Button 
                                                        disabled 
                                                        className="flex-1 h-14 bg-slate-100 text-slate-400 rounded-2xl font-black gap-2 opacity-50"
                                                    >
                                                        <Clock size={18} /> {sidang.status.replace(/_/g, ' ')}
                                                    </Button>
                                                )}

                                                {/* Batalkan Sidang Button for Kaprodi/Koordinator */}
                                                <Button 
                                                    onClick={() => confirmDelete(sidang.id, sidang.mahasiswa.nama)}
                                                    variant="outline"
                                                    className="h-14 px-6 rounded-2xl font-black text-rose-500 border-2 border-rose-50 hover:bg-rose-50 transition-all shrink-0"
                                                    title="Batalkan Sidang"
                                                >
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <DeleteConfirmationModal 
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedSidangId(null);
                    setSelectedStudentName("");
                }}
                onConfirm={handleDeleteSidang}
                title="Batalkan Sidang"
                description="Apakah Anda yakin ingin membatalkan/menghapus pengajuan sidang mahasiswa ini? Data akan dihapus secara permanen dari database."
                itemName={selectedStudentName}
            />

            {/* 
               Modal Scheduling (Atur Jadwal Sidang): 
               Modal UI yang mewah ini ditampilkan ketika tombol 'Atur Jadwal' atau 'Ubah' ditekan. 
            */}
            {isScheduling && (
                <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 md:p-16 transition-all animate-in fade-in duration-300">
                    <div className="w-full max-w-[800px] bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row animate-in zoom-in-95 duration-500">
                        {/* Left Sidebar decorative */}
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
                                            <p className="text-sm font-bold">{isScheduling.dosen.nama}</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* Right Form content */}
                        <div className="flex-1 p-12 flex flex-col">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-2xl font-black text-slate-900">Atur Jadwal</h3>
                                <button onClick={() => setIsScheduling(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <XCircle size={24} className="text-slate-300 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="space-y-8 flex-1">
                                {/* Date Section */}
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

                                {/* Time & Location */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3 font-geist">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Clock size={12} className="text-brand-primary" /> Waktu
                                        </label>
                                        <div className="bg-slate-50/80 p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400">Jam</span>
                                            <input 
                                                type="time"
                                                value={schedData.waktuSidang}
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
                                                value={schedData.lokasi}
                                                onChange={(e) => setSchedData({...schedData, lokasi: e.target.value})}
                                                placeholder="Cth: Ruang 301 / GMeet"
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
                                <Button onClick={handleScheduleSubmit} className="flex-[2] h-16 bg-brand-primary hover:bg-slate-900 text-white rounded-[24px] font-black text-lg shadow-xl shadow-brand-primary/20 transition-all gap-3">
                                    Konfirmasi & ACC <CheckCircle2 size={24} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
