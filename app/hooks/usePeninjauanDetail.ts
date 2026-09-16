import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import type { PengajuanDetail, PengajuanActionStatus, UsePeninjauanDetailProps } from "~/features/dosen/pengajuan/types/peninjauanDetail";

export function usePeninjauanDetail({ id }: UsePeninjauanDetailProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const [detail, setDetail] = useState<PengajuanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState("");
    const [deadlineRevisi, setDeadlineRevisi] = useState<Date | undefined>(undefined);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ title: string; variant: "success" | "destructive" | "default" } | null>(null);

    const showToast = useCallback((title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToast({ title, variant });
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await pengajuanApi.getPengajuanById(parseInt(id));
                setDetail(data);
            } catch (error) {
                console.error("Failed to fetch detail", error);
                alert("Gagal memuat detail pengajuan.");
                navigate(`/dosen/peninjauan${location.search}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate, location.search]);

    const handleAction = async (status: PengajuanActionStatus) => {
        setSubmitting(true);
        try {
            const deadlineStr = deadlineRevisi ? deadlineRevisi.toISOString() : undefined;
            await pengajuanApi.updateStatus(parseInt(id), status, remarks, deadlineStr);
            const label = status === 'APPROVED' ? 'disetujui' : status === 'REJECTED' ? 'ditolak' : status === 'REVISION' ? 'diminta revisi' : 'dibatalkan keputusannya';
            showToast(`Pengajuan berhasil ${label}.`, "success");
            setIsRevisionModalOpen(false);
            setIsApproveModalOpen(false);
            setTimeout(() => navigate(`/dosen/peninjauan${location.search}`), 1800);
        } catch (error: any) {
            showToast("Gagal memproses aksi: " + (error.response?.data?.message || error.message), "destructive");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        navigate,
        location,
        detail,
        loading,
        remarks,
        setRemarks,
        deadlineRevisi,
        setDeadlineRevisi,
        isRevisionModalOpen,
        setIsRevisionModalOpen,
        isApproveModalOpen,
        setIsApproveModalOpen,
        submitting,
        toast,
        setToast,
        showToast,
        handleAction
    };
}
