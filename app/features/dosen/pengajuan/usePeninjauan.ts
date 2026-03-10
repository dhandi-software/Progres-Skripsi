import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Pengajuan, User } from "~/api/types";
import { pengajuanApi } from "~/api/pengajuan";

export function usePeninjauan(user: User | null) {
    const [originalList, setOriginalList] = useState<Pengajuan[]>([]);
    const [filteredList, setFilteredList] = useState<Pengajuan[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [sortOrder, setSortOrder] = useState<"TERBARU" | "TERLAMA">("TERBARU");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchPengajuanList = async () => {
            setLoading(true);
            try {
                const data = await pengajuanApi.getPengajuanByDosen();
                
                // Urutkan berdasarkan id menurun (TERBARU) dulu
                const sortedData = data.sort((a: any, b: any) => b.id - a.id);
                
                setOriginalList(sortedData);
                setFilteredList(sortedData);
            } catch (error) {
                console.error("Failed to fetch pengajuan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPengajuanList();
    }, []);

    useEffect(() => {
        let result = [...originalList];

        if (filterStatus !== "ALL") {
            result = result.filter((item) => item.status === filterStatus);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.mahasiswa.nama.toLowerCase().includes(query) ||
                    item.mahasiswa.nim.toLowerCase().includes(query) ||
                    item.judul.toLowerCase().includes(query) ||
                    item.semester.toString().includes(query) ||
                    item.tahunAkademik.toLowerCase().includes(query)
            );
        }

        if (sortOrder === "TERBARU") {
            result.sort((a, b) => b.id - a.id);
        } else {
            result.sort((a, b) => a.id - b.id);
        }

        setFilteredList(result);
        setCurrentPage(1); 
    }, [searchQuery, filterStatus, sortOrder, originalList]);

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedList = filteredList.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF();
    
        const loadImage = (url: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.crossOrigin = "Anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
          });
        };
    
        try {
          const logoUrl = "https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png";
          const img = await loadImage(logoUrl);
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const centerX = pageWidth / 2;
    
          doc.addImage(img, "PNG", centerX - 10, 10, 20, 20);
    
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text("FAKULTAS TEKNIK", centerX, 38, { align: "center" });
          doc.text("UNIVERSITAS PANCASILA", centerX, 44, { align: "center" });
    
          doc.setLineWidth(0.5);
          doc.line(14, 48, pageWidth - 14, 48);
    
          doc.setFontSize(12);
          doc.text(`DAFTAR PENINJAUAN JUDUL TUGAS AKHIR`, centerX, 55, { align: "center" });
    
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
    
          const now = new Date();
          const dateString = now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric"
          });
    
          const isAllStatus = filterStatus === 'ALL';
          const printStatus = isAllStatus 
              ? `Semua Status`
              : filterStatus;
              
          doc.text(`Dosen Peninjau : ${(user as any)?.name || (user as any)?.nama || '-'}`, 14, 65);
          
          if (isAllStatus) {
              const approvedCount = filteredList.filter(u => u.status === 'APPROVED').length;
              const rejectedCount = filteredList.filter(u => u.status === 'REJECTED').length;
              const pendingCount = filteredList.filter(u => u.status !== 'APPROVED' && u.status !== 'REJECTED').length;
              doc.text(`Status         : Semua Status (${approvedCount} Verified, ${rejectedCount} Rejected, ${pendingCount} Pending)`, 14, 70);
          } else {
              doc.text(`Status         : ${printStatus}`, 14, 70);
          }

          doc.text(`Tanggal Cetak  : ${dateString}`, pageWidth - 70, 65);
    
          const tableColumn = ["No", "Nama Mahasiswa", "NIM", "Judul", "Semester", "Tahun Akademik", "IPK", "SKS"];
    
          const tableRows = filteredList.map((u, index) => {
             let namaMahasiswa = u.mahasiswa.nama;
             // Jika filter adalah "Semua", tambahkan status di bawah nama mahasiswanya.
             if (isAllStatus) {
                 const statusText = u.status === 'APPROVED' ? 'Verified' : u.status === 'REJECTED' ? 'Rejected' : 'Pending';
                 namaMahasiswa += `\n(${statusText})`;
             }
             
             return [
                 (index + 1).toString(), 
                 namaMahasiswa, 
                 u.mahasiswa.nim, 
                 u.judul, 
                 u.semester?.toString() ?? "-",
                 u.tahunAkademik?.toString() ?? "-",
                 u.ipk?.toString() ?? "-",
                 u.sksDicapai?.toString() ?? "-"
             ];
          });
          
          const colStyles: any = {
              0: { cellWidth: 8 }, 
              1: { cellWidth: 35 }, 
              2: { cellWidth: 20 }, 
              3: { cellWidth: 70 }, 
              4: { cellWidth: 12 }, 
              5: { cellWidth: 20 }, 
              6: { cellWidth: 15 }, 
              7: { cellWidth: 15 }, 
          };
    
          autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 75, 
            theme: "striped",
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: {
              fillColor: [210, 80, 38], // #D25026 Orange
              textColor: [255, 255, 255],
              fontStyle: "bold",
              lineWidth: 0.1,
              lineColor: [210, 80, 38],
            },
            bodyStyles: {
              lineWidth: 0,
            },
            alternateRowStyles: {
                fillColor: [255, 245, 240] // Very light orange/gray
            },
            columnStyles: colStyles,
          });
    
          doc.save(`Daftar_Peninjauan_Judul.pdf`);
        } catch (error) {
          console.error("Failed to generate PDF", error);
          alert("Failed to generate PDF. check console for details.");
        }
    };

    return {
        originalList,
        filteredList,
        paginatedList,
        loading,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortOrder,
        setSortOrder,
        currentPage,
        totalPages,
        handlePageChange,
        handleDownloadPDF,
        itemsPerPage
    };
}
