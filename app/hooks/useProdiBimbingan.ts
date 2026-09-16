import { useEffect, useState } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { useAuth } from "~/hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Users, GraduationCap, BarChart3 } from "lucide-react";

export interface BimbinganData {
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

export const taskOptionsList = [
    { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
    { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
    { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
    { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
    { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
    { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
];

export const getTopikScore = (topik: string): number => {
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

export function useProdiBimbingan() {
    const { user } = useAuth();
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
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

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
                const babTotalBimbingan: Record<string, number> = {};
                history.forEach((item: any) => {
                    const canonical = normalizeBab(item.topik);
                    babTotalBimbingan[canonical] = (babTotalBimbingan[canonical] || 0) + 1;
                    
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

                // Build table rows for each bab
                const tableRows = BAB_LIST.map((bab, bIdx) => {
                    const status = babStatus[bab];
                    const total = babTotalBimbingan[bab] || 0;
                    return [
                        (bIdx + 1).toString(),
                        bab,
                        status ? getStatusLabel(status) : 'Belum Mulai',
                        babTanggal[bab] || '-',
                        total > 0 ? `${total}x Bimbingan` : '-',
                        babCatatan[bab] ? babCatatan[bab].substring(0, 50) + (babCatatan[bab].length > 50 ? '...' : '') : '-'
                    ];
                });

                autoTable(doc, {
                    head: [['No', 'Bab / Topik', 'Status', 'Tanggal', 'Bimbingan', 'Catatan Dosen']],
                    body: tableRows,
                    startY: currentY,
                    theme: 'grid',
                    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
                    columnStyles: {
                        0: { cellWidth: 8 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 28 },
                        3: { cellWidth: 30 },
                        4: { cellWidth: 24 },
                        5: { cellWidth: 'auto' },
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

    const handleDownloadAllProgress = async () => {
        if (!data || data.length === 0 || isDownloadingAll) return;
        setIsDownloadingAll(true);

        try {
            const activeData = data.filter(d => d.students.length > 0);
            if (activeData.length === 0) {
                setIsDownloadingAll(false);
                return;
            }

            const doc = new jsPDF({ orientation: 'landscape' });
            const pageW = doc.internal.pageSize.getWidth();
            const pageH = doc.internal.pageSize.getHeight();
            const tanggal = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const totalMahasiswa = activeData.reduce((acc, curr) => acc + curr.totalStudents, 0);

            // Cover header
            doc.setFillColor(15, 23, 42);
            doc.rect(0, 0, pageW, 34, 'F');
            doc.setFontSize(17);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN MONITORING BIMBINGAN KESELURUHAN', 14, 14);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Dosen: ${activeData.length}  |  Total Mahasiswa: ${totalMahasiswa}  |  Tanggal: ${tanggal}`, 14, 24);

            let currentY = 44;
            let dosenIndex = 0;

            for (const dosenData of activeData) {
                if (currentY > pageH - 50) { doc.addPage(); currentY = 14; }

                doc.setFillColor(30, 41, 59); // slate-800
                doc.rect(0, currentY, pageW, 12, 'F');
                doc.setFontSize(10);
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.text(`${dosenIndex + 1}. Dosen Pembimbing: ${dosenData.dosen.nama}  (${dosenData.totalStudents} Mahasiswa)`, 14, currentY + 8);
                currentY += 16;
                dosenIndex++;

                let studentIndex = 0;
                for (const student of dosenData.students) {
                    let history: any[] = [];
                    try {
                        history = await bimbinganApi.getBimbinganByMahasiswa(student.mahasiswa.nim) || [];
                    } catch { /* skip */ }

                    if (currentY > pageH - 70) { doc.addPage(); currentY = 14; }

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

                    const babStatus: Record<string, string> = {};
                    const babTanggal: Record<string, string> = {};
                    const babTotalBimbingan: Record<string, number> = {};
                    const babCatatan: Record<string, string> = {};

                    history.forEach((item: any) => {
                        const canonical = normalizeBab(item.topik);
                        babTotalBimbingan[canonical] = (babTotalBimbingan[canonical] || 0) + 1;
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
                    });

                    const tableRows = BAB_LIST.map((bab, bIdx) => {
                        const status = babStatus[bab];
                        const total = babTotalBimbingan[bab] || 0;
                        const catatan = babCatatan[bab] || '';
                        return [
                            (bIdx + 1).toString(),
                            bab,
                            status ? getStatusLabel(status) : 'Belum Mulai',
                            babTanggal[bab] || '-',
                            total > 0 ? `${total}x Bimbingan` : '-',
                            catatan ? catatan.substring(0, 50) + (catatan.length > 50 ? '…' : '') : '-',
                        ];
                    });

                    autoTable(doc, {
                        head: [['No', 'Bab / Topik', 'Status', 'Tanggal', 'Bimbingan', 'Catatan Dosen']],
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
            }

            const totalPages = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(7);
                doc.setTextColor(148, 163, 184);
                doc.text(`Halaman ${i} dari ${totalPages}  —  Laporan Monitoring Bimbingan Keseluruhan`, 14, pageH - 5);
            }

            doc.save(`Laporan_Bimbingan_Keseluruhan_${new Date().toISOString().slice(0, 10)}.pdf`);
        } finally {
            setIsDownloadingAll(false);
        }
    };

    return {
        user,
        data,
        isLoading,
        searchQuery,
        setSearchQuery,
        selectedDosen,
        setSelectedDosen,
        sortConfig,
        setSortConfig,
        currentPage,
        setCurrentPage,
        ITEMS_PER_PAGE,
        selectedStudentForHistory,
        setSelectedStudentForHistory,
        history,
        chartData,
        isHistoryLoading,
        detailTab,
        setDetailTab,
        fetchData,
        fetchHistory,
        filteredData,
        totalPages,
        paginatedData,
        statsData,
        isDownloading,
        isDownloadingAll,
        handleDownloadProgress,
        handleDownloadAllProgress
    };
}
