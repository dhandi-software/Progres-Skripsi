import React, { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { bimbinganApi } from "~/api/bimbinganApi";
import { 
    Calendar, Clock, MapPin, CheckCircle, AlertCircle, 
    MoreVertical, Edit3, Trash2, Search, User, Filter,
    Check, X, Save, ArrowRight, Users, FileText, CheckCircle2, XCircle
} from "lucide-react";
import { Toast } from "~/components/ui/toast";
import { UPLOADS_URL } from "~/api/client";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { SidangPengajuanForm } from "./SidangPengajuanForm";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "~/components/ui/pagination";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";

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
    laporanUrl?: string;
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
    const [statusFilter, setStatusFilter] = useState("SEMUA");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSidangId, setSelectedSidangId] = useState<number | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState("");
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);
    
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
                      userJabatan.includes("kepala program studi") ||
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
            showToast("success", "Sidang berhasil dibatalkan!");
        } catch (error) {
            console.error("Failed to delete sidang:", error);
            showToast("error", "Gagal membatalkan sidang.");
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedSidangId(null);
            setSelectedStudentName("");
        }
    };

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
            const formDataData = new FormData();
            formDataData.append("mahasiswaId", isApplying.mahasiswa.id.toString());
            formDataData.append("judul", isApplying.judul || "Skripsi");
            formDataData.append("tanggalSidang", formData.tanggalSidang);
            formDataData.append("waktuSidang", formData.waktuSidang);
            formDataData.append("lokasi", formData.lokasi);

            await sidangApi.applyForSidang(formDataData);
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
                return { label: "MENUNGGU ACC", color: "text-amber-600 bg-amber-50" };
            case "MENUNGGU_PENJADWALAN_PRODI":
            case "MENUNGGU_PENJADWALAN_KOORDINATOR":
                return { label: "MENUNGGU PRODI", color: "text-white bg-blue-600 shadow-sm shadow-blue-200" };
            case "TERJADWAL":
                return { label: "TERJADWAL", color: "text-emerald-600 bg-emerald-50" };
            case "SELESAI":
                return { label: "SELESAI", color: "text-white bg-slate-600 shadow-sm shadow-slate-200" };
            default:
                return { label: status, color: "text-white bg-slate-600 shadow-sm shadow-slate-200" };
        }
    };

    const renderSidangCard = (item: SidangItem) => (
        <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden w-full">
            <div className="p-5 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black shrink-0">
                            {item.mahasiswa.nama.substring(0, 1)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">{item.mahasiswa.nama}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{item.mahasiswa.nim}</span>
                        </div>
                    </div>
                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 tracking-wider", getStatusInfo(item.status).color)}>
                        {getStatusInfo(item.status).label}
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
                        {item.lokasi || "Ditentukan Prodi/Koordinator"}
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-slate-50 flex flex-wrap items-center justify-end gap-2">
                {/* Lihat Laporan (Koordinator / Kaprodi) */}
                {item.laporanUrl && isProdi && (
                    <a 
                        href={`${UPLOADS_URL}${item.laporanUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl h-9 px-4 font-black text-[10px] gap-1.5 flex items-center justify-center border border-blue-100 transition-colors shadow-sm"
                        title="Lihat Laporan Sidang"
                    >
                        <FileText size={12} /> Laporan
                    </a>
                )}

                {/* Action for Supervisor */}
                {item.status === "MENUNGGU_PERSETUJUAN_PEMBIMBING" && item.dosen.userId === user?.id && (
                    <Button 
                        onClick={() => handleApprovePembimbing(item.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-4 font-black text-[10px] gap-2 flex-1"
                    >
                        <Check size={14} /> Beri ACC Sidang
                    </Button>
                )}

                {/* Atur Jadwal (Koordinator) */}
                {item.status === "MENUNGGU_PENJADWALAN_KOORDINATOR" && isProdi && !isKaprodi && (
                    <Button 
                        onClick={() => {
                            setIsScheduling(item);
                            setSchedData({
                                tanggalSidang: item.tanggalSidang || "",
                                waktuSidang: item.waktuSidang || "09:00",
                                lokasi: item.lokasi || "Ruang Sidang Lt. 3",
                                catatan: item.catatan || ""
                            });
                        }}
                        className="bg-brand-primary hover:bg-orange-600 text-white rounded-xl h-9 px-4 font-black text-[10px] gap-1.5 shadow-md shadow-brand-primary/30 transition-all"
                    >
                        <Calendar size={12} /> Jadwalkan
                    </Button>
                )}

                {/* Action for Kaprodi Verification */}
                {item.status === "MENUNGGU_VERIFIKASI_KAPRODI" && isKaprodi && (
                    <div className="flex gap-2 w-full">
                        <Button 
                            onClick={async () => {
                                 try {
                                     await sidangApi.verifyByKaprodi(item.id);
                                     fetchData();
                                     showToast("success", "Verifikasi berhasil!");
                                 } catch (e) {
                                     showToast("error", "Gagal verifikasi.");
                                 }
                            }}
                            className="bg-purple-600 text-white rounded-xl h-9 px-4 font-black text-[10px] gap-1 flex-1 shadow-lg shadow-purple-200"
                        >
                            <CheckCircle2 size={14} /> Verifikasi
                        </Button>
                        <Button 
                            onClick={async () => {
                                 try {
                                     await sidangApi.deleteSidang(item.id);
                                     fetchData();
                                     showToast("success", "Pengajuan ditolak!");
                                 } catch (e) {
                                     showToast("error", "Gagal menolak.");
                                 }
                            }}
                            variant="outline"
                            className="rounded-xl h-9 px-4 font-black text-[10px] gap-1 border-rose-250 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Tolak Pengajuan"
                        >
                            <XCircle size={14} /> Tolak
                        </Button>
                    </div>
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

                {/* Tombol Ubah Jadwal (Koordinator/Kaprodi) */}
                {isProdi && item.status === "TERJADWAL" && (
                    <Button 
                        onClick={() => {
                            setIsScheduling(item);
                            setSchedData({
                                tanggalSidang: item.tanggalSidang || "",
                                waktuSidang: item.waktuSidang || "09:00 - 11:00",
                                lokasi: item.lokasi || "Ruang Sidang Lt. 3",
                                catatan: item.catatan || ""
                            });
                        }}
                        variant="outline"
                        className="rounded-xl h-9 px-4 font-black text-[10px] gap-2 border-slate-200 flex-1"
                    >
                        <Edit3 size={12} /> Ubah Jadwal
                    </Button>
                )}
                {isProdi && item.status !== "MENUNGGU_VERIFIKASI_KAPRODI" && (
                    <Button 
                        onClick={() => confirmDelete(item.id, item.mahasiswa.nama)}
                        variant="outline"
                        className="rounded-xl h-9 px-4 font-black text-[10px] gap-2 border-rose-250 text-rose-500 hover:bg-rose-50 hover:text-rose-600 flex-1"
                        title="Batalkan Sidang"
                    >
                        <Trash2 size={12} /> Batalkan Sidang
                    </Button>
                )}
            </div>
        </div>
    );

    const filteredSidangs = sidangs.filter(item => {
        const matchesSearch = 
            item.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.mahasiswa.nim.includes(searchQuery) ||
            item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.dosen?.nama || "").toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesStatus = 
            statusFilter === "SEMUA" ? true :
            statusFilter === "BELUM_DIJADWALKAN" ? !item.tanggalSidang :
            statusFilter === "TERJADWAL" ? (item.tanggalSidang && item.status !== "SELESAI") :
            statusFilter === "SELESAI" ? item.status === "SELESAI" : true;
             
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSidangs.length / ITEMS_PER_PAGE);
    const paginatedSidangs = filteredSidangs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

                {/* Status Filter Mobile */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 mt-3 scrollbar-none">
                    {[
                        { key: "SEMUA", label: "Semua" },
                        { key: "BELUM_DIJADWALKAN", label: "Belum Jadwal" },
                        { key: "TERJADWAL", label: "Terjadwal" },
                        { key: "SELESAI", label: "Selesai" }
                    ].map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => setStatusFilter(opt.key)}
                            className={cn(
                                "px-3.5 py-1.5 text-[10px] font-black rounded-xl border transition-all whitespace-nowrap",
                                statusFilter === opt.key
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
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
                        ) : statusFilter === "TERJADWAL" ? (
                            // Grouped timeline view for TERJADWAL on mobile
                            <div className="space-y-6 w-full">
                                {Object.entries(
                                    filteredSidangs.reduce((groups: { [key: string]: SidangItem[] }, item) => {
                                        const dateKey = item.tanggalSidang || "Belum Dijadwalkan";
                                        if (!groups[dateKey]) groups[dateKey] = [];
                                        groups[dateKey].push(item);
                                        return groups;
                                    }, {})
                                )
                                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                                .map(([dateKey, items]) => {
                                    // Sort by waktuSidang (time)
                                    const sortedItems = [...items].sort((a, b) => {
                                        const timeA = a.waktuSidang || "";
                                        const timeB = b.waktuSidang || "";
                                        return timeA.localeCompare(timeB);
                                    });

                                    return (
                                        <div key={dateKey} className="space-y-3 w-full">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100/50 rounded-xl text-indigo-700 shadow-sm text-[11px] font-black">
                                                <Calendar size={12} className="text-indigo-650" />
                                                <span>
                                                    {format(new Date(dateKey), "EEEE, dd MMM yyyy", { locale: id })}
                                                </span>
                                                <div className="h-3 w-[1px] bg-indigo-200" />
                                                <span className="text-[10px] font-bold bg-indigo-200/50 px-1.5 py-0.5 rounded-full">
                                                    {items.length} Sesi
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-indigo-100/60 ml-2 w-full">
                                                {sortedItems.map(item => renderSidangCard(item))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Normal flat list
                            paginatedSidangs.map(item => renderSidangCard(item))
                        )}
                        {statusFilter !== "TERJADWAL" && totalPages > 1 && (
                            <div className="pt-2 flex justify-center pb-6">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === i + 1}
                                                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
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
                                    min={new Date().toISOString().split("T")[0]}
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
                <div className="fixed bottom-20 left-4 right-4 z-[200]">
                    <Toast title={toast.msg} variant={toast.type === "success" ? "success" : "destructive"} onClose={() => setToast(null)} />
                </div>
            )}

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
        </div>
    );
}
