"use client";

import React, { useEffect, useState } from "react";
import { bimbinganApi } from "../../../api/bimbinganApi";
import { 
    Users, User, FileText, Search, GraduationCap,
    ArrowRight, Loader2, Info, BarChart3, ChevronRight,
    X, Download, Clock, CheckCircle2, FileStack, History as HistoryIcon,
    Menu, Filter
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { useSidebar } from "../../../components/ui/sidebar";
import { UPLOADS_URL } from "../../../api/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../../components/ui/pagination";

interface BimbinganData {
    dosen: {
        id: number;
        nama: string;
        username: string;
        photo?: string;
    };
    students: any[];
    totalStudents: number;
    activeProgress: number; // percentage
}

export function MonitoringMobile() {
    const { setOpenMobile } = useSidebar();
    const [data, setData] = useState<BimbinganData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDosen, setSelectedDosen] = useState<BimbinganData | null>(null);
    
    // Sort & Pagination State
    const [sortConfig, setSortConfig] = useState<{key: "nama" | "progress", direction: "asc" | "desc"}>({ key: "nama", direction: "asc" });
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // History Drill-Down State
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // Fuzzy-match topik ke skor progres — menangani berbagai format string di DB
    const getTopikScore = (topik: string): number => {
        if (!topik) return 0;
        const t = topik.toLowerCase();
        if (t.includes('laporan akhir') || t.includes('finalisasi')) return 100;
        if (t.includes('bab 5') || t.includes('bab v') || t.includes('kesimpulan')) return 90;
        if (t.includes('bab 4') || t.includes('bab iv') || t.includes('hasil dan pembahasan') || t.includes('hasil & pembahasan')) return 70;
        if (t.includes('bab 3') || t.includes('bab iii') || t.includes('metodologi')) return 50;
        if (t.includes('bab 2') || t.includes('bab ii') || t.includes('tinjauan pustaka') || t.includes('kajian pustaka')) return 30;
        if (t.includes('bab 1') || t.includes('bab i') || t.includes('pendahuluan')) return 15;
        return 0;
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await bimbinganApi.getAllProdiBimbingan();

            const calibratedData = response?.map((dosenData: BimbinganData) => {
                if (!dosenData.students || dosenData.students.length === 0) {
                    return { ...dosenData, activeProgress: 0 };
                }
                
                let totalScore = 0;
                dosenData.students.forEach((student: any) => {
                    const activeTask = student.mahasiswa?.bimbingan?.[0];
                    if (activeTask && activeTask.topik) {
                        let score = getTopikScore(activeTask.topik);
                        if (activeTask.status === 'APPROVED' && score < 100) {
                            score = Math.min(100, score + 10);
                        }
                        totalScore += score;
                    }
                });
                
                return {
                    ...dosenData,
                    activeProgress: Math.round(totalScore / dosenData.students.length)
                };
            }) || [];

            setData(calibratedData);
        } catch (error) {
            console.error("Fetch Monitoring Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchHistory = async (student: any) => {
        try {
            setSelectedStudentForHistory(student.mahasiswa);
            setIsHistoryLoading(true);
            const historyData = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim);
            setHistory(historyData);
        } catch (error) {
            console.error("Fetch History Error:", error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const [isDownloading, setIsDownloading] = useState(false);

    const BAB_LIST = [
        "Bab 1: Pendahuluan",
        "Bab 2: Tinjauan Pustaka",
        "Bab 3: Metodologi",
        "Bab 4: Hasil dan Pembahasan",
        "Bab 5: Kesimpulan dan Saran",
        "Laporan Akhir (Finalisasi)",
    ];

    const getStatusLabel = (status?: string) => {
        if (!status) return "Belum Mulai";
        if (status === 'APPROVED') return 'Disetujui';
        if (status === 'SUBMITTED') return 'Direviu';
        if (status === 'REVISION') return 'Revisi';
        if (status === 'ASSIGNED') return 'Sedang Berjalan';
        return status;
    };

    const normalizeBab = (topik: string): string => {
        const t = topik.toLowerCase();
        if (t.includes('laporan akhir') || t.includes('finalisasi')) return "Laporan Akhir (Finalisasi)";
        if (t.includes('bab 5') || t.includes('bab v') || t.includes('kesimpulan')) return "Bab 5: Kesimpulan dan Saran";
        if (t.includes('bab 4') || t.includes('bab iv') || t.includes('hasil')) return "Bab 4: Hasil dan Pembahasan";
        if (t.includes('bab 3') || t.includes('bab iii') || t.includes('metodologi')) return "Bab 3: Metodologi";
        if (t.includes('bab 2') || t.includes('bab ii') || t.includes('tinjauan') || t.includes('kajian')) return "Bab 2: Tinjauan Pustaka";
        if (t.includes('bab 1') || t.includes('bab i') || t.includes('pendahuluan')) return "Bab 1: Pendahuluan";
        return topik;
    };

    const handleDownloadProgress = async () => {
        if (!selectedDosen || isDownloading) return;
        setIsDownloading(true);

        try {
            const studentHistories: { student: any; history: any[] }[] = [];
            for (const student of selectedDosen.students) {
                try {
                    const historyData = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim);
                    studentHistories.push({ student: student.mahasiswa, history: historyData || [] });
                } catch {
                    studentHistories.push({ student: student.mahasiswa, history: [] });
                }
            }

            const doc = new jsPDF({ orientation: 'landscape' });
            const pageW = doc.internal.pageSize.getWidth();
            const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageW, 30, 'F');
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN MONITORING BIMBINGAN', 14, 13);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Dosen Pembimbing: ${selectedDosen.dosen.nama}  |  Total Mahasiswa: ${selectedDosen.totalStudents}  |  Tanggal: ${tanggal}`, 14, 22);

            let currentY = 40;

            studentHistories.forEach(({ student, history }, sIdx) => {
                if (currentY > doc.internal.pageSize.getHeight() - 70) {
                    doc.addPage();
                    currentY = 20;
                }

                doc.setFillColor(241, 245, 249);
                doc.roundedRect(14, currentY, pageW - 28, 14, 3, 3, 'F');
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                doc.setFont('helvetica', 'bold');
                doc.text(`${sIdx + 1}. ${student.nama}`, 20, currentY + 9);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(100, 116, 139);
                doc.text(`NIM: ${student.nim}`, pageW - 14 - 60, currentY + 9, { align: 'right' });
                currentY += 18;

                const babStatus: Record<string, string> = {};
                const babTanggal: Record<string, string> = {};
                const babCatatan: Record<string, string> = {};
                history.forEach((item: any) => {
                    const canonical = normalizeBab(item.topik);
                    const prev = babStatus[canonical];
                    const priority: Record<string, number> = { APPROVED: 4, SUBMITTED: 3, REVISION: 2, ASSIGNED: 1 };
                    const pNew = priority[item.status] || 0;
                    const pPrev = prev ? (priority[prev] || 0) : -1;
                    if (pNew > pPrev) {
                        babStatus[canonical] = item.status;
                        babTanggal[canonical] = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                        babCatatan[canonical] = item.catatan || '';
                    }
                });

                const tableRows = BAB_LIST.map((bab, bIdx) => {
                    const status = babStatus[bab];
                    return [
                        (bIdx + 1).toString(),
                        bab,
                        status ? getStatusLabel(status) : 'Belum Mulai',
                        babTanggal[bab] || '-',
                        babCatatan[bab] ? babCatatan[bab].substring(0, 60) + (babCatatan[bab].length > 60 ? '...' : '') : '-'
                    ];
                });

                autoTable(doc, {
                    head: [['No', 'Bab / Topik', 'Status', 'Tanggal', 'Catatan Dosen']],
                    body: tableRows,
                    startY: currentY,
                    theme: 'grid',
                    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
                    columnStyles: {
                        0: { cellWidth: 10 },
                        1: { cellWidth: 65 },
                        2: { cellWidth: 30 },
                        3: { cellWidth: 35 },
                        4: { cellWidth: 'auto' },
                    },
                    didParseCell: (data: any) => {
                        if (data.section === 'body' && data.column.index === 2) {
                            const val = data.cell.text[0];
                            if (val === 'Disetujui') data.cell.styles.textColor = [5, 150, 105];
                            else if (val === 'Direviu') data.cell.styles.textColor = [37, 99, 235];
                            else if (val === 'Revisi') data.cell.styles.textColor = [217, 119, 6];
                            else if (val === 'Belum Mulai') data.cell.styles.textColor = [148, 163, 184];
                        }
                    },
                    margin: { left: 14, right: 14 },
                });

                currentY = (doc as any).lastAutoTable.finalY + 12;
            });

            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(`Halaman ${i} dari ${totalPages}  —  ${selectedDosen.dosen.nama}`, 14, doc.internal.pageSize.getHeight() - 5);
            }

            doc.save(`Laporan_Bimbingan_${selectedDosen.dosen.nama.replace(/\s+/g, '_')}.pdf`);
        } finally {
            setIsDownloading(false);
        }
    };

    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    const handleDownloadAllProgress = async () => {
        if (!data || data.length === 0 || isDownloadingAll) return;
        setIsDownloadingAll(true);

        try {
            const doc = new jsPDF({ orientation: 'landscape' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const totalMahasiswa = data.reduce((acc, curr) => acc + curr.totalStudents, 0);

            // Cover header
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageW, 34, 'F');
            doc.setFontSize(17);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN MONITORING BIMBINGAN KESELURUHAN', 14, 14);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Dosen: ${data.length}  |  Total Mahasiswa: ${totalMahasiswa}  |  Tanggal: ${tanggal}`, 14, 24);

            let currentY = 44;
            let dosenIndex = 0;

            for (const dosenData of data) {
                if (currentY > pageH - 50) { doc.addPage(); currentY = 14; }

                doc.setFillColor(30, 41, 59);
                doc.rect(0, currentY, pageW, 12, 'F');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(`${dosenIndex + 1}. Dosen Pembimbing: ${dosenData.dosen.nama}  (${dosenData.totalStudents} Mahasiswa)`, 14, currentY + 8);
                currentY += 16;
                dosenIndex++;

                if (dosenData.students.length === 0) {
                    doc.setFontSize(9);
                    doc.setTextColor(148, 163, 184);
                    doc.setFont('helvetica', 'italic');
                    doc.text('Belum ada mahasiswa bimbingan.', 20, currentY + 6);
                    currentY += 14;
                    continue;
                }

                let studentIndex = 0;
                for (const student of dosenData.students) {
                    let history: any[] = [];
                    try {
                        history = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim) || [];
                    } catch { /* skip */ }

                    if (currentY > pageH - 70) { doc.addPage(); currentY = 14; }

                    doc.setFillColor(241, 245, 249);
                    doc.roundedRect(14, currentY, pageW - 28, 13, 2, 2, 'F');
                    doc.setFontSize(10);
                    doc.setTextColor(15, 23, 42);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`  ${studentIndex + 1}. ${student.mahasiswa.nama}`, 18, currentY + 8.5);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8.5);
                    doc.setTextColor(100, 116, 139);
                    doc.text(`NIM: ${student.mahasiswa.nim}`, pageW - 18, currentY + 8.5, { align: 'right' });
                    currentY += 17;

                    const babStatus: Record<string, string> = {};
                    const babTanggal: Record<string, string> = {};
                    const babRevisi: Record<string, number> = {};
                    const babCatatan: Record<string, string> = {};

                    history.forEach((item: any) => {
                        const canonical = normalizeBab(item.topik);
                        const priority: Record<string, number> = { APPROVED: 4, SUBMITTED: 3, REVISION: 2, ASSIGNED: 1 };
                        const pNew = priority[item.status] || 0;
                        const pPrev = babStatus[canonical] ? (priority[babStatus[canonical]] || 0) : -1;
                        if (pNew > pPrev) {
                            babStatus[canonical] = item.status;
                            babTanggal[canonical] = item.tanggal
                                ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '-';
                            babCatatan[canonical] = item.catatan || '';
                        }
                        if (item.status === 'REVISION') {
                            babRevisi[canonical] = (babRevisi[canonical] || 0) + 1;
                        }
                    });

                    const tableRows = BAB_LIST.map((bab, bIdx) => {
                        const status = babStatus[bab];
                        const revCount = babRevisi[bab] || 0;
                        const catatan = babCatatan[bab] || '';
                        return [
                            (bIdx + 1).toString(),
                            bab,
                            status ? getStatusLabel(status) : 'Belum Mulai',
                            babTanggal[bab] || '-',
                            revCount > 0 ? `${revCount}x revisi` : '-',
                            catatan ? catatan.substring(0, 55) + (catatan.length > 55 ? '…' : '') : '-',
                        ];
                    });

                    autoTable(doc, {
                        head: [['No', 'Bab / Topik', 'Status', 'Tanggal', 'Revisi', 'Catatan Dosen']],
                        body: tableRows,
                        startY: currentY,
                        theme: 'grid',
                        headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
                        bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
                        columnStyles: {
                            0: { cellWidth: 8 },
                            1: { cellWidth: 62 },
                            2: { cellWidth: 28 },
                            3: { cellWidth: 32 },
                            4: { cellWidth: 22 },
                            5: { cellWidth: 'auto' },
                        },
                        didParseCell: (d: any) => {
                            if (d.section === 'body' && d.column.index === 2) {
                                const v = d.cell.text[0];
                                if (v === 'Disetujui') d.cell.styles.textColor = [5, 150, 105];
                                else if (v === 'Direviu') d.cell.styles.textColor = [37, 99, 235];
                                else if (v === 'Revisi') d.cell.styles.textColor = [217, 119, 6];
                                else if (v === 'Belum Mulai') d.cell.styles.textColor = [148, 163, 184];
                            }
                            if (d.section === 'body' && d.column.index === 4 && d.cell.text[0] !== '-') {
                                d.cell.styles.textColor = [220, 38, 38];
                                d.cell.styles.fontStyle = 'bold';
                            }
                        },
                        margin: { left: 14, right: 14 },
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 10;
                    studentIndex++;
                }

                currentY += 6;
            }

            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(
                    `Halaman ${i} dari ${totalPages}  —  Laporan Monitoring Bimbingan Keseluruhan  —  ${tanggal}`,
                    14, pageH - 5
                );
            }

            doc.save(`Laporan_Monitoring_Keseluruhan.pdf`);
        } finally {
            setIsDownloadingAll(false);
        }
    };

    const filteredData = data.filter(d => 
        d.dosen.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.students.some(s => s.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => {
        if (sortConfig.key === "nama") {
            return sortConfig.direction === "asc" 
                ? a.dosen.nama.localeCompare(b.dosen.nama)
                : b.dosen.nama.localeCompare(a.dosen.nama);
        } else {
            return sortConfig.direction === "asc"
                ? a.activeProgress - b.activeProgress
                : b.activeProgress - a.activeProgress;
        }
    });

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-white pb-20 font-geist">
            {/* Mobile Header */}
            <div className="px-6 pt-6 pb-4 bg-white sticky top-0 z-20 border-b border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setOpenMobile(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-50">
                        <Menu size={24} className="text-slate-900" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">Monitoring</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bimbingan Dosen</p>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari dosen atau mahasiswa..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Loader2 className="animate-spin" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Memuat Data...</p>
                    </div>
                ) : (
                    <div className="w-full">
                        {!selectedDosen ? (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-3 mb-6">
                                    <div className="flex bg-white rounded-[20px] p-1.5 border border-slate-200 shadow-sm shrink-0 overflow-x-auto w-full">
                                        <button 
                                            onClick={() => setSortConfig({ key: 'nama', direction: sortConfig.key === 'nama' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                                            className={cn("px-4 py-2.5 rounded-[16px] text-xs font-bold transition-all whitespace-nowrap flex-1", sortConfig.key === 'nama' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Nama {sortConfig.key === 'nama' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                        <button 
                                            onClick={() => setSortConfig({ key: 'progress', direction: sortConfig.key === 'progress' && sortConfig.direction === 'desc' ? 'asc' : 'desc'})}
                                            className={cn("px-4 py-2.5 rounded-[16px] text-xs font-bold transition-all whitespace-nowrap flex-1", sortConfig.key === 'progress' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Progres {sortConfig.key === 'progress' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                    </div>
                                    <Button onClick={handleDownloadAllProgress} disabled={isDownloadingAll} variant="outline" className="w-full gap-2 rounded-[16px] text-xs font-bold border-brand-primary text-brand-primary hover:bg-brand-primary/5 py-3 h-auto disabled:opacity-70">
                                        {isDownloadingAll ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {isDownloadingAll ? 'Menyiapkan PDF...' : 'Download Semua Data Dosen'}
                                    </Button>
                                </div>

                                {paginatedData.map((dosenData) => (
                                    <div 
                                        key={dosenData.dosen.id}
                                        onClick={() => setSelectedDosen(dosenData)}
                                        className="p-5 rounded-[28px] bg-white border border-slate-100 text-slate-900 shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[16px] bg-slate-50 flex items-center justify-center font-black text-slate-700 border border-slate-100">
                                                    {dosenData.dosen.nama.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-800 line-clamp-1">{dosenData.dosen.nama}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                        {dosenData.totalStudents} Mahasiswa
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300" />
                                        </div>

                                        <div className="space-y-1.5 mb-2 mt-2 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-700">
                                                <span>Skor Progres</span>
                                                <span>{dosenData.activeProgress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-primary" style={{ width: `${dosenData.activeProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="pt-8 pb-4 w-full flex justify-center">
                                        <Pagination>
                                            <PaginationContent className="gap-1">
                                                <PaginationItem>
                                                    <PaginationPrevious 
                                                        onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} 
                                                        className={cn("px-2.5", currentPage === 1 ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white")}
                                                    />
                                                </PaginationItem>
                                                
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink 
                                                            onClick={() => setCurrentPage(i + 1)}
                                                            isActive={currentPage === i + 1}
                                                            className={cn("cursor-pointer font-bold", currentPage !== i + 1 && "bg-white border border-slate-100 hover:bg-slate-50")}
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}
                                                
                                                <PaginationItem>
                                                    <PaginationNext 
                                                        onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} 
                                                        className={cn("px-2.5", currentPage === totalPages ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white")}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        ) : !selectedStudentForHistory ? (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <button 
                                        onClick={() => setSelectedDosen(null)}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
                                    >
                                        <ChevronRight size={16} className="rotate-180" /> Kembali
                                    </button>
                                    
                                    <Button onClick={handleDownloadProgress} disabled={isDownloading} size="sm" className="gap-1.5 rounded-full text-[10px] text-white font-bold bg-slate-800 shadow-sm disabled:opacity-70">
                                        {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {isDownloading ? '...' : 'PDF'}
                                    </Button>
                                </div>
                                
                                <div className="bg-brand-primary/5 p-6 rounded-[32px] border border-brand-primary/10">
                                    <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{selectedDosen.dosen.nama}</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedDosen.totalStudents} Mahasiswa Bimbingan</p>
                                </div>
                                
                                <div className="space-y-3">
                                    {selectedDosen.students.map((student, idx) => {
                                        const activeTask = student.mahasiswa?.bimbingan?.[0];
                                        return (
                                            <div 
                                                key={idx} 
                                                onClick={() => fetchHistory(student)}
                                                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-transform"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-[14px] flex items-center justify-center text-slate-700 font-black border border-slate-100">
                                                        {student.mahasiswa.nama.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1 line-clamp-1">{student.mahasiswa.nama}</p>
                                                        <p className="text-[10px] font-mono text-slate-500">{student.mahasiswa.nim}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between gap-3 border border-slate-100">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 overflow-hidden line-clamp-1">
                                                        <FileText size={14} className="shrink-0 text-brand-primary" />
                                                        <span className="truncate">{activeTask?.topik || "Belum ada target"}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className={cn("px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                                        activeTask?.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                                        activeTask?.status === 'SUBMITTED' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        activeTask?.status === 'REVISION' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-white text-slate-400 border-slate-200"
                                                    )}>
                                                        {activeTask?.status || "PENDING"}
                                                    </span>
                                                    
                                                    <div className="text-[10px] font-bold text-brand-primary flex items-center gap-1">
                                                        Riwayat <ArrowRight size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <button 
                                    onClick={() => setSelectedStudentForHistory(null)}
                                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm"
                                >
                                    <ChevronRight size={16} className="rotate-180" /> Kembali
                                </button>
                                
                                <div className="bg-white rounded-[32px] shadow-sm p-6 border border-slate-100">
                                    <div className="mb-6 border-b border-slate-100 pb-5">
                                        <h3 className="text-lg font-black text-slate-900">{selectedStudentForHistory.nama}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Detail Bimbingan — {selectedStudentForHistory.nim}</p>
                                    </div>

                                    {isHistoryLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                                            <Loader2 className="animate-spin" size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Memuat Riwayat...</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.length > 0 ? history.map((item, idx) => (
                                                <div key={item.id} className="relative pl-8 before:absolute before:left-3 before:top-4 before:bottom-[-20px] before:w-0.5 before:bg-slate-100 last:before:hidden">
                                                    <div className={cn(
                                                        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-sm",
                                                        item.status === 'APPROVED' ? "bg-emerald-500" : "bg-brand-primary"
                                                    )}>
                                                        <span className="text-[8px] font-black text-white">V{item.versi}</span>
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="font-black text-xs text-slate-900 leading-tight">{item.topik}</h5>
                                                            <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase border",
                                                                item.status === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                                            )}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium italic mb-4 leading-relaxed">"{item.catatan || "Tidak ada catatan."}"</p>
                                                        
                                                        <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                            {item.fileMahasiswa && <span className="text-brand-primary flex items-center gap-1.5"><Download size={12} /> Draft</span>}
                                                            {item.fileDosen && <span className="text-emerald-500 flex items-center gap-1.5"><Download size={12} /> Reviu</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-10 text-slate-300 font-black uppercase tracking-widest text-[10px]">Belum Ada Riwayat</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
