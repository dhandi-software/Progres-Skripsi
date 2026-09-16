import { useState, useEffect, useCallback } from "react";
import { sanksiApi, type SanksiAdministrasi, type SupervisedStudent } from "~/api/sanksiApi";
import { useAuth } from "~/context/AuthContext";
import { type FormState, calculateWeeksLate } from "~/features/dosen/sanksi/types/sanksi";

export function useSanksi() {
    const { user } = useAuth();
    const [sanksiList, setSanksiList] = useState<SanksiAdministrasi[]>([]);
    const [summary, setSummary] = useState({ total: 0, menunggu: 0, telat: 0, selesai: 0 });
    const [studentList, setStudentList] = useState<SupervisedStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal & Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [form, setForm] = useState<FormState>({
        mahasiswaId: "",
        nama: "",
        nim: "",
        hariSidang: "",
        tanggalSidang: "",
        hariTenggat: "",
        tanggalSurat: ""
    });

    // Student dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Preview & Toast states
    const [previewItem, setPreviewItem] = useState<SanksiAdministrasi | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const showToast = useCallback((type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [sanksiRes, studentData] = await Promise.all([
                sanksiApi.getAllSanksi(searchQuery, statusFilter),
                sanksiApi.getSupervisedStudents()
            ]);
            setSanksiList(sanksiRes.data || []);
            setSummary(sanksiRes.summary || { total: 0, menunggu: 0, telat: 0, selesai: 0 });
            setStudentList(studentData || []);
        } catch {
            showToast("error", "Gagal memuat data.");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, statusFilter, showToast]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter, fetchData]);

    const updateTenggat = (dateStr: string, durasi: 1 | 2) => {
        if (!dateStr) return;
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return;

        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const hariSidang = days[dateObj.getDay()];
        const tanggalSidang = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        
        const tenggatObj = new Date(dateStr);
        tenggatObj.setDate(tenggatObj.getDate() + (durasi * 7));
        const hariTenggat = `${days[tenggatObj.getDay()]}, ${tenggatObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
        
        setForm(prev => ({
            ...prev,
            rawTanggalSidang: dateStr,
            durasiTenggat: durasi,
            hariSidang,
            tanggalSidang,
            hariTenggat
        }));
    };

    const handleOpenCreate = () => {
        const today = new Date();
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const dayName = days[today.getDay()];
        const dateString = today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

        const rawDate = today.toISOString().split("T")[0];
        
        setForm({
            mahasiswaId: "",
            nama: "",
            nim: "",
            hariSidang: dayName,
            tanggalSidang: dateString,
            hariTenggat: "Senin",
            tanggalSurat: dateString,
            rawTanggalSidang: rawDate,
            durasiTenggat: 1
        });
        updateTenggat(rawDate, 1);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (item: SanksiAdministrasi) => {
        setForm({
            id: item.id,
            mahasiswaId: String(item.mahasiswaId),
            nama: item.nama,
            nim: item.nim,
            hariSidang: item.hariSidang,
            tanggalSidang: item.tanggalSidang,
            hariTenggat: item.hariTenggat,
            tanggalSurat: item.tanggalSurat,
            rawTanggalSidang: "",
            durasiTenggat: 1
        });
        setIsFormOpen(true);
    };

    const handleSelectStudent = (student: SupervisedStudent) => {
        if (student.statusSidang !== 'TERJADWAL' || !student.tanggalSidang) {
            setForm(prev => ({
                ...prev,
                mahasiswaId: String(student.id),
                nama: student.nama,
                nim: student.nim,
                rawTanggalSidang: "",
                tanggalSidang: "Tanggal sidang belum dijadwalkan"
            }));
            setIsDropdownOpen(false);
            return;
        }

        let rawDate = new Date().toISOString().split("T")[0];
        const sidDate = new Date(student.tanggalSidang);
        if (!isNaN(sidDate.getTime())) {
            rawDate = sidDate.toISOString().split("T")[0];
        }
        
        setForm(prev => ({
            ...prev,
            mahasiswaId: String(student.id),
            nama: student.nama,
            nim: student.nim,
            rawTanggalSidang: rawDate
        }));
        
        updateTenggat(rawDate, form.durasiTenggat || 1);
        setIsDropdownOpen(false);
    };

    const handleSave = async (): Promise<boolean> => {
        if (!form.mahasiswaId || !form.nama || !form.nim) {
            showToast("error", "Harap pilih mahasiswa dan lengkapi data.");
            return false;
        }

        if (!form.rawTanggalSidang || form.tanggalSidang === "Tanggal sidang belum dijadwalkan") {
            showToast("error", "Sidang belum dijadwalkan. Sanksi administrasi tidak dapat diterbitkan.");
            return false;
        }

        try {
            setIsSaving(true);
            const payload = {
                mahasiswaId: form.mahasiswaId,
                nama: form.nama,
                nim: form.nim,
                hariSidang: form.hariSidang,
                tanggalSidang: form.tanggalSidang,
                hariTenggat: form.hariTenggat,
                tanggalSurat: form.tanggalSurat
            };

            if (form.id) {
                await sanksiApi.updateSanksi(form.id, payload);
                showToast("success", "Sanksi administrasi berhasil diperbarui!");
            } else {
                await sanksiApi.createSanksi(payload);
                showToast("success", "Sanksi administrasi baru berhasil diterbitkan!");
            }
            setIsFormOpen(false);
            fetchData();
            return true;
        } catch (error: any) {
            const msg = error.response?.data?.error || "Gagal menyimpan sanksi administrasi.";
            showToast("error", msg);
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await sanksiApi.deleteSanksi(id);
            showToast("success", "Sanksi administrasi berhasil dihapus.");
            setDeleteConfirmId(null);
            fetchData();
        } catch {
            showToast("error", "Gagal menghapus sanksi administrasi.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleKonfirmasiHardcover = async (id: number) => {
        try {
            await sanksiApi.konfirmasiSanksi(id);
            showToast("success", "Hardcover telah dikonfirmasi, sanksi selesai.");
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data?.error || "Gagal memperbarui status hardcover.";
            showToast("error", msg);
        }
    };

    const selectedStudent = studentList.find(s => String(s.id) === form.mahasiswaId);

    return {
        user,
        sanksiList,
        summary,
        studentList,
        isLoading,
        isSaving,
        isFormOpen,
        setIsFormOpen,
        form,
        setForm,
        isDropdownOpen,
        setIsDropdownOpen,
        previewItem,
        setPreviewItem,
        deleteConfirmId,
        setDeleteConfirmId,
        toast,
        showToast,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        fetchData,
        updateTenggat,
        handleOpenCreate,
        handleOpenEdit,
        handleSelectStudent,
        handleSave,
        handleDelete,
        handlePrint,
        handleKonfirmasiHardcover,
        selectedStudent,
        calculateWeeksLate
    };
}
