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
import { SidangPengajuanForm } from "./SidangPengajuanForm";

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

export function SidangMobile() {
    const { user } = useAuth();
    const [sidangs, setSidangs] = useState<SidangItem[]>([]);
    const [bimbinganStudents, setBimbinganStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"sidang" | "pengajuan">("sidang");
    const [isScheduling, setIsScheduling] = useState<SidangItem | null>(null);
    const [isApplying, setIsApplying] = useState<any | null>(null);

    const eligibleStudents = bimbinganStudents
        .filter(m => !sidangs.some(s => s.mahasiswaId === m.mahasiswa.id))
        .filter(m => m.mahasiswa.bimbingan && m.mahasiswa.bimbingan.some((b: any) => 
            b.status === 'APPROVED' && 
            (b.topik.toLowerCase().includes('bab 5') || b.topik.toLowerCase().includes('bab v'))
        ));

    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    
    // Scheduling Form
    const [schedData, setSchedData] = useState({
        tanggalSidang: "",
        waktuSidang: "09:00 - 11:00",
        lokasi: "Ruang Sidang Lt. 3",
        catatan: ""
    });

    const userJabatan = user?.jabatan?.toLowerCase() || "";
    const userRole = user?.role?.toLowerCase() || "";
    const isProdi = userJabatan.includes("prodi") || 
                    userJabatan.includes("koordinator") || 
                    userRole === "kaprodi";
                    
    const isKaprodi = userRole === "kaprodi" || 
                      userJabatan.includes("prodi") ||
                      userJabatan.includes("kaprodi");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [sidangData, bimbinganData] = await Promise.all([
                sidangApi.getSidangByDosen(),
                bimbinganApi.getDosenBimbinganStudents()
            ]);
            setSidangs(sidangData || []);
            setBimbinganStudents(bimbinganData || []);
        } catch (error) {
            console.error("Fetch Sidang Error:", error);
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
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
            showToast("success", "Berhasil diajukan!");
        } catch (error) {
            showToast("error", "Gagal mengajukan.");
        }
    };

    const handleApprovePembimbing = async (id: number) => {
        try {
            await sidangApi.pembimbingApprove(id);
            fetchData();
            showToast("success", "Sidang di-ACC!");
        } catch (error) {
            showToast("error", "Gagal menyetujui.");
        }
    };

    const handleSchedule = async () => {
        if (!isScheduling) return;
        try {
            await sidangApi.scheduleByProdi(isScheduling.id, {
                ...schedData,
                pengujiId: null 
            });
            setIsScheduling(null);
            fetchData();
            showToast("success", "Jadwal disimpan!");
        } catch (error) {
            showToast("error", "Gagal menjadwalkan.");
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
            {/* Header Area Mobile */}
            <div className="bg-white px-5 pt-8 pb-4 border-b border-slate-100 sticky top-0 z-10 w-full">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Sidang</h1>
                <p className="text-[11px] text-slate-500 mt-0.5 font-bold">Kelola dan jadwalkan persidangan Kerja Praktik.</p>

                {/* Tabs Mobile */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full mt-6">
                    <button 
                        onClick={() => setActiveTab("sidang")}
                        className={cn(
                            "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                            activeTab === "sidang" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500"
                        )}
                    >
                        Daftar Sidang
                    </button>
                    <button 
                        onClick={() => setActiveTab("pengajuan")}
                        className={cn(
                            "flex-1 py-2 text-xs font-black rounded-lg transition-all",
                            activeTab === "pengajuan" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500"
                        )}
                    >
                        Ajukan Sidang
                    </button>
                </div>

                {/* Search Bar Mobile */}
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
                {activeTab === "sidang" ? (
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
                                            {item.status === 'TERJADWAL' ? 'Terjadwal' : item.status === 'MENUNGGU_PENJADWALAN_PRODI' ? 'Menunggu Prodi' : 'Menunggu ACC'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic mt-3 line-clamp-1">"{item.judul}"</p>
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

                                <div className="p-3 border-t border-slate-50 flex items-center justify-end gap-2">
                                    {/* Action for Supervisor */}
                                    {item.status === "MENUNGGU_PERSETUJUAN_PEMBIMBING" && item.dosen.userId === user?.id && (
                                        <Button 
                                            onClick={() => handleApprovePembimbing(item.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 font-black text-[10px] gap-2 flex-1"
                                        >
                                            <Check size={14} /> Beri ACC Sidang
                                        </Button>
                                    )}

                                    {/* Action for Prodi - Hanya muncul untuk Koordinator, bukan Kaprodi */}
                                    {isProdi && !isKaprodi && item.status === "MENUNGGU_PENJADWALAN_PRODI" && (
                                        <Button 
                                            onClick={() => {
                                                setIsScheduling(item);
                                                setSchedData({
                                                    tanggalSidang: "",
                                                    waktuSidang: item.waktuSidang || "09:00 - 11:00",
                                                    lokasi: item.lokasi || "Ruang Sidang Lt. 3",
                                                    catatan: item.catatan || ""
                                                });
                                            }}
                                            className="bg-brand-primary text-white rounded-xl h-9 px-4 font-black text-[10px] gap-2 flex-1 shadow-lg shadow-brand-primary/20"
                                        >
                                            <Calendar size={14} /> Jadwalkan
                                        </Button>
                                    )}

                                    {/* Action for Kaprodi Confirmation */}
                                    {item.status === "MENUNGGU_KONFIRMASI_JADWAL_KAPRODI" && isKaprodi && (
                                        <Button 
                                            onClick={async () => {
                                                 try {
                                                     await sidangApi.confirmScheduleByKaprodi(item.id);
                                                     fetchData();
                                                     showToast("success", "Jadwal dikonfirmasi!");
                                                 } catch (e) {
                                                     showToast("error", "Gagal mengkonfirmasi.");
                                                 }
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-4 font-bold text-[10px] gap-2 flex-1"
                                         >
                                             <Check size={14} /> Konfirmasi
                                         </Button>
                                    )}

                                    {/* Tombol Ubah Jadwal hanya untuk Dosen Pembimbing */}
                                    {item.dosen.userId === user?.id && item.status === "TERJADWAL" && (
                                        <Button 
                                            onClick={() => {
                                                setIsScheduling(item);
                                                setSchedData({
                                                    tanggalSidang: item.tanggalSidang ? format(new Date(item.tanggalSidang), "yyyy-MM-dd", { locale: id }) : "",
                                                    waktuSidang: item.waktuSidang || "",
                                                    lokasi: item.lokasi || "",
                                                    catatan: item.catatan || ""
                                                });
                                            }}
                                            variant="outline"
                                            className="rounded-xl h-9 px-4 font-bold text-[10px] gap-2 flex-1 border-slate-200"
                                        >
                                            <Edit3 size={12} /> Ubah Jadwal
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="grid grid-cols-1 gap-4 w-full">
                        {eligibleStudents.length > 0 ? (
                            eligibleStudents.map(student => (
                                <div key={student.id} className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-4 w-full group active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xl">{student.mahasiswa.nama.substring(0,1)}</div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 tracking-tight text-sm line-clamp-1">{student.mahasiswa.nama}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{student.mahasiswa.nim}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsApplying(student)}
                                        className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 px-6 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                    <Users size={32} />
                                </div>
                                <h3 className="text-sm font-black text-slate-900">Belum Ada Mahasiswa Siap</h3>
                                <p className="text-[11px] text-slate-400 mt-2 font-medium">Mahasiswa akan muncul jika bimbingan <span className="text-brand-primary font-bold">Bab 5</span> sudah Anda ACC.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 
               Modal Scheduling Mobile (Atur Jadwal Sidang) 
               Ditampilkan sebagai Bottom Sheet 
            */}
            {isScheduling && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center">
                    <div className="bg-white rounded-t-[40px] shadow-2xl w-full  overflow-hidden animate-in slide-in-from-bottom duration-300">
                         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Atur Jadwal</h3>
                                <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider">{isScheduling.mahasiswa.nama}</p>
                            </div>
                            <button onClick={() => setIsScheduling(null)} className="p-2 -mr-2 text-slate-300 hover:text-slate-500"><X size={24} /></button>
                         </div>
                         <div className="p-8 flex flex-col gap-5 max-h-[60vh] overflow-y-auto w-full">
                             <div>
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pilih Tanggal</label>
                                 <Input 
                                    type="date" 
                                    value={schedData.tanggalSidang}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedData({...schedData, tanggalSidang: e.target.value})}
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Waktu Sidang</label>
                                 <Input 
                                    value={schedData.waktuSidang}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedData({...schedData, waktuSidang: e.target.value})}
                                    placeholder="09:00 - 11:00"
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Lokasi / Ruangan</label>
                                 <Input 
                                    value={schedData.lokasi}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedData({...schedData, lokasi: e.target.value})}
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                             <div>
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Catatan Tambahan</label>
                                 <Input 
                                    value={schedData.catatan}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchedData({...schedData, catatan: e.target.value})}
                                    className="bg-slate-50 border-none h-12 rounded-2xl font-bold"
                                 />
                             </div>
                         </div>
                         <div className="p-8 bg-slate-50 flex gap-3 w-full">
                             <Button variant="ghost" onClick={() => setIsScheduling(null)} className="flex-1 rounded-2xl font-black h-12 text-slate-400">Batal</Button>
                             <Button onClick={handleSchedule} className="flex-[2] bg-brand-primary text-white rounded-2xl font-black h-12 shadow-lg shadow-brand-primary/20">Konfirmasi</Button>
                         </div>
                    </div>
                </div>
            )}

            {/* Modal Confirm Apply Mobile */}
            {isApplying && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-5 transition-all animate-in zoom-in-95 duration-300">
                    <div className="w-full h-full sm:h-auto overflow-y-auto pt-10 pb-10">
                        <SidangPengajuanForm 
                            mahasiswaNama={isApplying.mahasiswa.nama}
                            mahasiswaNim={isApplying.mahasiswa.nim}
                            onSubmit={handleApply}
                            onCancel={() => setIsApplying(null)}
                        />
                    </div>
                </div>
            )}

            {/* Toast Mobile Notification */}
            {toast && (
                <div className={cn(
                    "fixed top-6 left-6 right-6 z-[200] p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl",
                    toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-[13px] font-black tracking-tight">{toast.msg}</span>
                </div>
            )}
        </div>
    );
}
