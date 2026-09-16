import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { useAuth } from "~/hooks/useAuth";
import { io } from "socket.io-client";
import type { ChartDataPoint, ToastPropsState } from "~/features/dosen/bimbingan/types/bimbinganDetail";

export const TASK_OPTIONS = [
    { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
    { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
    { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
    { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
    { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
    { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
];

export const getStatusPengajuan = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return 'Belum Mengumpulkan';
        case 'SUBMITTED': return 'Sudah Mengumpulkan';
        case 'REVISION': return 'Perlu Perbaikan';
        case 'APPROVED': return 'Selesai (ACC)';
        default: return '-';
    }
};

export const getStatusPenilaian = (status: string) => {
    switch (status) {
        case 'ASSIGNED': return '-';
        case 'SUBMITTED': return 'Menunggu Reviu';
        case 'REVISION': return 'Perlu Revisi';
        case 'APPROVED': return 'Disetujui';
        default: return '-';
    }
};

export const getTimeRemaining = (deadline?: string) => {
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

export const parseCatatan = (catatan?: string) => {
    if (!catatan) return { nilai: null, text: "" };
    const match = catatan.match(/^\[NILAI:\s*(\d+)\]\s*(.*)$/s);
    if (match) {
        return { nilai: parseInt(match[1]), text: match[2] };
    }
    return { nilai: null, text: catatan };
};

export function useBimbinganDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const selectedStudent = location.state?.student;
    const studentNim = selectedStudent?.mahasiswa?.nim || params.id;

    const { user } = useAuth();

    const [toastProps, setToastProps] = useState<ToastPropsState | null>(null);
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat" | "grafik" | "portfolio">("aktif");

    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{ [key: string]: string }>({});
    const [selectedSchedules, setSelectedSchedules] = useState<{ [key: string]: string }>({});
    const [isEditingTask, setIsEditingTask] = useState(false);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [inputGrades, setInputGrades] = useState<{ [key: number]: string }>({});
    const [savingGradeId, setSavingGradeId] = useState<number | null>(null);

    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const [studentActiveTask, setStudentActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [allStudentTasks, setAllStudentTasks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

    const showToast = useCallback((title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    }, []);

    const fetchStudentTasks = useCallback(async (mahasiswaNim: string) => {
        setStudentLoading(true);
        try {
            const tasks = await bimbinganApi.getBimbinganByMahasiswa(mahasiswaNim);
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
                if (completed.length > 0 && completed[0].jadwalBimbingan) {
                    setSelectedSchedules(prev => {
                        if (!prev[mahasiswaNim]) {
                            return { ...prev, [mahasiswaNim]: completed[0].jadwalBimbingan };
                        }
                        return prev;
                    });
                }
            }

            const groupedByTopic = tasks.reduce((acc: any, task: any) => {
                if (!acc[task.topik]) acc[task.topik] = [];
                acc[task.topik].push(task);
                return acc;
            }, {});

            const newChartData: ChartDataPoint[] = [];
            newChartData.push({
                name: "Mulai",
                score: 0,
                fullTopic: "Mulai Bimbingan",
                diffDays: 0,
                isSubmitted: false,
                statusText: "Belum Mulai"
            });

            TASK_OPTIONS.forEach(opt => {
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
            setStudentLoading(false);
        }
    }, []);

    useEffect(() => {
        if (studentNim) {
            fetchStudentTasks(studentNim);
        }
    }, [studentNim, fetchStudentTasks]);

    useEffect(() => {
        if (!user || !studentNim) return;
        const socket = io(UPLOADS_URL);
        socket.emit("join", user.id);
        
        socket.on("bimbingan_submitted", () => {
            fetchStudentTasks(studentNim);
            showToast("Mahasiswa telah mengumpulkan draf/revisi!", "success");
        });

        return () => {
            socket.disconnect();
        };
    }, [user, studentNim, fetchStudentTasks, showToast]);

    const handleAssign = async (mahasiswaId: string) => {
        const task = selectedTasks[mahasiswaId];
        const schedule = selectedSchedules[mahasiswaId];
        if (!task) {
            showToast("Silakan pilih target bab terlebih dahulu", "destructive");
            return;
        }
        if (!schedule) {
            showToast("Silakan tentukan jadwal (tenggat waktu) bimbingan", "destructive");
            return;
        }

        setAssigningId(mahasiswaId);
        try {
            if (isEditingTask && studentActiveTask) {
                await bimbinganApi.editBimbinganTask(studentActiveTask.id, task, new Date(schedule));
                showToast("Target progres berhasil diperbarui!", "success");
            } else {
                await bimbinganApi.assignBimbinganTask(mahasiswaId, task, new Date(schedule));
                showToast("Target progres berhasil diberikan!", "success");
            }
            
            if (studentNim) {
                fetchStudentTasks(studentNim);
            }
            setSelectedTasks(prev => ({ ...prev, [mahasiswaId]: "" }));
            setSelectedSchedules(prev => ({ ...prev, [mahasiswaId]: "" }));
            setIsEditingTask(false);
        } catch (error) {
            console.error("Failed to assign:", error);
            showToast(isEditingTask ? "Gagal memperbarui target" : "Gagal memberikan target", "destructive");
        } finally {
            setAssigningId(null);
        }
    };

    const handleOpenReview = (task: any, isReadOnly: boolean = false) => {
        navigate(`/dosen/bimbingan/${task.mahasiswaNim}/review/${task.id}`, { state: { isReadOnly } });
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
            if (studentNim) {
                fetchStudentTasks(studentNim);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan nilai", "destructive");
        } finally {
            setSavingGradeId(null);
        }
    };

    const isAllTasksCompleted = TASK_OPTIONS.every(opt => completedTasks.some(t => t.topik === opt.value));

    return {
        navigate,
        selectedStudent,
        studentNim,
        toastProps,
        setToastProps,
        showToast,
        activeTab,
        setActiveTab,
        assigningId,
        selectedTasks,
        setSelectedTasks,
        selectedSchedules,
        setSelectedSchedules,
        isEditingTask,
        setIsEditingTask,
        editingTaskId,
        setEditingTaskId,
        inputGrades,
        setInputGrades,
        savingGradeId,
        profileModalOpen,
        setProfileModalOpen,
        studentActiveTask,
        completedTasks,
        studentLoading,
        chartData,
        allStudentTasks,
        history,
        expandedHistoryId,
        setExpandedHistoryId,
        fetchStudentTasks,
        handleAssign,
        handleOpenReview,
        handleSaveGrade,
        isAllTasksCompleted,
        taskOptions: TASK_OPTIONS,
        getStatusPengajuan,
        getStatusPenilaian,
        getTimeRemaining,
        parseCatatan
    };
}
