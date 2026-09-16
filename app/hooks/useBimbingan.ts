import { useState, useEffect, useCallback } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import { io } from "socket.io-client";

export const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

export function useBimbingan() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Semua");

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE) || 1;
    const paginatedStudents = students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const fetchStudents = useCallback(async (currentSearch = searchQuery, currentStatus = statusFilter) => {
        try {
            const data = await bimbinganApi.getDosenBimbinganStudents(currentSearch, currentStatus);
            setStudents(data || []);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents(searchQuery, statusFilter);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchStudents]);

    useEffect(() => {
        fetchStudents(searchQuery, statusFilter);
        setCurrentPage(1);
    }, [statusFilter, fetchStudents]);

    useEffect(() => {
        if (!user) return;
        const socket = io(UPLOADS_URL);
        socket.emit("join", user.id);
        
        socket.on("bimbingan_submitted", () => {
            fetchStudents(searchQuery, statusFilter);
        });

        return () => {
            socket.disconnect();
        };
    }, [user, searchQuery, statusFilter, fetchStudents]);

    const handleStudentClick = (student: any) => {
        navigate(`/dosen/bimbingan/${student.mahasiswa.nim}`, { state: { student } });
    };

    return {
        user,
        students,
        loading,
        navigate,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        ITEMS_PER_PAGE,
        totalPages,
        paginatedStudents,
        fetchStudents,
        handleStudentClick,
        getStatusPenilaian
    };
}
