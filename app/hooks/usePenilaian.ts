import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/hooks/useAuth";
import { penilaianApi } from "~/api/penilaianApi";
import type { PenilaianItem, FormState, ConfirmModalState } from "~/features/dosen/penilaian/types/penilaian";

export function usePenilaian() {
    const { user } = useAuth();
    const [data, setData] = useState<PenilaianItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [suratTugasFile, setSuratTugasFile] = useState<File | null>(null);
    const [suratTugasPreviewUrl, setSuratTugasPreviewUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<PenilaianItem | null>(null);

    const [dosenList, setDosenList] = useState<{ id: string; nama: string }[]>([]);
    const [isKoordinator, setIsKoordinator] = useState(false);
    const [assigningId, setAssigningId] = useState<string | null>(null);

    // Modal Confirmation State
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

    // Custom Dropdown & Low Vision & Drill-down States
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const [isLowVision, setIsLowVision] = useState(false);
    const [selectedPembimbingId, setSelectedPembimbingId] = useState<string | "all" | null>("all");
    const [activeTab, setActiveTab] = useState<"koordinator" | "pembimbing" | "penguji">("pembimbing");

    // Manage live preview URL for Surat Tugas File
    useEffect(() => {
        if (!suratTugasFile) {
            setSuratTugasPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(suratTugasFile);
        setSuratTugasPreviewUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [suratTugasFile]);

    const showToast = useCallback((type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await penilaianApi.getPenilaianByDosen();
            setData(result.students || []);
            setDosenList(result.dosenList || []);
            setIsKoordinator(result.isKoordinator || false);

            const currentDosen = result.dosenList?.find((d: any) => d.nama === user?.name);
            if (user?.role === 'admin') {
                setSelectedPembimbingId("all" as any);
            } else if (currentDosen && selectedPembimbingId === null) {
                setSelectedPembimbingId(currentDosen.id);
            } else if (result.dosenList?.length > 0 && selectedPembimbingId === null) {
                setSelectedPembimbingId(result.dosenList[0].id);
            }
        } catch {
            showToast("error", "Gagal memuat data penilaian.");
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedPembimbingId, showToast]);

    useEffect(() => {
        if (user) fetchData();
    }, [user, fetchData]);

    useEffect(() => {
        if (isKoordinator) {
            setActiveTab("koordinator");
        } else {
            setActiveTab("pembimbing");
        }
    }, [isKoordinator]);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (openDropdownId !== null) {
                const target = e.target as HTMLElement;
                if (!target.closest(".custom-dropdown-container")) {
                    setOpenDropdownId(null);
                }
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [openDropdownId]);

    const handleAssignPenguji = async (mahasiswaId: string, pengujiId: string, file?: File | null) => {
        setIsSaving(true);
        setAssigningId(mahasiswaId);
        try {
            await penilaianApi.assignPenguji({ mahasiswaId, pengujiId, surat_tugas: file });
            showToast("success", "Dosen Penguji berhasil ditugaskan.");
            await fetchData();
            setConfirmModal(null);
            setSuratTugasFile(null);
        } catch (err: any) {
            showToast("error", err.message || "Gagal menugaskan dosen penguji.");
        } finally {
            setIsSaving(false);
            setAssigningId(null);
        }
    };

    const handleAssignPengujiBulk = async (pembimbingId: string, pengujiId: string, file?: File | null) => {
        setIsSaving(true);
        const pembimbing = dosenList.find(d => d.id === pembimbingId);
        const studentsToUpdate = data.filter(item => item.pembimbingId === pembimbingId || item.pembimbingNama === pembimbing?.nama);

        if (studentsToUpdate.length === 0) {
            showToast("error", "Dosen pembimbing ini tidak memiliki mahasiswa bimbingan.");
            setIsSaving(false);
            return;
        }

        setAssigningId(pembimbingId);
        try {
            await Promise.all(
                studentsToUpdate.map(student => penilaianApi.assignPenguji({ mahasiswaId: student.mahasiswaId, pengujiId, surat_tugas: file }))
            );
            await fetchData();
            showToast("success", `Berhasil menugaskan Dosen Penguji untuk semua bimbingan ${pembimbing?.nama || ''}!`);
            setConfirmModal(null);
            setSuratTugasFile(null);
        } catch {
            showToast("error", "Gagal menugaskan Dosen Penguji.");
        } finally {
            setAssigningId(null);
            setIsSaving(false);
        }
    };

    const handleCancelPenguji = async (mahasiswaId: string) => {
        setIsSaving(true);
        setAssigningId(mahasiswaId);
        try {
            await penilaianApi.cancelPenguji({ mahasiswaId });
            showToast("success", "Penugasan penguji berhasil dibatalkan.");
            await fetchData();
            setConfirmModal(null);
        } catch (err: any) {
            showToast("error", err.message || "Gagal membatalkan penguji.");
        } finally {
            setIsSaving(false);
            setAssigningId(null);
        }
    };

    const handleCancelPengujiBulk = async (pembimbingId: string) => {
        setIsSaving(true);
        const pembimbing = dosenList.find(d => d.id === pembimbingId);
        const studentsToUpdate = data.filter(item => item.pembimbingId === pembimbingId || item.pembimbingNama === pembimbing?.nama);

        setAssigningId(pembimbingId);
        try {
            await Promise.all(
                studentsToUpdate.map(student => penilaianApi.cancelPenguji({ mahasiswaId: student.mahasiswaId }))
            );
            showToast("success", `Berhasil membatalkan Dosen Penguji untuk semua bimbingan ${pembimbing?.nama || ''}!`);
            await fetchData();
            setConfirmModal(null);
        } catch (err: any) {
            showToast("error", err.message || "Gagal membatalkan dosen penguji.");
        } finally {
            setIsSaving(false);
            setAssigningId(null);
        }
    };

    const openForm = (item: PenilaianItem) => {
        setForm({
            mahasiswaId: item.mahasiswaId,
            penilaianId: item.penilaianId,
            nama: item.nama,
            nim: item.nim,
            p1_k1: item.p1_k1 !== null ? String(item.p1_k1) : "",
            p1_k2: item.p1_k2 !== null ? String(item.p1_k2) : "",
            p1_k3: item.p1_k3 !== null ? String(item.p1_k3) : "",
            p1_nama: item.p1_nama || item.pembimbingNama || user?.name || "",
            p2_k1: item.p2_k1 !== null ? String(item.p2_k1) : "",
            p2_k2: item.p2_k2 !== null ? String(item.p2_k2) : "",
            p2_k3: item.p2_k3 !== null ? String(item.p2_k3) : "",
            p2_nama: item.p2_nama || item.pengujiNama || "",
            suratTugasUrl: item.suratTugasUrl || null,
            keterangan: item.keterangan || ""
        });
    };

    const handleSave = async () => {
        if (!form) return;

        const payload = {
            mahasiswaId: form.mahasiswaId,
            p1_k1: parseFloat(form.p1_k1) || 0,
            p1_k2: parseFloat(form.p1_k2) || 0,
            p1_k3: parseFloat(form.p1_k3) || 0,
            p1_nama: form.p1_nama,
            p2_k1: parseFloat(form.p2_k1) || 0,
            p2_k2: parseFloat(form.p2_k2) || 0,
            p2_k3: parseFloat(form.p2_k3) || 0,
            p2_nama: form.p2_nama,
            keterangan: form.keterangan
        };

        try {
            setIsSaving(true);
            await penilaianApi.createPenilaian(payload);
            setForm(null);
            await fetchData();
            showToast("success", `Nilai ${form.nama} berhasil disimpan!`);
        } catch {
            showToast("error", "Gagal menyimpan nilai.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm?.penilaianId) return;
        try {
            await penilaianApi.deletePenilaian(deleteConfirm.penilaianId);
            setDeleteConfirm(null);
            await fetchData();
            showToast("success", "Penilaian berhasil dihapus.");
        } catch {
            showToast("error", "Gagal menghapus penilaian.");
        }
    };

    const currentDosen = dosenList.find(d => d.nama === user?.name);
    const supervisedStudents = data.filter(item => item.pembimbingId === currentDosen?.id || item.pembimbingNama === user?.name);
    const examinedStudents = data.filter(item => item.pengujiId === currentDosen?.id || item.pengujiNama === user?.name);

    const calcP1Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p1_k1) || 0)) + (0.30 * (parseFloat(form.p1_k2) || 0)) + (0.35 * (parseFloat(form.p1_k3) || 0));
    };

    const calcP2Total = () => {
        if (!form) return 0;
        return (0.35 * (parseFloat(form.p2_k1) || 0)) + (0.30 * (parseFloat(form.p2_k2) || 0)) + (0.35 * (parseFloat(form.p2_k3) || 0));
    };

    const student = form ? data.find(d => d.mahasiswaId === form.mahasiswaId) : null;
    const isUserPembimbing = student && user && (
        (user.dosenNidn && student.pembimbingId === user.dosenNidn) ||
        (user.name && (student.pembimbingNama === user.name || form?.p1_nama === user.name))
    );
    const isUserPenguji = student && user && (
        (user.dosenNidn && student.pengujiId === user.dosenNidn) ||
        (user.name && (student.pengujiNama === user.name || form?.p2_nama === user.name))
    );

    const canEditP1 = form && user && user.role !== 'admin' && user.role !== 'staf' && user.role !== 'staf_univ'
        ? !!isUserPembimbing
        : false;

    const canEditP2 = form && user && user.role !== 'admin' && user.role !== 'staf' && user.role !== 'staf_univ'
        ? !!isUserPenguji
        : false;

    return {
        user,
        data,
        isLoading,
        form,
        setForm,
        isSaving,
        suratTugasFile,
        setSuratTugasFile,
        suratTugasPreviewUrl,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
        deleteConfirm,
        setDeleteConfirm,
        dosenList,
        isKoordinator,
        assigningId,
        confirmModal,
        setConfirmModal,
        openDropdownId,
        setOpenDropdownId,
        dropdownSearch,
        setDropdownSearch,
        isLowVision,
        setIsLowVision,
        selectedPembimbingId,
        setSelectedPembimbingId,
        activeTab,
        setActiveTab,
        fetchData,
        handleAssignPenguji,
        handleAssignPengujiBulk,
        handleCancelPenguji,
        handleCancelPengujiBulk,
        openForm,
        handleSave,
        handleDelete,
        supervisedStudents,
        examinedStudents,
        calcP1Total,
        calcP2Total,
        canEditP1,
        canEditP2
    };
}
