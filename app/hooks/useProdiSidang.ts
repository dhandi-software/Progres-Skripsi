import { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { sidangApi } from "~/api/sidangApi";
import { format } from "date-fns";
import { CheckCircle2, Clock3, Info, AlertCircle } from "lucide-react";

export interface SidangItem {
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

export function useProdiSidang() {
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
                pengujiId: null,
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

    return {
        user,
        sidangs,
        isLoading,
        searchQuery,
        setSearchQuery,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        selectedSidangId,
        setSelectedSidangId,
        selectedStudentName,
        setSelectedStudentName,
        isScheduling,
        setIsScheduling,
        schedData,
        setSchedData,
        selectedDate,
        setSelectedDate,
        isProdi,
        isKaprodi,
        confirmDelete,
        handleDeleteSidang,
        fetchData,
        handleACC,
        handleVerifyKaprodi,
        handleConfirmJadwalKaprodi,
        handleReject,
        handleScheduleSubmit,
        filteredSidangs,
        getStatusInfo
    };
}
