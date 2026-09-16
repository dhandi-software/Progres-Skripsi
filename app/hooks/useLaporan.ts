import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { bimbinganApi } from "~/api/bimbinganApi";
import { getGrade, type LaporanItem } from "~/features/dosen/laporan/types/laporan";

export function useLaporan() {
    const { user } = useAuth();
    const [laporanData, setLaporanData] = useState<LaporanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLowVision, setIsLowVision] = useState(false);
    const [showDownloadToast, setShowDownloadToast] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchLaporan = async () => {
            if (!user) return;
            try {
                setIsLoading(true);
                const data = await bimbinganApi.getLaporanAkhir();
                setLaporanData(data || []);
            } catch (error) {
                console.error("Failed to fetch Laporan Akhir:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLaporan();
    }, [user]);

    // Reset pagination to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredData = laporanData.filter(item => 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.nim.includes(searchQuery)
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePrint = () => {
        setShowDownloadToast(true);

        const handleAfterPrint = () => {
            setShowDownloadToast(false);
            window.removeEventListener("afterprint", handleAfterPrint);
        };

        window.addEventListener("afterprint", handleAfterPrint);

        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleExportCSV = () => {
        if (!laporanData.length) return;
        
        const headers = [
            "No",
            "Nama Mahasiswa",
            "NIM",
            "Judul Kerja Praktik",
            "Bimbingan Approved",
            "Total Bimbingan",
            "Logbook Diisi",
            "Logbook Disetujui",
            "P1 Nama (Pembimbing)",
            "P1 K1",
            "P1 K2",
            "P1 K3",
            "P1 Total",
            "P2 Nama (Penguji)",
            "P2 K1",
            "P2 K2",
            "P2 K3",
            "P2 Total",
            "Nilai Akhir",
            "Huruf Mutu",
            "Status Progres"
        ];

        const rows = laporanData.map((item, index) => [
            index + 1,
            `"${item.nama}"`,
            item.nim,
            `"${item.judulSkripsi || '-'}"`,
            item.totalBimbinganSelesai,
            item.totalBimbingan,
            item.totalLogbook,
            item.totalLogbookApproved,
            `"${item.p1_nama || '-'}"`,
            item.p1_k1 !== null ? item.p1_k1 : "-",
            item.p1_k2 !== null ? item.p1_k2 : "-",
            item.p1_k3 !== null ? item.p1_k3 : "-",
            item.p1_total !== null ? item.p1_total : "-",
            `"${item.p2_nama || '-'}"`,
            item.p2_k1 !== null ? item.p2_k1 : "-",
            item.p2_k2 !== null ? item.p2_k2 : "-",
            item.p2_k3 !== null ? item.p2_k3 : "-",
            item.p2_total !== null ? item.p2_total : "-",
            item.nilaiAkhir !== null ? item.nilaiAkhir : "-",
            getGrade(item.nilaiAkhir).huruf,
            `"${item.statusProgress}"`
        ]);

        const csvContent = "\uFEFF" + [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Laporan_Akhir_Bimbingan_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        laporanData,
        filteredData,
        paginatedData,
        isLoading,
        searchQuery,
        setSearchQuery,
        isLowVision,
        setIsLowVision,
        showDownloadToast,
        currentPage,
        setCurrentPage,
        totalPages,
        itemsPerPage,
        handlePrint,
        handleExportCSV
    };
}
