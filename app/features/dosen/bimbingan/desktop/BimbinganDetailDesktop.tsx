import { useState, useEffect } from "react";
import { bimbinganApi } from "~/api/bimbinganApi";
import { UPLOADS_URL } from "~/api/client";
import { Users, FileText, Send, Loader2, BookOpen, AlertCircle, FileStack, Download, Eye, Clock, Trophy, Edit, Check } from "lucide-react";
import { CustomSelect } from "~/components/ui/custom-select";
import { Toast } from "~/components/ui/toast";
import { MonthYearFilter } from "~/components/ui/calendar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProgressStats } from "../../../mahasiswa/profilemahasiswa/components/progress-stats";
import { BadgeWall } from "../../../mahasiswa/profilemahasiswa/components/badge-wall";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";
import { useNavigate, useLocation, useParams } from "react-router";

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

const TASK_OPTIONS = [
    { label: "Bab 1: Pendahuluan", value: "Bab 1: Pendahuluan" },
    { label: "Bab 2: Tinjauan Pustaka", value: "Bab 2: Tinjauan Pustaka" },
    { label: "Bab 3: Metodologi", value: "Bab 3: Metodologi" },
    { label: "Bab 4: Hasil dan Pembahasan", value: "Bab 4: Hasil dan Pembahasan" },
    { label: "Bab 5: Kesimpulan dan Saran", value: "Bab 5: Kesimpulan dan Saran" },
    { label: "Laporan Akhir (Finalisasi)", value: "Laporan Akhir (Finalisasi)" },
];

