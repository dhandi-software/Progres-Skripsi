"use client";

import React, { useEffect, useState } from "react";
import { bimbinganApi } from "../../../api/bimbinganApi";
import { 
    Users, User, FileText, Search, GraduationCap,
    ArrowRight, Loader2, Info, BarChart3, ChevronRight,
    X, Download, Clock, CheckCircle2, FileStack, History as HistoryIcon
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Label } from "../../../components/ui/label";
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

const taskOptionsList = [
    { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
    { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
    { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
    { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
    { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
    { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
];

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

export function MonitoringDesktop() {
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
    const [chartData, setChartData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<"target" | "riwayat" | "grafik">("target");

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
            setDetailTab("target");
            setIsHistoryLoading(true);
            
            const historyData = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim);
            
            const topicOrder: Record<string, number> = {
                "Bab 1: Pendahuluan": 1,
                "Bab 2: Tinjauan Pustaka": 2,
                "Bab 3: Metodologi": 3,
                "Bab 4: Hasil dan Pembahasan": 4,
                "Bab 5: Kesimpulan dan Saran": 5,
                "Laporan Akhir (Finalisasi)": 6
            };

            const sortedHistory = [...historyData].sort((a: any, b: any) => {
                const orderA = topicOrder[a.topik] || 99;
                const orderB = topicOrder[b.topik] || 99;
                if (orderA !== orderB) return orderA - orderB;
                return a.versi - b.versi;
            });
            
            setHistory(sortedHistory);

            // Generate Chart Data
            const groupedByTopic = historyData.reduce((acc: any, task: any) => {
                if (!acc[task.topik]) acc[task.topik] = [];
                acc[task.topik].push(task);
                return acc;
            }, {});

            const newChartData: any[] = [];
            newChartData.push({
                name: "Mulai",
                score: 0,
                fullTopic: "Mulai Bimbingan",
                diffDays: 0,
                isSubmitted: false,
                statusText: "Belum Mulai"
            });
            
            taskOptionsList.forEach(opt => {
                const topicTasks = groupedByTopic[opt.value];
                if (topicTasks) {
                    const assignedTask = topicTasks.find((t: any) => t.status === 'ASSIGNED');
                    const submittedTasks = topicTasks.filter((t: any) => ['SUBMITTED', 'REVISION', 'APPROVED'].includes(t.status));
                    submittedTasks.sort((a: any, b: any) => a.versi - b.versi); 

                    if (assignedTask || submittedTasks.length > 0) {
                        const deadline = assignedTask?.jadwalBimbingan ? new Date(assignedTask.jadwalBimbingan) : null;
                        
                        if (submittedTasks.length > 0) {
                            const firstSubmission = submittedTasks[0];
                            const submittedDate = new Date(firstSubmission.tanggal);
                            
                            let diffDays = 0;
                            if (deadline) {
                                const diffTime = submittedDate.getTime() - deadline.getTime();
                                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                            
                            const isApproved = submittedTasks.some((t: any) => t.status === 'APPROVED');
                            const baseScore = isApproved ? 100 : 50;

                            let score = baseScore;
                            if (diffDays > 0) {
                                score = Math.max(0, baseScore - (diffDays * 10));
                            }
                            
                            newChartData.push({
                                name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                                score: score,
                                fullTopic: opt.label,
                                diffDays: diffDays > 0 ? diffDays : 0,
                                isSubmitted: true,
                                isApproved: isApproved,
                                statusText: isApproved ? "Disetujui Dosen" : "Sedang Direviu"
                            });
                        } else if (assignedTask) {
                            let diffDays = 0;
                            if (deadline) {
                                const now = new Date();
                                const diffTime = now.getTime() - deadline.getTime();
                                diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            }
                            
                            const baseScore = 50;
                            let score = baseScore;
                            if (diffDays > 0) {
                                score = Math.max(0, baseScore - (diffDays * 10));
                            }
                            
                            newChartData.push({
                                name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                                score: score,
                                fullTopic: opt.label,
                                diffDays: diffDays > 0 ? diffDays : 0,
                                isSubmitted: false,
                                isApproved: false,
                                statusText: "Sedang Berjalan (Belum Submit)"
                            });
                        }
                    } else {
                        newChartData.push({
                            name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                            score: 0,
                            fullTopic: opt.label,
                            diffDays: 0,
                            isSubmitted: false,
                            statusText: "Belum Mulai"
                        });
                    }
                } else {
                    newChartData.push({
                        name: opt.label.split(':')[0].replace('Laporan Akhir (Finalisasi)', 'Laporan Akhir'), 
                        score: 0,
                        fullTopic: opt.label,
                        diffDays: 0,
                        isSubmitted: false,
                        statusText: "Belum Mulai"
                    });
                }
            });
            setChartData(newChartData);

        } catch (error) {
            console.error("Fetch History Error:", error);
        } finally {
            setIsHistoryLoading(false);
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

    const statsData = [
        { name: 'Total Dosen', value: data.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
        { name: 'Total Mahasiswa', value: data.reduce((acc, d) => acc + d.totalStudents, 0), icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
        { name: 'Rata-rata Progres', value: `${Math.round(data.reduce((acc, d) => acc + d.activeProgress, 0) / (data.length || 1))}%`, icon: BarChart3, color: 'text-amber-600 bg-amber-50' },
    ];

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

    // Normalize topik dari database ke BAB_LIST canonical name
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
            // Fetch full bimbingan history for each student
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

            // Cover header
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
                // Ensure enough space for student section (at least ~60 pts)
                if (currentY > doc.internal.pageSize.getHeight() - 70) {
                    doc.addPage();
                    currentY = 20;
                }

                // Student header bar
                doc.setFillColor(241, 245, 249); // slate-100
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

                // Group history by normalized bab, pick best status
                const babStatus: Record<string, string> = {};
                const babTanggal: Record<string, string> = {};
                const babCatatan: Record<string, string> = {};
                history.forEach((item: any) => {
                    const canonical = normalizeBab(item.topik);
                    const prev = babStatus[canonical];
                    // Priority: APPROVED > SUBMITTED > REVISION > ASSIGNED > undefined
                    const priority: Record<string, number> = { APPROVED: 4, SUBMITTED: 3, REVISION: 2, ASSIGNED: 1 };
                    const pNew = priority[item.status] || 0;
                    const pPrev = prev ? (priority[prev] || 0) : -1;
                    if (pNew > pPrev) {
                        babStatus[canonical] = item.status;
                        babTanggal[canonical] = item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
                        babCatatan[canonical] = item.catatan || '';
                    }
                });

                // Build table rows for each bab
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

            // Footer on each page
            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(`Halaman ${i} dari ${totalPages}  —  Laporan Monitoring Bimbingan  —  ${selectedDosen.dosen.nama}`, 14, doc.internal.pageSize.getHeight() - 5);
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
                // ── Dosen section divider ──
                if (currentY > pageH - 50) { doc.addPage(); currentY = 14; }

                doc.setFillColor(30, 41, 59); // slate-800
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
                    // Fetch full bimbingan history
                    let history: any[] = [];
                    try {
                        history = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim) || [];
                    } catch { /* skip */ }

                    if (currentY > pageH - 70) { doc.addPage(); currentY = 14; }

                    // Student header bar
                    doc.setFillColor(241, 245, 249); // slate-100
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

                    // Group history by normalized bab, collect revision count
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
                                d.cell.styles.textColor = [220, 38, 38]; // red for revision count
                                d.cell.styles.fontStyle = 'bold';
                            }
                        },
                        margin: { left: 14, right: 14 },
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 10;
                    studentIndex++;
                }

                currentY += 6; // gap between dosen sections
            }

            // Footer on each page
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

    return (
        <div className="min-h-screen bg-slate-50/50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-white p-6 lg:p-12 font-geist">
            <div className="max-w-[1600px] mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary">
                                <BarChart3 size={28} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Monitoring Bimbingan</h1>
                        </div>
                        <p className="text-slate-500 font-medium ml-18 text-lg">Pantau perkembangan bimbingan dosen dan mahasiswa secara real-time.</p>
                    </div>
                    
                    <div className="flex gap-6 relative z-10">
                        {statsData.map((stat, idx) => (
                            <div key={idx} className={cn("px-8 py-5 rounded-[28px] flex flex-col items-center border", stat.color.split(' ')[2])}>
                                <div className="flex items-center gap-2 mb-1">
                                    <stat.icon size={18} className={stat.color.split(' ')[0]} />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">{stat.name}</span>
                                </div>
                                <span className={cn("text-2xl font-black", stat.color.split(' ')[0])}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full">
                    {!selectedDosen ? (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative group flex-1 w-full max-w-full">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary" size={20} />
                                    <input 
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        placeholder="Cari dosen atau mahasiswa..."
                                        className="w-full h-16 pl-16 pr-6 bg-white border border-slate-200 rounded-[28px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary shadow-sm"
                                    />
                                </div>
                                <div className="flex bg-white rounded-[20px] p-1.5 border border-slate-200 shadow-sm shrink-0 items-center justify-between xl:justify-start gap-2">
                                    <div className="flex bg-slate-50 rounded-[16px] p-1">
                                        <button 
                                            onClick={() => setSortConfig({ key: 'nama', direction: sortConfig.key === 'nama' && sortConfig.direction === 'asc' ? 'desc' : 'asc'})}
                                            className={cn("px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all", sortConfig.key === 'nama' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Nama {sortConfig.key === 'nama' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                        <button 
                                            onClick={() => setSortConfig({ key: 'progress', direction: sortConfig.key === 'progress' && sortConfig.direction === 'desc' ? 'asc' : 'desc'})}
                                            className={cn("px-4 py-2.5 rounded-[12px] text-xs font-bold transition-all", sortConfig.key === 'progress' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-800')}
                                        >
                                            Progres {sortConfig.key === 'progress' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </button>
                                    </div>
                                    <Button onClick={handleDownloadAllProgress} disabled={isDownloadingAll} variant="outline" className="h-10 gap-2 rounded-[14px] text-xs font-bold border-brand-primary text-brand-primary hover:bg-brand-primary/5 disabled:opacity-70">
                                        {isDownloadingAll ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                        {isDownloadingAll ? 'Menyiapkan...' : 'Semua Dosen'}
                                    </Button>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {paginatedData.map((dosenData) => (
                                            <div 
                                                key={dosenData.dosen.id}
                                                onClick={() => setSelectedDosen(dosenData)}
                                                className="p-8 rounded-[32px] bg-white/80 backdrop-blur-xl border border-white text-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-[200px]"
                                            >
                                                {/* ===== KARTU DATA DOSEN (MULAI) ===== */}
                                                {/* Kartu ini dibuat berulang kali sesuai dengan jumlah data dosen */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {/* 1. BAGIAN AVATAR (HURUF INISIAL) */}
                                                        {/* Mengambil huruf pertama dari nama dosen menggunakan .charAt(0) */}
                                                        <div className="w-14 h-14 rounded-[20px] bg-slate-100/50 flex items-center justify-center font-black text-2xl text-slate-700 border border-slate-200/50">
                                                            {dosenData.dosen.nama.charAt(0)}
                                                        </div>

                                                        {/* 2. BAGIAN NAMA & JUMLAH MAHASISWA */}
                                                        <div>
                                                            {/* Menampilkan Nama Lengkap Dosen */}
                                                            <h4 className="font-bold text-base text-slate-800 line-clamp-1">{dosenData.dosen.nama}</h4>
                                                            
                                                            {/* Menampilkan Total Mahasiswa Bimbingan yang ditangani */}
                                                            <p className="text-[11px] font-medium tracking-widest text-slate-500 mt-1 uppercase">
                                                                {dosenData.totalStudents} Mahasiswa
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* 3. BAGIAN PROGRESS BAR (SKOR KEDISIPLINAN) */}
                                                <div className="mt-auto">
                                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-1.5 text-slate-800">
                                                        <span>Skor Kedisiplinan Progres</span>
                                                        {/* Menampilkan Angka Persentase (%) */}
                                                        <span>{dosenData.activeProgress}%</span>
                                                    </div>
                                                    
                                                    {/* Background dari progress bar (abu-abu) */}
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        {/* Warna isi progress bar (oranye/brand-primary) dengan lebar mengikuti persentase data */}
                                                        <div className="h-full bg-brand-primary" style={{ width: `${dosenData.activeProgress}%` }} />
                                                    </div>
                                                </div>
                                                {/* ===== KARTU DATA DOSEN (SELESAI) ===== */}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="pt-6 w-full flex justify-center">
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious 
                                                            onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} 
                                                            className={currentPage === 1 ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white"}
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
                                                            className={currentPage === totalPages ? "pointer-events-none opacity-50 bg-white" : "cursor-pointer bg-white"}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : !selectedStudentForHistory ? (
                        <div className="bg-white/50 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 min-h-[600px] flex flex-col">
                            <div className="space-y-10">
                                <button 
                                    onClick={() => setSelectedDosen(null)}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6"
                                >
                                    <ChevronRight size={18} className="rotate-180" /> Kembali ke Daftar Dosen
                                </button>
                                
                                {/* Dosen Detail Header */}
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-brand-primary/5 rounded-[32px] flex items-center justify-center border-2 border-brand-primary/10">
                                            <Users size={36} className="text-brand-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900">{selectedDosen.dosen.nama}</h2>
                                            <div className="flex items-center gap-3 mt-1 text-slate-800 text-base font-bold">
                                                <span className="flex items-center gap-1.5"><GraduationCap size={18} /> Dosen Pembimbing</span>
                                                <span className="w-2 h-2 rounded-full bg-slate-800" />
                                                <span>{selectedDosen.dosen.username}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 text-center px-8">
                                            <div className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Mhs Bimbingan</div>
                                            <div className="text-3xl font-black text-slate-900">{selectedDosen.totalStudents}</div>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-3xl border border-amber-100 text-center px-8">
                                            <div className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Skor Progres</div>
                                            <div className="text-3xl font-black text-amber-600">{selectedDosen.activeProgress}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student List section */}
                                <div className="space-y-4 pt-4">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-brand-primary rounded-full" />
                                            Daftar Mahasiswa Bimbingan
                                        </h3>
                                        <Button onClick={handleDownloadProgress} disabled={isDownloading} className="gap-2 rounded-xl text-white font-bold bg-slate-800 hover:bg-slate-900 shadow-md disabled:opacity-70">
                                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            {isDownloading ? 'Menyiapkan PDF...' : 'Download Laporan PDF'}
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {selectedDosen.students.map((student, idx) => {
                                            const activeTask = student.mahasiswa?.bimbingan?.[0];
                                            return (
                                                <div key={idx} className="bg-white p-4 rounded-[20px] border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                                    {/* Left: Student Info */}
                                                    <div className="flex items-center gap-4 xl:w-[30%]">
                                                        <div className="w-12 h-12 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-full flex items-center justify-center text-slate-700 text-lg font-bold border border-slate-200/60 shadow-sm">
                                                            {student.mahasiswa.nama.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm mb-0.5">{student.mahasiswa.nama}</p>
                                                            <p className="text-xs font-mono text-slate-500">{student.mahasiswa.nim}</p>
                                                        </div>
                                                    </div>

                                                    {/* Middle: Topic & Status */}
                                                    <div className="flex-1 bg-slate-50/50 px-5 py-3 rounded-[16px] border border-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm border border-slate-100">
                                                                <FileText size={16} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700">{activeTask?.topik || "Belum Ada Tugas Aktif"}</span>
                                                        </div>
                                                        
                                                        {/* Status Label */}
                                                        <div>
                                                            <span className={cn("px-4 py-2 rounded-xl text-[11px] font-bold tracking-wide inline-flex items-center justify-center min-w-[100px]",
                                                                activeTask?.status === 'APPROVED' ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" :
                                                                activeTask?.status === 'SUBMITTED' ? "bg-blue-50 text-blue-700 border border-blue-200/60" :
                                                                activeTask?.status === 'REVISION' ? "bg-amber-50 text-amber-700 border border-amber-200/60" :
                                                                "bg-slate-100 text-slate-600 border border-slate-200"
                                                            )}>
                                                                {activeTask?.status === 'APPROVED' ? 'Disetujui' : 
                                                                 activeTask?.status === 'SUBMITTED' ? 'Direviu' : 
                                                                 activeTask?.status === 'REVISION' ? 'Revisi' : 'Belum Mulai'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Explicit Action Button */}
                                                    <div className="xl:w-auto">
                                                        <button 
                                                            onClick={() => fetchHistory(student)}
                                                            className={cn("w-full xl:w-auto px-5 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border shadow-sm cursor-pointer",
                                                                activeTask?.status === 'SUBMITTED' ? "bg-brand-primary text-white border-transparent" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            Lihat Detail <ChevronRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/50 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 min-h-[600px] flex flex-col animate-in slide-in-from-right-8 duration-500">
                            <button 
                                onClick={() => setSelectedStudentForHistory(null)}
                                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-8 self-start bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-all hover:pr-6"
                            >
                                <ChevronRight size={18} className="rotate-180" /> Kembali ke Daftar Mahasiswa
                            </button>
                            
                            <div className="relative w-full bg-white rounded-[48px] shadow-sm overflow-hidden flex flex-col border border-slate-100">
                            {/* Modal Header */}
                            <div className="p-8 lg:p-10 border-b border-slate-100 bg-white relative">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-400 border border-slate-100 shadow-inner">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Detail Bimbingan: {selectedStudentForHistory.nama}</h2>
                                            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                                                {selectedStudentForHistory.nim}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-brand-primary/10 px-4 py-2 rounded-2xl border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest">
                                            Admin Monitoring
                                        </div>
                                        <button 
                                            onClick={() => setSelectedStudentForHistory(null)}
                                            className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all hover:rotate-90"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Navigation */}
                                <div className="flex gap-8 mt-10 border-b border-slate-100 px-2 overflow-x-auto scrollbar-hide">
                                    {[
                                        { id: "target", label: "Target Saat Ini", icon: FileStack },
                                        { id: "riwayat", label: "Riwayat Selesai", icon: HistoryIcon },
                                        { id: "grafik", label: "Grafik Kedisiplinan", icon: BarChart3 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDetailTab(tab.id as any)}
                                            className={cn(
                                                "pb-4 text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2.5 transition-all border-b-4",
                                                detailTab === tab.id 
                                                    ? "border-brand-primary text-brand-primary translate-y-px" 
                                                    : "border-transparent text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Modal Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar bg-slate-50/30">
                                {isHistoryLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-4">
                                        <Loader2 className="animate-spin" size={48} />
                                        <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Menyinkronkan Data...</p>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {detailTab === "target" && (
                                            <div className="max-w-6xl mx-auto space-y-8">
                                                {history.length > 0 ? (
                                                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                                                        <div className="h-3 w-full bg-brand-primary" />
                                                        <div className="p-8 md:p-12 space-y-10">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <h3 className="text-2xl font-black text-slate-900">{history[0].topik}</h3>
                                                                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">
                                                                            Versi {history[0].versi}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm font-bold text-slate-400 flex items-center gap-2 italic">
                                                                        <Clock size={14} /> Terakhir diperbarui: {new Date(history[0].tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    </p>
                                                                </div>
                                                                <div className={cn(
                                                                    "px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border shadow-sm",
                                                                    history[0].status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                                    history[0].status === 'REVISION' ? "bg-orange-50 border-orange-100 text-orange-600" :
                                                                    "bg-blue-50 border-blue-100 text-blue-600"
                                                                )}>
                                                                    {history[0].status === 'SUBMITTED' ? "Menunggu Reviu" : history[0].status}
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <FileText size={12} className="text-brand-primary" /> Berkas Mahasiswa
                                                                    </Label>
                                                                    {history[0].fileMahasiswa ? (
                                                                        <a 
                                                                            href={`${UPLOADS_URL}${history[0].fileMahasiswa}`}
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
                                                                        >
                                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary shadow-sm mr-4">
                                                                                <FileStack size={18} />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-slate-600 flex-1 truncate">Draft_Laporan.pdf</span>
                                                                            <Download size={16} className="text-slate-300 group-hover:text-brand-primary" />
                                                                        </a>
                                                                    ) : <p className="text-xs text-slate-400 italic">Belum ada berkas.</p>}
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <CheckCircle2 size={12} className="text-brand-primary" /> Hasil Reviu Dosen
                                                                    </Label>
                                                                    {history[0].fileDosen ? (
                                                                        <a 
                                                                            href={`${UPLOADS_URL}${history[0].fileDosen}`}
                                                                            target="_blank" rel="noopener noreferrer"
                                                                            className="flex items-center p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl hover:bg-emerald-50 transition-all group"
                                                                        >
                                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm mr-4">
                                                                                <FileText size={18} />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-emerald-700 flex-1 truncate">Reviu_Dosen.pdf</span>
                                                                            <Download size={16} className="text-emerald-300 group-hover:text-emerald-600" />
                                                                        </a>
                                                                    ) : <p className="text-xs text-slate-400 italic">Belum ada reviu.</p>}
                                                                </div>
                                                            </div>

                                                            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100/50">
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-1 h-6 bg-brand-primary rounded-full" />
                                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Catatan & Feedback</h4>
                                                                </div>
                                                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                                                    {history[0].catatan || "Tidak ada catatan untuk progres saat ini."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                                        <div className="w-24 h-24 bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300 mb-6">
                                                            <FileStack size={48} />
                                                        </div>
                                                        <h4 className="text-xl font-black text-slate-400">Belum Ada Target Aktif</h4>
                                                        <p className="text-slate-300 font-medium mt-2">Belum ada tugas bimbingan resmi.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {detailTab === "riwayat" && (
                                            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                                                <div className="relative space-y-10 before:absolute before:left-[17px] before:top-2 before:bottom-0 before:w-1 text-slate-900 before:bg-slate-100 before:rounded-full">
                                                    {history.length > 0 ? history.map((item, idx) => (
                                                        <div key={item.id} className="relative pl-14 group">
                                                            <div className={cn(
                                                                "absolute left-0 top-0 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm transition-all group-hover:scale-110",
                                                                item.status === 'APPROVED' ? "bg-emerald-500 text-white" : "bg-brand-primary text-white"
                                                            )}>
                                                                <span className="text-[10px] font-black">V{item.versi}</span>
                                                            </div>

                                                            <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all">
                                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <h5 className="font-black text-xl text-slate-900">{item.topik}</h5>
                                                                            <span className={cn(
                                                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                                                item.status === 'APPROVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                                                                                "bg-orange-50 border-orange-100 text-orange-600"
                                                                            )}>
                                                                                {item.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-100/50">
                                                                            <p className="text-sm text-slate-600 font-medium italic">"{item.catatan || "Tidak ada catatan."}"</p>
                                                                        </div>
                                                                        <div className="flex gap-4">
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <Clock size={12} /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                                <FileText size={12} /> {item.fileMahasiswa ? "Ada Berkas" : "Tanpa Berkas"}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2">
                                                                        {item.fileMahasiswa && (
                                                                            <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 hover:bg-brand-primary hover:text-white transition-all rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest group/btn">
                                                                                <Download size={14} className="group-hover/btn:animate-bounce" /> Draft
                                                                            </a>
                                                                        )}
                                                                        {item.fileDosen && (
                                                                            <a href={`${UPLOADS_URL}${item.fileDosen}`} target="_blank" className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-all rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest group/btn">
                                                                                <Download size={14} className="group-hover/btn:animate-bounce" /> Reviu
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">Belum Ada Riwayat</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {detailTab === "grafik" && (
                                            <div className="max-w-6xl mx-auto space-y-10">
                                                <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/30">
                                                    <div className="flex items-center justify-between mb-10">
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900">Grafik Kedisiplinan</h3>
                                                            <p className="text-sm font-medium text-slate-400 mt-1">Skor 100 = Tepat waktu. Skor menurun jika terlambat mengumpulkan draf.</p>
                                                        </div>
                                                        <div className="bg-orange-50 px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-orange-100">
                                                            <div className="w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Disiplin Progres</span>
                                                        </div>
                                                    </div>

                                                    <div className="h-[400px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                                                <defs>
                                                                    <linearGradient id="colorScoreAdmin" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                                <XAxis 
                                                                    dataKey="name" 
                                                                    axisLine={false} 
                                                                    tickLine={false} 
                                                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 900 }}
                                                                    dy={15}
                                                                />
                                                                <YAxis 
                                                                    axisLine={false} 
                                                                    tickLine={false} 
                                                                    tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 900 }}
                                                                    domain={[0, 100]}
                                                                    ticks={[0, 25, 50, 75, 100]}
                                                                    dx={-15}
                                                                />
                                                                <Tooltip 
                                                                    content={({ active, payload }) => {
                                                                        if (active && payload && payload.length) {
                                                                            const data = payload[0].payload;
                                                                            return (
                                                                                <div className="bg-white p-4 border-none shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[24px]">
                                                                                    <p className="font-black text-xs text-slate-900 mb-1 uppercase tracking-wider">{data.fullTopic}</p>
                                                                                    {data.statusText === 'Belum Mulai' ? (
                                                                                        <p className="text-[10px] font-bold text-slate-400">Belum Ada Progres</p>
                                                                                    ) : (
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Skor: {data.score}</p>
                                                                                            <p className="text-[10px] text-slate-500 font-bold">{data.isApproved ? '✔ Disetujui Dosen' : data.isSubmitted ? '⏳ Sudah Submit' : '⏳ Sedang Berjalan'}</p>
                                                                                            {data.diffDays > 0 ? (
                                                                                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Terlambat {data.diffDays} hari</p>
                                                                                            ) : (
                                                                                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{data.isSubmitted ? 'Tepat Waktu' : 'Dalam Tenggat'}</p>
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                />
                                                                <Area 
                                                                    type="monotone" 
                                                                    dataKey="score" 
                                                                    stroke="#f97316" 
                                                                    fillOpacity={1} 
                                                                    fill="url(#colorScoreAdmin)" 
                                                                    strokeWidth={4}
                                                                    dot={{ r: 5, fill: '#f97316', strokeWidth: 0, stroke: '#fff' }}
                                                                    activeDot={{ r: 7, stroke: '#ffedd5', strokeWidth: 4, fill: '#f97316' }}
                                                                />
                                                                <ReferenceLine y={0} stroke="#E5E7EB" />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Modal Footer */}
                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center items-center gap-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitoring Akademik Terpusat — Admin View</p>
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
