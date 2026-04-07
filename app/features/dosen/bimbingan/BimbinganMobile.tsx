import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { Users, FileText, Send, Loader2, BookOpen, ChevronLeft, AlertCircle, FileStack, X, Upload, Download, Eye, Clock, CalendarIcon } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar, MonthYearFilter } from "~/components/ui/calendar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "~/components/ui/pagination";
import { Link } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Use dynamic import for client-side only component
const SharedPdfViewer = lazy(() => import('../../components/SharedPdfViewer.client').then(m => ({ default: m.SharedPdfViewer })));

const getStatusPengajuan = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return 'Belum Mengumpulkan';
        case 'SUBMITTED': return 'Sudah Mengumpulkan';
        case 'REVISION': return 'Perlu Perbaikan';
        case 'APPROVED': return 'Selesai (ACC)';
        default: return '-';
    }
};

const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return { text: "-", isLate: false, isWarning: false };
    const now = new Date();
    const dDate = new Date(deadline);
    dDate.setHours(23, 59, 59, 999);
    
    const diffTime = dDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Terlambat ${Math.abs(diffDays)} hari`, isLate: true, isWarning: false };
    if (diffDays === 0) return { text: "Hari ini", isLate: false, isWarning: true };
    if (diffDays <= 3) return { text: `${diffDays} hari lagi`, isLate: false, isWarning: true };
    return { text: `${diffDays} hari lagi`, isLate: false, isWarning: false };
};

export function BimbinganMobile() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<number | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{[key: number]: string}>({});
    const [selectedSchedules, setSelectedSchedules] = useState<{[key: number]: string}>({});
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive" | "default"} | null>(null);

    // List Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
    const paginatedStudents = students.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Detail View State
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat" | "grafik">("aktif");
    const [studentActiveTask, setStudentActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);

    // Review Modal State
    const [reviewingTask, setReviewingTask] = useState<any>(null);
    const [viewingTaskTopik, setViewingTaskTopik] = useState("");
    const [reviewFile, setReviewFile] = useState<File | null>(null);
    const [reviewCatatan, setReviewCatatan] = useState("");
    const [reviewStatus, setReviewStatus] = useState("REVISION");
    const [uploadingReview, setUploadingReview] = useState(false);
    const [annotations, setAnnotations] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const fetchStudents = async () => {
        try {
            const data = await bimbinganApi.getDosenBimbinganStudents();
            
            // Sort students so that SUBMITTED tasks appear at the top
            const sortedData = (data || []).sort((a: any, b: any) => {
                const aActive = a.mahasiswa?.bimbingan?.[0];
                const bActive = b.mahasiswa?.bimbingan?.[0];
                const aSub = aActive?.status === 'SUBMITTED' ? 1 : 0;
                const bSub = bActive?.status === 'SUBMITTED' ? 1 : 0;
                return bSub - aSub;
            });
            
            setStudents(sortedData);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudentTasks = async (mahasiswaId: number) => {
        setStudentLoading(true);
        try {
            const tasks = await bimbinganApi.getBimbinganByMahasiswa(mahasiswaId);
            const grouped = tasks.reduce((acc: any, task: any) => {
                if (!acc[task.topik] || task.versi > acc[task.topik].versi) {
                    acc[task.topik] = task;
                }
                return acc;
            }, {});
            const uniqueTasks: any[] = Object.values(grouped);
            const active = uniqueTasks.find((t: any) => t.status !== 'APPROVED');
            const completed = uniqueTasks.filter((t: any) => t.status === 'APPROVED');
            
            setStudentActiveTask(active || null);
            setCompletedTasks(completed);

            if (active) {
                setHistory(tasks.filter((t: any) => t.topik === active.topik).sort((a: any, b: any) => b.versi - a.versi));
            } else {
                setHistory([]);
            }

            // Generate Chart Data for Timeliness
            const taskOptionsList = [
                { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
                { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
                { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
                { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
                { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
                { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
            ];
            
            const groupedByTopic = tasks.reduce((acc: any, task: any) => {
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
                    submittedTasks.sort((a: any, b: any) => a.versi - b.versi); // First submission

                    if (assignedTask || submittedTasks.length > 0) {
                        const deadline = assignedTask?.jadwalBimbingan ? new Date(assignedTask.jadwalBimbingan) : null;
                        
                        // Cek apakah sudah ada submission
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
                                score = Math.max(0, baseScore - (diffDays * 10)); // Deduct 10 points per day late
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
                            // Belum draf di-submit, cek deadline
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
            console.error(error);
        } finally {
            setStudentLoading(false);
        }
    };

    const handleStudentClick = (student: any) => {
        setSelectedStudent(student);
        setActiveTab("aktif");
        setIsEditingTask(false);
        fetchStudentTasks(student.mahasiswa.id);
    };

    const handleAssign = async (mahasiswaId: number) => {
        const task = selectedTasks[mahasiswaId];
        const jadwal = selectedSchedules[mahasiswaId];
        if (!task) {
            showToast("Pilih bab dahulu", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            if (isEditingTask && studentActiveTask) {
                await bimbinganApi.editBimbinganTask(studentActiveTask.id, task, jadwal ? new Date(jadwal) : undefined);
                showToast("Target progres diperbarui!", "success");
            } else {
                await bimbinganApi.assignBimbinganTask(mahasiswaId, task, jadwal ? new Date(jadwal) : undefined);
                showToast("Tugas diberikan!", "success");
            }
            setSelectedTasks(prev => { const next = {...prev}; delete next[mahasiswaId]; return next; });
            setSelectedSchedules(prev => { const next = {...prev}; delete next[mahasiswaId]; return next; });
            setIsEditingTask(false);
            fetchStudents();
            if (selectedStudent) fetchStudentTasks(selectedStudent.mahasiswa.id);
        } catch (error) {
            console.error("Failed to assign:", error);
            showToast(isEditingTask ? "Gagal memperbarui target" : "Gagal memberikan tugas", "destructive");
        } finally {
            setAssigningId(null);
        }
    };

    const taskOptions = [
        { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
        { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
        { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
        { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
        { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
        { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
    ];

    const handleOpenReview = async (task: any, isReadOnly: boolean = false) => {
        setReviewingTask(task);
        if (task.catatan && task.catatan !== "Task Assigned") {
            setReviewCatatan(task.catatan);
        } else {
            setReviewCatatan("");
        }
        setViewingTaskTopik(task.topik);
        setReviewStatus(isReadOnly ? task.status : "REVISION");
        setReviewFile(null);
        setAnnotations([]);
        setHistory([]);

        if (task.status === 'SUBMITTED' && !task.isReadDosen && !isReadOnly) {
            try {
                await bimbinganApi.markAsRead(task.id);
            } catch (error) {
                console.error("Failed to mark as read:", error);
            }
        }

        try {
            const data = await bimbinganApi.getAnnotations(task.id);
            const formatted = data.map((a: any) => {
                const pos = typeof a.posisi === 'string' ? JSON.parse(a.posisi) : a.posisi;
                return {
                    ...pos,
                    id: String(a.id)
                };
            });
            setAnnotations(formatted);

            const dataHistory = await bimbinganApi.getBimbinganHistory(task.mahasiswaId, task.topik);
            setHistory(dataHistory);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddHighlight = useCallback(async (highlight: any) => {
        if (!reviewingTask) return;
        try {
            const data = await bimbinganApi.createAnnotation({
                bimbinganId: reviewingTask.id,
                komentar: highlight.comment.text,
                warna: "#FFFF00",
                posisi: highlight
            });
            setAnnotations(prev => [{ ...highlight, id: String(data.id) }, ...prev]);
        } catch (error) {
            console.error("Gagal menyimpan anotasi:", error);
            showToast("Gagal menyimpan anotasi", "destructive");
        }
    }, [reviewingTask]);

    const handleDeleteHighlight = useCallback(async (id: string) => {
        try {
            await bimbinganApi.deleteAnnotation(parseInt(id));
            setAnnotations(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Gagal menghapus anotasi:", error);
        }
    }, []);

    const handleReviewSubmit = async () => {
        if (!reviewingTask) return;
        setUploadingReview(true);
        try {
            await bimbinganApi.uploadRevisiDosen(reviewingTask.id, reviewFile, reviewStatus, reviewCatatan);
            showToast("Hasil reviu berhasil disimpan!", "success");
            setReviewingTask(null);
            fetchStudents();
            if (selectedStudent) {
                fetchStudentTasks(selectedStudent.mahasiswa.id);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan reviu", "destructive");
        } finally {
            setUploadingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-[#119DA4]" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist relative">
            {toastProps && (
                <div className="fixed top-4 right-4 left-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}

            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
                 <button 
                    onClick={() => selectedStudent ? setSelectedStudent(null) : window.history.back()} 
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <ChevronLeft size={24} />
                 </button>
                 <h1 className="text-lg font-bold text-gray-900 line-clamp-1">{selectedStudent ? `Bimbingan: ${selectedStudent.mahasiswa.nama}` : "Daftar Bimbingan"}</h1>
            </div>

            {!selectedStudent ? (
                <div className="p-4 space-y-4">
                    {students.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center flex flex-col items-center">
                            <Users className="w-12 h-12 text-gray-200 mb-3" />
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Belum ada mahasiswa</h3>
                            <p className="text-xs text-gray-500">
                                Mahasiswa yang disetujui akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1">
                                Daftar Mahasiswa ({students.length})
                            </div>
                            {paginatedStudents.map((pengajuan, idx) => {
                                const mhs = pengajuan.mahasiswa;
                                const bimbinganList = mhs.bimbingan || [];
                                const activeTask = bimbinganList.length > 0 ? bimbinganList[0] : null;

                                return (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        {/* Mhs Info */}
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex flex-col gap-1 items-start">
                                                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{mhs.nama}</h3>
                                                    {activeTask?.status === 'SUBMITTED' && (
                                                        <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded border border-red-200 font-bold uppercase tracking-widest whitespace-nowrap inline-flex">BARU</span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-mono text-gray-500 mt-0.5">{mhs.nim}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleStudentClick(pengajuan)}
                                                className="px-3 py-1.5 bg-[#119DA4] text-white text-[10px] font-bold rounded-lg shrink-0"
                                            >
                                                Lihat Detail
                                            </button>
                                        </div>

                                        {/* Judul & Progres */}
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
                                            <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">
                                                {pengajuan.judul}
                                            </p>
                                        </div>

                                        {/* Current Task */}
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Target Saat Ini</span>
                                            {activeTask ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0 border border-orange-100">
                                                        <FileText className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 leading-tight mb-1">{activeTask.topik}</span>
                                                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${activeTask.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                            {getStatusPenilaian(activeTask.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Belum ada tugas</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {totalPages > 1 && !selectedStudent && (
                        <div className="pt-2 flex justify-center pb-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {Array.from({length: totalPages}).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink 
                                                href="#" 
                                                isActive={currentPage === i + 1}
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext 
                                            href="#" 
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col min-h-[calc(100vh-60px)]">
                    <div className="bg-white px-4 border-b border-gray-200 flex space-x-2 overflow-x-auto scrollbar-hide shrink-0">
                        <button
                            onClick={() => setActiveTab("aktif")}
                            className={`py-3 text-sm whitespace-nowrap px-2 font-bold border-b-2 transition-colors flex-1 text-center ${activeTab === 'aktif' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Target Saat Ini
                        </button>
                        <button
                            onClick={() => setActiveTab("grafik")}
                            className={`py-3 text-sm whitespace-nowrap px-2 font-bold border-b-2 transition-colors flex-1 text-center ${activeTab === 'grafik' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Grafik Kedisiplinan
                        </button>
                        <button
                            onClick={() => setActiveTab("riwayat")}
                            className={`py-3 text-sm whitespace-nowrap px-2 font-bold border-b-2 transition-colors flex-1 text-center ${activeTab === 'riwayat' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Riwayat Selesai
                        </button>
                    </div>

                    <div className="p-4 flex-1">
                        {studentLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-[#119DA4]" size={32} />
                            </div>
                        ) : activeTab === 'aktif' ? (
                            <div className="space-y-6">
                                {/* Active Task Card */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">Target Saat Ini</h3>
                                    {studentActiveTask ? (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                            <div className="h-1.5 w-full bg-[#119DA4]"></div>
                                            <div className="p-4 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <FileText className="w-5 h-5 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{studentActiveTask.topik}</div>
                                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                                            {new Date(studentActiveTask.tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Status Pengajuan</span>
                                                        <span className="font-bold text-gray-900">{getStatusPengajuan(studentActiveTask.status)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Penilaian</span>
                                                        <span className="font-bold text-gray-900">{getStatusPenilaian(studentActiveTask.status)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Batas Waktu</span>
                                                        <span className="font-bold text-gray-900">{studentActiveTask.jadwalBimbingan ? new Date(studentActiveTask.jadwalBimbingan).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}) : '-'}</span>
                                                    </div>
                                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                                        <span className="font-bold text-gray-700">Waktu Tersisa</span>
                                                        <span className={`font-bold ${getTimeRemaining(studentActiveTask.jadwalBimbingan).isLate ? 'text-red-600' : 'text-gray-900'}`}>
                                                            {getTimeRemaining(studentActiveTask.jadwalBimbingan).text}
                                                        </span>
                                                    </div>
                                                </div>

                                                {(studentActiveTask.status === 'SUBMITTED' || studentActiveTask.status === 'REVISION') && (
                                                    <button 
                                                        onClick={() => handleOpenReview(studentActiveTask)}
                                                        className="w-full py-2.5 px-4 bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex justify-center items-center gap-2"
                                                    >
                                                        <FileStack className="w-4 h-4" /> Periksa & Berikan Reviu
                                                    </button>
                                                )}
                                                {studentActiveTask.status !== 'APPROVED' && (
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-2 mt-2">
                                                        <span className="text-[10px] text-gray-500 text-center italic">
                                                            {studentActiveTask.status === 'ASSIGNED' 
                                                                ? "Menunggu mahasiswa mengunggah draf..." 
                                                                : "Draf telah dikumpulkan/direviu. Anda masih bisa mengubah target bab/deadline jika diperlukan."}
                                                        </span>
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedTasks(prev => ({...prev, [selectedStudent.mahasiswa.id]: studentActiveTask.topik}));
                                                                if (studentActiveTask.jadwalBimbingan) {
                                                                    setSelectedSchedules(prev => ({...prev, [selectedStudent.mahasiswa.id]: studentActiveTask.jadwalBimbingan}));
                                                                }
                                                                setIsEditingTask(true);
                                                                // Mobile specific: switch to form
                                                            }} 
                                                            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                                                        >
                                                            Edit Target / Deadline
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                            <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Tidak Ada Target Aktif</h4>
                                            <p className="text-[10px] text-gray-500">
                                                Semua target sebelumnya telah selesai.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Form / History */}
                                {studentActiveTask && !isEditingTask ? (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 text-sm">Riwayat Versi Draf</h3>
                                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-200 pl-1">
                                            {history.length > 0 ? history.map((item) => (
                                                <div key={item.id} className="relative flex items-start gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0 z-10 flex items-center justify-center ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-[#119DA4]'}`}>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-gray-800 text-xs">Versi {item.versi}</div>
                                                            <div className="text-[9px] text-gray-500 font-medium">{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500">
                                                            {item.status === 'ASSIGNED' ? "Diberikan oleh Anda" :
                                                             item.status === 'SUBMITTED' ? "Diunggah mahasiswa" :
                                                             item.status === 'REVISION' ? <span className="text-orange-600 font-medium">Anda memberikan revisi</span> :
                                                             item.status === 'APPROVED' ? <span className="text-green-600 font-medium">Telah di-ACC</span> : ""}
                                                        </p>
                                                        {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                            <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 w-max bg-blue-50 px-2 py-1 rounded">
                                                                <Download className="w-3 h-3" /> Unduh PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-xs text-gray-400 italic">Belum ada riwayat</div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-gray-900 text-sm">{isEditingTask ? "Edit Target Saat Ini" : "Berikan Target Baru"}</h3>
                                            {isEditingTask && (
                                                <button onClick={() => {
                                                    setIsEditingTask(false);
                                                    setSelectedTasks(prev => { const next = {...prev}; delete next[selectedStudent.mahasiswa.id]; return next; });
                                                    setSelectedSchedules(prev => { const next = {...prev}; delete next[selectedStudent.mahasiswa.id]; return next; });
                                                }} className="text-[10px] text-blue-600 hover:underline font-bold">Batalkan Edit</button>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1">Pilih Bab Target</label>
                                            <CustomSelect 
                                                options={taskOptions.map(opt => ({
                                                    ...opt,
                                                    disabled: completedTasks.some(t => t.topik === opt.value) || studentActiveTask?.topik === opt.value
                                                }))}
                                                value={selectedTasks[selectedStudent.mahasiswa.id] || ""}
                                                onChange={(val) => setSelectedTasks(prev => ({...prev, [selectedStudent.mahasiswa.id]: val}))}
                                                placeholder="Pilih Bab"
                                                className="h-10 text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1">Batas Waktu</label>
                                            <div className="flex flex-col gap-2 relative z-[150]">
                                                <MonthYearFilter 
                                                    date={selectedSchedules[selectedStudent.mahasiswa.id] ? new Date(selectedSchedules[selectedStudent.mahasiswa.id]) : undefined}
                                                    setDate={(d) => {
                                                        if (d) {
                                                            const existingDate = selectedSchedules[selectedStudent.mahasiswa.id] ? new Date(selectedSchedules[selectedStudent.mahasiswa.id]) : null;
                                                            const hours = existingDate ? existingDate.getHours() : 23;
                                                            const minutes = existingDate ? existingDate.getMinutes() : 59;
                                                            d.setHours(hours, minutes);
                                                            setSelectedSchedules(prev => ({...prev, [selectedStudent.mahasiswa.id]: d.toISOString()}));
                                                        } else {
                                                            setSelectedSchedules(prev => { const next = {...prev}; delete next[selectedStudent.mahasiswa.id]; return next; });
                                                        }
                                                    }}
                                                />
                                                <div className="flex mt-1 w-full">
                                                    <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between transition-colors hover:bg-gray-50 focus-within:border-[#119DA4] focus-within:ring-1 focus-within:ring-[#119DA4]">
                                                        <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Jam</label>
                                                        <input 
                                                            type="time" 
                                                            className="px-2 py-1 text-sm font-bold bg-transparent outline-none text-gray-800"
                                                            value={(() => {
                                                                if (!selectedSchedules[selectedStudent.mahasiswa.id]) return "23:59";
                                                                const d = new Date(selectedSchedules[selectedStudent.mahasiswa.id]);
                                                                return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                                            })()}
                                                            onChange={(e) => {
                                                                const d = selectedSchedules[selectedStudent.mahasiswa.id] ? new Date(selectedSchedules[selectedStudent.mahasiswa.id]) : new Date();
                                                                if (e.target.value) {
                                                                    const [hh, mm] = e.target.value.split(":");
                                                                    d.setHours(parseInt(hh), parseInt(mm));
                                                                    setSelectedSchedules(prev => ({...prev, [selectedStudent.mahasiswa.id]: d.toISOString()}));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleAssign(selectedStudent.mahasiswa.id)}
                                            disabled={assigningId === selectedStudent.mahasiswa.id || !selectedTasks[selectedStudent.mahasiswa.id] || !selectedSchedules[selectedStudent.mahasiswa.id]}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#119DA4] active:bg-[#0b6b70] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm mt-2"
                                        >
                                            {assigningId === selectedStudent.mahasiswa.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Send size={14} />
                                            )}
                                            {isEditingTask ? "Terapkan Edit" : "Tugaskan"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'grafik' ? (
                            <div className="space-y-4">
                                {chartData.length > 0 ? (
                                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-800 mb-0.5">Grafik Kedisiplinan</h3>
                                        <p className="text-[10px] text-gray-500 mb-4">Skor 100 = Tepat waktu. Skor turun jika terlambat draf.</p>
                                        <div className="h-[250px] w-full mt-2">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                                                    <defs>
                                                        <linearGradient id="colorScoreMobile" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis 
                                                        dataKey="name" 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }}
                                                        dy={8}
                                                    />
                                                    <YAxis 
                                                        axisLine={false} 
                                                        tickLine={false} 
                                                        tick={{ fontSize: 10, fill: '#6B7280' }}
                                                        domain={[0, 100]}
                                                        ticks={[0, 50, 100]}
                                                    />
                                                    <Tooltip 
                                                        content={({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const data = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-2 border border-gray-100 shadow-lg rounded-xl">
                                                                        <p className="font-bold text-[11px] text-gray-900 mb-0.5">{data.fullTopic}</p>
                                                                        {data.statusText === 'Belum Mulai' ? (
                                                                            <p className="text-[10px] font-medium text-gray-500">Belum Ada Progres</p>
                                                                        ) : (
                                                                            <>
                                                                                <p className="text-[10px] font-medium text-[#f97316]">Skor: {data.score}</p>
                                                                                <p className="text-[9px] text-gray-500 mt-0.5 font-semibold">{data.isApproved ? '✔ Disetujui Dosen' : data.isSubmitted ? '⏳ Menunggu ACC' : '⏳ Sedang Berjalan (Belum Submit)'}</p>
                                                                                {data.diffDays > 0 ? (
                                                                                    <p className="text-[10px] text-red-500 mt-0.5">Terlambat {data.diffDays} hr</p>
                                                                                ) : (
                                                                                    <p className="text-[10px] text-green-600 mt-0.5">{data.isSubmitted ? 'Tepat Waktu/Awal' : 'Masih tenggat waktu'}</p>
                                                                                )}
                                                                            </>
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
                                                        fill="url(#colorScoreMobile)" 
                                                        strokeWidth={2.5}
                                                        dot={{ r: 4, fill: '#f97316', strokeWidth: 0, stroke: '#fff' }}
                                                        activeDot={{ r: 6, stroke: '#ffedd5', strokeWidth: 3, fill: '#f97316' }}
                                                        animationDuration={1500}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">Belum ada data</h4>
                                        <p className="text-[10px] text-gray-500">
                                            Skor kedisiplinan akan muncul setelah draf bab dinilai.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {completedTasks.length === 0 ? (
                                    <div className="py-12 text-center border border-gray-200 border-dashed rounded-xl flex flex-col items-center bg-gray-50/50">
                                        <BookOpen className="w-10 h-10 text-gray-300 mb-2" />
                                        <h3 className="text-xs font-bold text-gray-800 mb-1">Belum ada Bab Disetujui</h3>
                                    </div>
                                ) : (
                                    completedTasks.map(task => (
                                        <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                            <div className="h-1.5 w-full bg-green-500"></div>
                                            <div className="p-4 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-center block max-w-fit">SELESAI (ACC)</span>
                                                    </div>
                                                    <h3 className="text-xs font-bold text-gray-900 mb-1 leading-tight">{task.topik}</h3>
                                                    <p className="text-[10px] text-gray-500 mb-3">
                                                        Disetujui: {new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {task.fileDosen && (
                                                        <a href={`${UPLOADS_URL}${task.fileDosen}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 active:bg-green-100 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold transition-colors">
                                                            <Download className="w-3.5 h-3.5" /> Draf Target (ACC)
                                                        </a>
                                                    )}
                                                    {task.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                        <button onClick={() => handleOpenReview(task, true)} className="flex items-center justify-center p-2 bg-white border border-gray-200 text-gray-700 rounded-lg shrink-0" title="Lihat Anotasi">
                                                            <Eye className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewingTask && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full  overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">{reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED' ? "Melihat Dokumen Reviu (ReadOnly)" : "Pemeriksaan Bimbingan"}</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Topik: {viewingTaskTopik}</p>
                            </div>
                            <button onClick={() => setReviewingTask(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {/* Document Viewer Area (Only if PDF) */}
                            {reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') ? (
                                <div className="border-b border-gray-100 bg-gray-50 flex flex-col" style={{ height: "45vh", minHeight: "350px" }}>
                                    <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                                        <h4 className="font-bold text-[11px] text-gray-700 flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5 text-[#119DA4]" />
                                            Live Annotator
                                        </h4>
                                        <a href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                                            <Download className="w-3 h-3" /> Unduh
                                        </a>
                                    </div>
                                    <div className="flex-1 relative overflow-hidden">
                                        <Suspense fallback={<div className="flex h-full items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
                                            <SharedPdfViewer 
                                                url={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`}
                                                initialHighlights={annotations}
                                                onAddHighlight={handleAddHighlight}
                                                onDeleteHighlight={handleDeleteHighlight}
                                                readOnly={false}
                                            />
                                        </Suspense>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 flex flex-col items-center justify-center bg-gray-50/50 border-b border-gray-100">
                                    <FileText className="w-10 h-10 text-gray-300 mb-3" />
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">Pratinjau Tidak Tersedia</h4>
                                    <p className="text-[10px] text-gray-500 text-center mb-4">
                                        File ({reviewingTask.fileMahasiswa?.split('.').pop()}) tidak mendukung Live Annotator.
                                    </p>
                                    <a 
                                        href={`${UPLOADS_URL}${reviewingTask.fileMahasiswa}`} 
                                        target="_blank" rel="noreferrer" 
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg text-xs shadow-sm transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Unduh Draf
                                    </a>
                                </div>
                            )}

                            {/* Action Form */}
                            {!(reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED') && (
                                <div className="p-4 space-y-4 bg-white flex-1 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Keputusan Reviu</label>
                                        <div className="flex flex-col gap-2">
                                            <label className={`flex items-start gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${reviewStatus === 'REVISION' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100'}`}>
                                                <input 
                                                    type="radio" name="status" value="REVISION" 
                                                    checked={reviewStatus === "REVISION"}
                                                    onChange={() => setReviewStatus("REVISION")}
                                                    className="mt-0.5 w-3.5 h-3.5 text-orange-500 focus:ring-orange-500"
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-gray-900 block">Perlu Revisi</span>
                                                </div>
                                            </label>
                                            <label className={`flex items-start gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${reviewStatus === 'APPROVED' ? 'border-green-600 bg-green-50/30' : 'border-gray-100'}`}>
                                                <input 
                                                    type="radio" name="status" value="APPROVED" 
                                                    checked={reviewStatus === "APPROVED"}
                                                    onChange={() => setReviewStatus("APPROVED")}
                                                    className="mt-0.5 w-3.5 h-3.5 text-green-600 focus:ring-green-600"
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-gray-900 block">Disetujui (ACC)</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    {!reviewingTask.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Upload Hasil Reviu (Opsional)</label>
                                            <p className="text-[10px] text-gray-500 mb-2">Unggah file yang sudah dicoret offline jika ada.</p>
                                            <input 
                                                type="file" 
                                                accept=".doc,.docx,.pdf" 
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setReviewFile(e.target.files[0]);
                                                    }
                                                }}
                                                className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border border-gray-100 rounded-lg p-1"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="mt-4 border-t border-gray-100 pt-4">
                                        <label className="block text-xs font-bold text-gray-700 mb-2">Riwayat Versi Dokumen</label>
                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                            {history.length > 0 ? history.map(item => (
                                                <div key={item.id} className="p-2 border border-gray-100 rounded-lg text-[10px] flex justify-between items-center bg-gray-50">
                                                    <div>
                                                        <span className="font-bold text-gray-700">Versi {item.versi} {item.id === reviewingTask.id ? "(Saat ini)" : ""}</span>
                                                        <span className="text-gray-400 block">{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                                                    </div>
                                                    {item.fileMahasiswa && (
                                                        <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="p-1.5 text-blue-600 bg-blue-50 rounded-lg">
                                                            <Download className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            )) : (
                                                <div className="text-center text-[10px] text-gray-400 italic">Riwayat tidak tersedia</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!(reviewStatus === 'APPROVED' && reviewingTask.status === 'APPROVED') && (
                            <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2 shrink-0 z-20">
                                <button 
                                    onClick={() => setReviewingTask(null)}
                                    className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button 
                                    onClick={handleReviewSubmit}
                                    disabled={uploadingReview}
                                    className="flex-1 py-2.5 text-xs font-bold text-white bg-[#D25026] hover:bg-[#B9441F] active:scale-95 transition-all rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
                                >
                                    {uploadingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    Kirim
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