export function BimbinganDetailDesktop() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>(); 

    const selectedStudent = location.state?.student;

    const [toastProps, setToastProps] = useState<{ title: string, variant?: "success" | "destructive" | "default" } | null>(null);
    const [activeTab, setActiveTab] = useState<"aktif" | "riwayat" | "grafik" | "portfolio">("aktif");
    
    // Assignment form state
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<{ [key: string]: string }>({});
    const [selectedSchedules, setSelectedSchedules] = useState<{ [key: string]: string }>({});
    const [isEditingTask, setIsEditingTask] = useState(false);
    
    // Grades state
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [inputGrades, setInputGrades] = useState<{ [key: number]: string }>({});
    const [savingGradeId, setSavingGradeId] = useState<number | null>(null);

    // Profile modal
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    // Bimbingan task state
    const [studentActiveTask, setStudentActiveTask] = useState<any>(null);
    const [completedTasks, setCompletedTasks] = useState<any[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [chartData, setChartData] = useState<any[]>([]);
    const [allStudentTasks, setAllStudentTasks] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);

    const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
        setToastProps({ title, variant });
    };

    useEffect(() => {
        if (!selectedStudent) {
            navigate("/dosen/bimbingan");
            return;
        }
        // Fetch initially
        fetchStudentTasks(selectedStudent.mahasiswa.nim);
    }, [selectedStudent]);

    const fetchStudentTasks = async (mahasiswaNim: string) => {
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
                // Pre-fill schedule with the previous task's deadline if available
                if (completed.length > 0 && completed[0].jadwalBimbingan) {
                    setSelectedSchedules(prev => {
                        if (!prev[mahasiswaNim]) {
                            return { ...prev, [mahasiswaNim]: completed[0].jadwalBimbingan };
                        }
                        return prev;
                    });
                }
            }

            // Generate Chart Data for Timeliness
            const taskOptionsList = TASK_OPTIONS;

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
            
            if (selectedStudent) {
                fetchStudentTasks(selectedStudent.mahasiswa.nim);
            }
            // Clear selection
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
            if (selectedStudent) {
                fetchStudentTasks(selectedStudent.mahasiswa.nim);
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal menyimpan nilai", "destructive");
        } finally {
            setSavingGradeId(null);
        }
    };

    if (!selectedStudent) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-geist relative pb-20">
            {toastProps && (
                <div className="fixed top-4 right-4 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-white relative">
                    <button
                        onClick={() => navigate("/dosen/bimbingan")}
                        className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors shrink-0"
                        title="Kembali ke daftar"
                    >
                        <span className="font-bold">&larr; Kembali</span>
                    </button>
                    <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Detail Bimbingan: {selectedStudent.mahasiswa.nama}</h2>
                            <button
                                onClick={() => setProfileModalOpen(true)}
                                className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-100 transition-colors flex items-center gap-1"
                                title="Lihat Profil"
                            >
                                <Users className="w-3.5 h-3.5" /> Profil
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{selectedStudent.mahasiswa.nim} — {selectedStudent.judul}</p>
                    </div>
                </div>

                <div className="bg-white px-8 border-b border-gray-200 flex justify-between items-center overflow-x-auto scroolbar-hide">
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setActiveTab("aktif")}
                            className={`py-4 text-sm whitespace-nowrap font-bold border-b-2 transition-colors ${activeTab === 'aktif' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Target Saat Ini
                        </button>
                        <button
                            onClick={() => setActiveTab("grafik")}
                            className={`py-4 text-sm whitespace-nowrap font-bold border-b-2 transition-colors ${activeTab === 'grafik' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Grafik Kedisiplinan
                        </button>
                        <button
                            onClick={() => setActiveTab("portfolio")}
                            className={`py-4 text-sm whitespace-nowrap font-bold border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Portfolio & Capaian
                        </button>
                        <button
                            onClick={() => setActiveTab("riwayat")}
                            className={`py-4 text-sm whitespace-nowrap font-bold border-b-2 transition-colors ${activeTab === 'riwayat' ? 'border-[#119DA4] text-[#119DA4]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Riwayat Selesai
                        </button>
                    </div>
                    
                    {/* Completed Tasks Mini Cards */}
                    <div className="flex items-center gap-2 shrink-0 py-2 ml-8 pl-6 border-l border-gray-100">
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => (
                                <div key={task.id} className="min-w-[130px] px-3 py-2 bg-white border border-green-200 shadow-sm rounded-lg flex flex-col justify-center border-t-2 border-t-green-500">
                                    <div className="text-[9px] font-bold text-green-700 uppercase mb-0.5">Selesai (ACC)</div>
                                    <div className="text-xs font-bold text-gray-800 truncate" title={task.topik}>{task.topik}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada riwayat ACC</span>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {studentLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-[#119DA4]" size={32} />
                        </div>
                    ) : activeTab === 'aktif' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="text-lg font-bold text-gray-800">Target Saat Ini</h3>

                                {studentActiveTask ? (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                        <div className="h-2 w-full bg-[#119DA4]"></div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center shrink-0">
                                                        <FileText className="w-6 h-6 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-bold text-gray-900">{studentActiveTask.topik}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold border border-blue-100">
                                                                Aktif
                                                            </span>
                                                            {new Date(studentActiveTask.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">Status & Waktu Pengumpulan</h4>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
                                                <table className="w-full text-sm text-left">
                                                    <tbody className="divide-y divide-gray-200">
                                                        <tr className="bg-gray-50/50">
                                                            <th className="py-3 px-4 font-bold text-gray-700 w-[40%] border-r border-gray-200">Status Pengajuan</th>
                                                            <td className="py-3 px-4 text-gray-900 bg-white font-medium">{getStatusPengajuan(studentActiveTask.status)}</td>
                                                        </tr>
                                                        <tr className="bg-gray-50/50">
                                                            <th className="py-3 px-4 font-bold text-gray-700 w-[40%] border-r border-gray-200">Penilaian</th>
                                                            <td className="py-3 px-4 text-gray-900 bg-white font-medium">{getStatusPenilaian(studentActiveTask.status)}</td>
                                                        </tr>
                                                        <tr className="bg-gray-50/50">
                                                            <th className="py-3 px-4 font-bold text-gray-700 w-[40%] border-r border-gray-200">Batas Waktu</th>
                                                            <td className="py-3 px-4 text-gray-900 bg-white font-medium">{studentActiveTask.jadwalBimbingan ? new Date(studentActiveTask.jadwalBimbingan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                                        </tr>
                                                        <tr className="bg-gray-50/50">
                                                            <th className="py-3 px-4 font-bold text-gray-700 w-[40%] border-r border-gray-200">Keterlambatan</th>
                                                            <td className={`py-3 px-4 bg-white font-bold ${getTimeRemaining(studentActiveTask.jadwalBimbingan).isLate ? 'text-red-600' : 'text-gray-900'}`}>
                                                                {getTimeRemaining(studentActiveTask.jadwalBimbingan).text}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* File Approval UI */}
                                            {(studentActiveTask.status === 'SUBMITTED' || studentActiveTask.status === 'REVISION') && (
                                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                                                    <h4 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-2">
                                                        <FileStack className="w-4 h-4" /> Dokumen Mahasiswa Memerlukan Reviu
                                                    </h4>
                                                    <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                                                        Mahasiswa telah mengumpulkan draf dengan keterangan: "{studentActiveTask.keteranganProgres}".<br />
                                                        Klik tombol di bawah ini untuk melihat dokumen aslinya dan memberikan anotasi reviu langsung di layar Anda.
                                                    </p>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleOpenReview(studentActiveTask)}
                                                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-blue-500/30 flex justify-center items-center gap-2"
                                                        >
                                                            <FileStack className="w-4 h-4" /> Periksa & Berikan Reviu
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {studentActiveTask.status !== 'APPROVED' && (
                                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center gap-3 mt-4">
                                                    <span className="text-sm text-gray-500 text-center italic">
                                                        {studentActiveTask.status === 'ASSIGNED'
                                                            ? "Menunggu mahasiswa mengunggah draf ke dalam sistem..."
                                                            : "Draf telah dikumpulkan/direviu. Anda masih bisa mengubah target bab/deadline jika diperlukan."}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTasks(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: studentActiveTask.topik }));
                                                            if (studentActiveTask.jadwalBimbingan) {
                                                                setSelectedSchedules(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: studentActiveTask.jadwalBimbingan }));
                                                            }
                                                            setIsEditingTask(true);
                                                        }}
                                                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Edit Target / Tenggat Waktu
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                                        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Target Aktif</h4>
                                        <p className="text-sm text-gray-500 mb-6 ">
                                            Mahasiswa ini telah menyelesaikan semua target sebelumnya. Silakan berikan target progres bab baru di form sebelah kanan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 sticky top-8 text-left">
                                    {studentActiveTask && !isEditingTask ? (
                                        <>
                                            <h3 className="font-bold text-gray-900 mb-4 text-base">Riwayat Versi Draf</h3>
                                            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px before:h-full before:w-0.5 before:bg-gray-100 pl-1">
                                                {history.length > 0 ? history.map((item, index) => (
                                                    <div key={item.id} className="relative flex items-start gap-4">
                                                        <div className={`w-6 h-6 rounded-full border-[3px] border-white shadow-sm shrink-0 z-10 flex items-center justify-center ${item.status === 'APPROVED' ? 'bg-green-500' : item.status === 'REVISION' ? 'bg-orange-500' : 'bg-[#119DA4]'}`}>
                                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                                        </div>
                                                        <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100 flex-1">
                                                            <button
                                                                onClick={() => setExpandedHistoryId(expandedHistoryId === item.id ? null : item.id)}
                                                                className="w-full text-left focus:outline-none"
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="font-bold text-gray-800 text-sm">Versi {item.versi}</div>
                                                                    <div className="text-[10px] text-gray-500 bg-white border border-gray-100 px-1.5 py-0.5 rounded-sm">{new Date(item.tanggal).toLocaleDateString('id-ID')}</div>
                                                                </div>
                                                                <p className="text-xs text-gray-500">
                                                                    {item.status === 'ASSIGNED' ? "Target diberikan oleh Anda" :
                                                                        item.status === 'SUBMITTED' ? "Draf diunggah mahasiswa" :
                                                                            item.status === 'REVISION' ? <span className="text-orange-600 font-medium">Anda memberikan revisi</span> :
                                                                                item.status === 'APPROVED' ? <span className="text-green-600 font-medium">Reviu disetujui ACC</span> : ""}
                                                                </p>
                                                            </button>
                                                            {item.fileMahasiswa && item.status !== 'ASSIGNED' && (
                                                                <a href={`${UPLOADS_URL}${item.fileMahasiswa}`} target="_blank" rel="noreferrer" className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 w-max bg-blue-50 px-2 py-1 rounded">
                                                                    <Download className="w-3 h-3" /> Unduh PDF
                                                                </a>
                                                            )}

                                                            {/* Annotation History Accordion */}
                                                            {expandedHistoryId === item.id && item.anotasi && item.anotasi.length > 0 && (
                                                                <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
                                                                    <div className="text-xs font-bold text-gray-700 flex items-center justify-between">
                                                                        <span>Riwayat Anotasi pada Versi Ini:</span>
                                                                        <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px]">{item.anotasi.length} catatan</span>
                                                                    </div>
                                                                    {item.anotasi.map((ann: any, idx: number) => {
                                                                        const pos = typeof ann.posisi === 'string' ? JSON.parse(ann.posisi) : (ann.posisi || {});
                                                                        const quote = pos.content?.text;
                                                                        const pageNum = pos.position?.pageNumber;

                                                                        return (
                                                                            <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-orange-100 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-orange-400 before:rounded-r-md">
                                                                                {pageNum && (
                                                                                    <div className="inline-block px-1.5 py-0.5 bg-orange-50 text-orange-800 rounded text-[9px] font-bold mb-1.5 border border-orange-100">
                                                                                        Halaman {pageNum}
                                                                                    </div>
                                                                                )}
                                                                                {quote && (
                                                                                    <div className="pl-2 border-l-2 border-orange-200 mb-2">
                                                                                        <p className="text-[10px] text-gray-500 italic line-clamp-2">"{quote}"</p>
                                                                                    </div>
                                                                                )}
                                                                                <p className="text-xs text-gray-800 font-medium leading-relaxed">{ann.komentar}</p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            {expandedHistoryId === item.id && (!item.anotasi || item.anotasi.length === 0) && (
                                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                                    <p className="text-xs text-gray-400 italic text-center">Tidak ada anotasi pada versi ini.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-xs text-gray-400 italic">Belum ada riwayat terekam</div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-4 mt-2">
                                                <h3 className="font-bold text-gray-900 text-base">{isEditingTask ? "Edit Target Saat Ini" : "Berikan Target Baru"}</h3>
                                                {isEditingTask && (
                                                    <button onClick={() => {
                                                        setIsEditingTask(false);
                                                        setSelectedTasks(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: "" }));
                                                        setSelectedSchedules(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: "" }));
                                                    }} className="text-xs text-blue-600 hover:underline font-bold">Batalkan Edit</button>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="relative z-[200]">
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Pilih Bab / Target Penugasan</label>
                                                    <CustomSelect
                                                        options={taskOptions.map(opt => ({
                                                            ...opt,
                                                            disabled: completedTasks.some(t => t.topik === opt.value) || studentActiveTask?.topik === opt.value
                                                        }))}
                                                        value={selectedTasks[selectedStudent.mahasiswa.nim] || ""}
                                                        onChange={(val) => setSelectedTasks(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: val }))}
                                                        placeholder="Pilih Bab"
                                                        className="h-10 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Batas Pengumpulan (Waktu)</label>
                                                    <div className="flex flex-col gap-2 relative z-50">
                                                        <MonthYearFilter
                                                            date={selectedSchedules[selectedStudent.mahasiswa.nim] ? new Date(selectedSchedules[selectedStudent.mahasiswa.nim]) : undefined}
                                                            minDate={new Date()}
                                                            maxDate={new Date(new Date().getFullYear(), 11, 31)}
                                                            setDate={(d) => {
                                                                if (d) {
                                                                    const existingDate = selectedSchedules[selectedStudent.mahasiswa.nim] ? new Date(selectedSchedules[selectedStudent.mahasiswa.nim]) : null;
                                                                    const hours = existingDate ? existingDate.getHours() : 23;
                                                                    const minutes = existingDate ? existingDate.getMinutes() : 59;
                                                                    d.setHours(hours, minutes);
                                                                    setSelectedSchedules(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: d.toISOString() }));
                                                                } else {
                                                                    setSelectedSchedules(prev => { const p = { ...prev }; delete p[selectedStudent.mahasiswa.nim]; return p; });
                                                                }
                                                            }}
                                                        />
                                                        <div className="flex mt-1 w-full max-w-[200px]">
                                                            <div className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between transition-colors hover:bg-gray-50 focus-within:border-[#119DA4] focus-within:ring-1 focus-within:ring-[#119DA4]">
                                                                <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Jam</label>
                                                                <input
                                                                    type="time"
                                                                    className="px-2 py-1 text-sm font-bold bg-transparent outline-none text-gray-800"
                                                                    value={(() => {
                                                                        if (!selectedSchedules[selectedStudent.mahasiswa.nim]) return "23:59";
                                                                        const d = new Date(selectedSchedules[selectedStudent.mahasiswa.nim]);
                                                                        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                                                                    })()}
                                                                    onChange={(e) => {
                                                                        const d = selectedSchedules[selectedStudent.mahasiswa.nim] ? new Date(selectedSchedules[selectedStudent.mahasiswa.nim]) : new Date();
                                                                        if (e.target.value) {
                                                                            const [hh, mm] = e.target.value.split(":");
                                                                            d.setHours(parseInt(hh), parseInt(mm));
                                                                            setSelectedSchedules(prev => ({ ...prev, [selectedStudent.mahasiswa.nim]: d.toISOString() }));
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssign(selectedStudent.mahasiswa.nim)}
                                                    disabled={assigningId === selectedStudent.mahasiswa.nim || !selectedTasks[selectedStudent.mahasiswa.nim] || !selectedSchedules[selectedStudent.mahasiswa.nim]}
                                                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#119DA4] hover:bg-[#0e868c] active:bg-[#0b6b70] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                                >
                                                    {assigningId === selectedStudent.mahasiswa.nim ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Send size={16} />
                                                    )}
                                                    {isEditingTask ? "Simpan Perubahan Target" : "Tugaskan Target Ini"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'grafik' ? (
                        <div className="bg-white border text-sm border-gray-200 rounded-2xl shadow-sm p-6 ">
                            {chartData.length > 0 ? (
                                <>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">Grafik Kedisiplinan</h3>
                                    <p className="text-xs text-gray-500 mb-6">Skor 100 = Tepat waktu. Skor menurun jika terlambat mengumpulkan draf.</p>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                                <defs>
                                                    <linearGradient id="colorScoreDesktopDetail" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 600 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                                    domain={[0, 100]}
                                                    ticks={[0, 25, 50, 75, 100]}
                                                />
                                                <Tooltip
                                                    content={({ active, payload }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                                                                    <p className="font-bold text-sm text-gray-900 mb-1">{data.fullTopic}</p>
                                                                    {data.statusText === 'Belum Mulai' ? (
                                                                        <p className="text-xs font-medium text-gray-500">Belum Ada Progres</p>
                                                                    ) : (
                                                                        <>
                                                                            <p className="text-xs font-medium text-[#f97316]">Skor: {data.score}</p>
                                                                            <p className="text-[10px] text-gray-500 mt-1 mb-1 font-semibold">{data.isApproved ? '✔ Disetujui Dosen' : data.isSubmitted ? '⏳ Sudah Submit (Menunggu ACC)' : '⏳ Sedang Dikerjakan (Belum Submit)'}</p>
                                                                            {data.diffDays > 0 ? (
                                                                                <p className="text-xs text-red-500">Terlambat {data.diffDays} hari</p>
                                                                            ) : (
                                                                                <p className="text-xs text-green-600">{data.isSubmitted ? 'Tepat Waktu / Lebih Awal' : 'Masih dalam tenggat waktu'}</p>
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
                                                    fill="url(#colorScoreDesktopDetail)"
                                                    strokeWidth={3}
                                                    dot={{ r: 5, fill: '#f97316', strokeWidth: 0, stroke: '#fff' }}
                                                    activeDot={{ r: 7, stroke: '#ffedd5', strokeWidth: 4, fill: '#f97316' }}
                                                    animationDuration={1500}
                                                />
                                                <ReferenceLine y={0} stroke="#E5E7EB" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada data kedisiplinan</h3>
                                    <p className="text-sm text-gray-500">Mahasiswa ini belum mengumpulkan draf apapun.</p>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'portfolio' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white rounded-3xl overflow-hidden">
                                <ProgressStats bimbinganTasks={allStudentTasks} />
                            </div>
                            <div className="bg-white rounded-3xl overflow-hidden">
                                <BadgeWall bimbinganTasks={allStudentTasks} />
                            </div>
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                    <Trophy className="w-4 h-4" /> Catatan Untuk Dosen
                                </h4>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    Sistem Badge dan Progress di atas didasarkan pada draf bimbingan yang telah dikumpulkan dan disetujui (ACC) dalam sistem.
                                    Badge <span className="font-bold">"Tepat Waktu"</span> akan hilang secara otomatis jika mahasiswa memiliki riwayat pengumpulan yang melewati tenggat waktu yang Anda berikan.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedTasks.length === 0 ? (
                                <div className="col-span-full py-16 text-center border border-gray-200 border-dashed rounded-2xl flex flex-col items-center bg-gray-50/50">
                                    <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                                    <h3 className="text-sm font-bold text-gray-800 mb-1">Belum ada Bab Disetujui</h3>
                                    <p className="text-gray-500 text-xs">
                                        Daftar target progres yang telah Anda ACC akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
                                completedTasks.map(task => {
                                    const parsed = parseCatatan(task.catatan);
                                    const isEditing = editingTaskId === task.id;

                                    return (
                                        <div key={task.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[200px]">
                                            <div className="h-2 w-full bg-green-500"></div>
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-md">SELESAI (ACC)</span>

                                                        {!isEditing && (
                                                            parsed.nilai !== null ? (
                                                                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full shadow-sm">
                                                                    Nilai: {parsed.nilai}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full">
                                                                    Belum Dinilai
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{task.topik}</h3>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Disetujui: {new Date(task.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                {/* Grading Form / Grade Action */}
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
                                                        <a href={`${UPLOADS_URL}${task.fileDosen}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold transition-colors">
                                                            <Download className="w-3.5 h-3.5" /> Draf Target (ACC)
                                                        </a>
                                                    )}
                                                    {task.fileMahasiswa?.toLowerCase().endsWith('.pdf') && (
                                                        <button onClick={() => handleOpenReview(task, true)} className="flex items-center justify-center p-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group" title="Lihat Anotasi">
                                                            <Eye className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
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

            {selectedStudent && (
                <PublicProfileModal
                    userId={selectedStudent.mahasiswa.userId}
                    open={profileModalOpen}
                    onOpenChange={setProfileModalOpen}
                />
            )}
        </div>
    );
}
