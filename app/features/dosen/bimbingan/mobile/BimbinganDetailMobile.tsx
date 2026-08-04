import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { FileText, Send, Loader2, BookOpen, ChevronLeft, AlertCircle, FileStack, Download, Eye, Clock, Trophy, Edit, Check, Users } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
import { MonthYearFilter } from "~/components/ui/calendar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgressStats } from "../../../mahasiswa/profilemahasiswa/components/progress-stats";
import { BadgeWall } from "../../../mahasiswa/profilemahasiswa/components/badge-wall";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";
import { useAuth } from "~/hooks/useAuth";
import { io } from "socket.io-client";

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

const parseCatatan = (catatan: string) => {
    if (!catatan) return { nilai: null, text: "" };
    const match = catatan.match(/^\[NILAI:\s*(\d+)\]\s*(.*)$/s);
    if (match) {
        return { nilai: parseInt(match[1]), text: match[2] };
    }
    return { nilai: null, text: catatan };
};

export function BimbinganDetailMobile() {
    const { id: nim } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const student = location.state?.student;

    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{ [key: string]: string }>({});
    const [selectedSchedules, setSelectedSchedules] = useState<{ [key: string]: string }>({});
    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [inputGrades, setInputGrades] = useState<{ [key: number]: string }>({});
    const [savingGradeId, setSavingGradeId] = useState<number | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    // Detail View State
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat" | "grafik" | "portfolio">("aktif");
    const [studentActiveTask, setStudentActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const [allStudentTasks, setAllStudentTasks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    const { user } = useAuth();

    // Real-time updates
    useEffect(() => {
        if (!user || !student) return;
        const socket = io(UPLOADS_URL);
        socket.emit("join", user.id);
        
        socket.on("bimbingan_submitted", () => {
            fetchStudentTasks(student.mahasiswa.nim);
            showToast("Mahasiswa telah mengumpulkan draf/revisi!", "success");
        });

        return () => {
            socket.disconnect();
        };
    }, [user, student]);

    const fetchStudentTasks = async (mahasiswaId: string) => {
        setLoading(true);
        try {
            const tasks = await bimbinganApi.getBimbinganByMahasiswa(mahasiswaId);
            setAllStudentTasks(tasks);
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
                // Pre-fill schedule with the previous task's deadline if available
                if (completed.length > 0 && completed[0].jadwalBimbingan) {
                    setSelectedSchedules(prev => {
                        if (!prev[mahasiswaId]) {
                            return { ...prev, [mahasiswaId]: completed[0].jadwalBimbingan };
                        }
                        return prev;
                    });
                }
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
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (nim) {
            fetchStudentTasks(nim);
        }
    }, [nim]);

    if (!student) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-600 font-medium">Data mahasiswa tidak ditemukan.</p>
                <button
                    onClick={() => navigate('/dosen/bimbingan')}
                    className="px-4 py-2 bg-[#119DA4] text-white rounded-lg font-bold"
                >
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    const handleAssign = async (mahasiswaId: string) => {
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
            setSelectedTasks(prev => { const next = { ...prev }; delete next[mahasiswaId]; return next; });
            setSelectedSchedules(prev => { const next = { ...prev }; delete next[mahasiswaId]; return next; });
            setIsEditingTask(false);
            if (nim) fetchStudentTasks(nim);
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

    const handleOpenReview = (task: any, isReadOnly: boolean = false) => {
        navigate(`/dosen/bimbingan/${task.mahasiswaNim}/review/${task.id}`);
    };

    const handleSaveGrade = async (task: any) => {
        const gradeVal = inputGrades[task.id];
        const parsedGrade = gradeVal === "" || gradeVal === undefined ? null : parseInt(gradeVal);
        if (parsedGrade !== null && (parsedGrade < 0 || parsedGrade > 100 || isNaN(parsedGrade))) {
            showToast("Nilai bimbingan harus berada di rentang 0 - 100", "destructive");
            return;
        }

        setSavingGradeId(task.id);
        try {
            const parsed = parseCatatan(task.catatan);
            const newCatatan = parsedGrade !== null ? `[NILAI: ${parsedGrade}] ${parsed.text}` : parsed.text;
            await bimbinganApi.uploadRevisiDosen(task.id, null, 'APPROVED', newCatatan);
            showToast("Nilai berhasil disimpan!", "success");
            setEditingTaskId(null);
            if (nim) fetchStudentTasks(nim);
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan nilai", "destructive");
        } finally {
            setSavingGradeId(null);
        }
    };

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
                    onClick={() => navigate('/dosen/bimbingan')}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-gray-900 line-clamp-1">Bimbingan: {student.mahasiswa.nama}</h1>
                <button
                    onClick={() => setProfileModalOpen(true)}
                    className="ml-auto p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100"
                    title="Lihat Profil"
                >
                    <Users className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col min-h-[calc(100vh-60px)]">
                <div className="bg-white px-4 border-b border-gray-200 flex items-center overflow-x-auto scrollbar-hide shrink-0">
                    <div className="flex space-x-2 shrink-0 border-r border-gray-200 pr-4 mr-4">
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
                            Grafik
                        </button>
                        <button
                            onClick={() => setActiveTab("portfolio")}
                            className={`py-3 text-sm whitespace-nowrap px-2 font-bold border-b-2 transition-colors flex-1 text-center ${activeTab === 'portfolio' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Portfolio
                        </button>
                        <button
                            onClick={() => setActiveTab("riwayat")}
                            className={`py-3 text-sm whitespace-nowrap px-2 font-bold border-b-2 transition-colors flex-1 text-center ${activeTab === 'riwayat' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Lulus
                        </button>
                    </div>

                    {/* Completed Tasks Mini Cards (Mobile) */}
                    <div className="flex items-center gap-2 shrink-0 py-2">
                        {completedTasks.length > 0 ? (
                            completedTasks.map((task: any) => (
                                <div key={task.id} className="w-[120px] px-3 py-1.5 bg-white border border-green-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] rounded-lg flex flex-col justify-center border-t-2 border-t-green-500 shrink-0">
                                    <div className="text-[8px] font-bold text-green-700 uppercase mb-0.5">Selesai (ACC)</div>
                                    <div className="text-[11px] font-bold text-gray-800 truncate" title={task.topik}>{task.topik}</div>
                                    <div className="text-[9px] text-gray-500 mt-0.5">{new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                            ))
                        ) : (
                            <span className="text-[10px] text-gray-400 italic shrink-0 pr-2">Belum ada riwayat ACC</span>
                        )}
                    </div>
                </div>

                <div className="p-4 flex-1">
                    {loading ? (
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
                                                        {new Date(studentActiveTask.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                                    <span className="font-bold text-gray-900">{studentActiveTask.jadwalBimbingan ? new Date(studentActiveTask.jadwalBimbingan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</span>
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
                                                            setSelectedTasks(prev => ({ ...prev, [student.mahasiswa.nim]: studentActiveTask.topik }));
                                                            if (studentActiveTask.jadwalBimbingan) {
                                                                setSelectedSchedules(prev => ({ ...prev, [student.mahasiswa.nim]: studentActiveTask.jadwalBimbingan }));
                                                            }
                                                            setIsEditingTask(true);
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
                                                    <button
                                                        onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                                        className="w-full text-left focus:outline-none"
                                                    >
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
                                                    </button>
                                                    {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                        <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="mt-2 text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 w-max bg-blue-50 px-2 py-1 rounded">
                                                            <Download className="w-3 h-3" /> Unduh PDF
                                                        </a>
                                                    )}

                                                    {/* Annotation History Accordion Mobile */}
                                                    {expandedHistoryId === item.id && item.anotasi && item.anotasi.length > 0 && (
                                                        <div className="mt-3 space-y-2 pt-3 border-t border-gray-100">
                                                            <div className="text-[10px] font-bold text-gray-700 flex items-center justify-between">
                                                                <span>Riwayat Anotasi:</span>
                                                                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[9px]">{item.anotasi.length} catatan</span>
                                                            </div>
                                                            {item.anotasi.map((ann: any, idx: number) => {
                                                                const pos = typeof ann.posisi === 'string' ? JSON.parse(ann.posisi) : (ann.posisi || {});
                                                                const quote = pos.content?.text;
                                                                const pageNum = pos.position?.pageNumber;

                                                                return (
                                                                    <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-orange-100 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-400 before:rounded-r-md">
                                                                        {pageNum && (
                                                                            <div className="inline-block px-1.5 py-0.5 bg-white text-orange-800 rounded text-[9px] font-bold mb-1 border border-orange-100">
                                                                                Hal {pageNum}
                                                                            </div>
                                                                        )}
                                                                        {quote && (
                                                                            <div className="pl-2 border-l-2 border-orange-200 mb-1.5">
                                                                                <p className="text-[9px] text-gray-500 italic line-clamp-2">"{quote}"</p>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-[10px] text-gray-800 font-medium leading-relaxed">{ann.komentar}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    {expandedHistoryId === item.id && (!item.anotasi || item.anotasi.length === 0) && (
                                                        <div className="mt-2 pt-2 border-t border-gray-100">
                                                            <p className="text-[10px] text-gray-400 italic text-center">Tidak ada anotasi.</p>
                                                        </div>
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
                                                setSelectedTasks(prev => { const next = { ...prev }; delete next[student.mahasiswa.nim]; return next; });
                                                setSelectedSchedules(prev => { const next = { ...prev }; delete next[student.mahasiswa.nim]; return next; });
                                            }} className="text-[10px] text-blue-600 hover:underline font-bold">Batalkan Edit</button>
                                        )}
                                    </div>
                                    <div className="relative z-[200]">
                                        <label className="block text-[10px] font-bold text-gray-700 mb-1">Pilih Bab Target</label>
                                        <CustomSelect
                                            options={taskOptions.map(opt => ({
                                                ...opt,
                                                disabled: completedTasks.some(t => t.topik === opt.value) || studentActiveTask?.topik === opt.value
                                            }))}
                                            value={selectedTasks[student.mahasiswa.nim] || ""}
                                            onChange={(val) => setSelectedTasks(prev => ({ ...prev, [student.mahasiswa.nim]: val }))}
                                            placeholder="Pilih Bab"
                                            className="h-10 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 mb-1">Batas Waktu</label>
                                        <div className="flex flex-col gap-2 relative z-[150]">
                                            <MonthYearFilter
                                                date={selectedSchedules[student.mahasiswa.nim] ? new Date(selectedSchedules[student.mahasiswa.nim]) : undefined}
                                                minDate={new Date()}
                                                maxDate={new Date(new Date().getFullYear(), 11, 31)}
                                                setDate={(d) => {
                                                    if (d) {
                                                        const existingDate = selectedSchedules[student.mahasiswa.nim] ? new Date(selectedSchedules[student.mahasiswa.nim]) : null;
                                                        const hours = existingDate ? existingDate.getHours() : 23;
                                                        const minutes = existingDate ? existingDate.getMinutes() : 59;
                                                        d.setHours(hours, minutes);
                                                        setSelectedSchedules(prev => ({ ...prev, [student.mahasiswa.nim]: d.toISOString() }));
                                                    } else {
                                                        setSelectedSchedules(prev => { const next = { ...prev }; delete next[student.mahasiswa.nim]; return next; });
                                                    }
                                                }}
                                            />
                                            <div className="flex mt-1 w-full">
                                                <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between transition-colors hover:bg-gray-50 focus-within:border-[#119DA4] focus-within:ring-1 focus-within:ring-[#119DA4]">
                                                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Jam</label>
                                                    <input
                                                        type="time"
                                                        className="px-2 py-1 text-sm font-bold bg-transparent outline-none text-gray-800"
                                                        value={(() => {
                                                            if (!selectedSchedules[student.mahasiswa.nim]) return "23:59";
                                                            const d = new Date(selectedSchedules[student.mahasiswa.nim]);
                                                            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                                        })()}
                                                        onChange={(e) => {
                                                            const d = selectedSchedules[student.mahasiswa.nim] ? new Date(selectedSchedules[student.mahasiswa.nim]) : new Date();
                                                            if (e.target.value) {
                                                                const [hh, mm] = e.target.value.split(":");
                                                                d.setHours(parseInt(hh), parseInt(mm));
                                                                setSelectedSchedules(prev => ({ ...prev, [student.mahasiswa.nim]: d.toISOString() }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(student.mahasiswa.nim)}
                                        disabled={assigningId === student.mahasiswa.nim || !selectedTasks[student.mahasiswa.nim] || !selectedSchedules[student.mahasiswa.nim]}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#119DA4] active:bg-[#0b6b70] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm mt-2"
                                    >
                                        {assigningId === student.mahasiswa.nim ? (
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
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                    ) : activeTab === 'portfolio' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                            <div className="bg-white rounded-[2rem] overflow-hidden scale-[0.9] sm:scale-100 origin-top -mt-2 shadow-sm border border-gray-100">
                                <ProgressStats bimbinganTasks={allStudentTasks} />
                            </div>
                            <div className="bg-white rounded-[2rem] overflow-hidden scale-[0.9] sm:scale-100 origin-top -mt-8 shadow-sm border border-gray-100">
                                <BadgeWall bimbinganTasks={allStudentTasks} />
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mx-2">
                                <h4 className="font-bold text-blue-900 text-xs mb-1.5 flex items-center gap-2">
                                    <Trophy className="w-3.5 h-3.5" /> Info Portfolio
                                </h4>
                                <p className="text-[10px] text-blue-700 leading-relaxed">
                                    Data ini sinkron dengan profil mahasiswa. Badge pencapaian diberikan otomatis oleh sistem berdasarkan kedisiplinan pengumpulan draf.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {completedTasks.length === 0 ? (
                                <div className="py-12 text-center border border-gray-200 border-dashed rounded-xl flex flex-col items-center bg-gray-50/50">
                                    <BookOpen className="w-10 h-10 text-gray-300 mb-2" />
                                    <h3 className="text-xs font-bold text-gray-800 mb-1">Belum ada Bab Disetujui</h3>
                                </div>
                            ) : (
                                completedTasks.map(task => {
                                    const parsed = parseCatatan(task.catatan);
                                    const isEditing = editingTaskId === task.id;

                                    return (
                                        <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                                            <div className="h-1.5 w-full bg-green-500"></div>
                                            <div className="p-4 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded text-center block max-w-fit">SELESAI (ACC)</span>

                                                        {!isEditing && (
                                                            parsed.nilai !== null ? (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full shadow-sm">
                                                                    Nilai: {parsed.nilai}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-medium px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">
                                                                    Belum Dinilai
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                    <h3 className="text-xs font-bold text-gray-900 mb-1 leading-tight">{task.topik}</h3>
                                                    <p className="text-[10px] text-gray-500 mb-3">
                                                        Disetujui: {new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                <div className="border-t border-gray-100 pt-3 mt-1 mb-3">
                                                    {isEditing ? (
                                                        <div className="space-y-2 animate-in fade-in duration-200">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    value={inputGrades[task.id] !== undefined ? inputGrades[task.id] : (parsed.nilai !== null ? String(parsed.nilai) : "")}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setInputGrades(prev => ({ ...prev, [task.id]: val }));
                                                                    }}
                                                                    placeholder="Skor 0-100"
                                                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#119DA4] focus:ring-1 focus:ring-[#119DA4]"
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveGrade(task)}
                                                                    disabled={savingGradeId === task.id}
                                                                    className="px-3 py-1.5 bg-[#119DA4] hover:bg-[#0d7a7f] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                                                                >
                                                                    {savingGradeId === task.id ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    ) : (
                                                                        <Check className="w-3.5 h-3.5" />
                                                                    )}
                                                                    Simpan
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingTaskId(null)}
                                                                    className="px-2 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    Batal
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Penilaian</span>
                                                            <button
                                                                onClick={() => {
                                                                    setInputGrades(prev => ({
                                                                        ...prev,
                                                                        [task.id]: parsed.nilai !== null ? String(parsed.nilai) : ""
                                                                    }));
                                                                    setEditingTaskId(task.id);
                                                                }}
                                                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#119DA4] hover:text-[#0d7a7f] transition-colors"
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                                {parsed.nilai !== null ? "Ubah Nilai" : "Beri Nilai"}
                                                            </button>
                                                        </div>
                                                    )}
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
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            <PublicProfileModal
                userId={student.mahasiswa.userId}
                open={profileModalOpen}
                onOpenChange={setProfileModalOpen}
            />
        </div>
    );
}
