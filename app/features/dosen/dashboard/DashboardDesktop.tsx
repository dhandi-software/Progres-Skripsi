import { useState, useEffect } from "react";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import { chatService } from "~/services/chatService";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Users as UsersIcon, 
    BookOpen, 
    Calendar,
    MessageSquare
} from "lucide-react";

export function DashboardDesktop({ title }: { title: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeBimbinganCount, setActiveBimbinganCount] = useState(0);
    const [thisWeekScheduleCount, setThisWeekScheduleCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                let allActs: any[] = [];
                // Pengajuan
                const pengajuanData = await pengajuanApi.getPengajuanByDosen();
                if (pengajuanData && Array.isArray(pengajuanData)) {
                    allActs = pengajuanData.map(p => ({
                        type: 'pengajuan',
                        status: p.status,
                        nama: p.mahasiswa?.nama || "Mahasiswa",
                        judul: p.judul,
                        tanggal: p.tanggal,
                        raw: p
                    }));
                }

                // Chat
                if (user?.id) {
                    const chatData = await chatService.getUnreadCount(user.id);
                    setUnreadMessages(chatData.count || 0);
                }

                // Bimbingan
                const bimbinganData = await bimbinganApi.getDosenBimbinganStudents();
                if (bimbinganData && Array.isArray(bimbinganData)) {
                    setActiveBimbinganCount(bimbinganData.length);
                    // Calculate "Jadwal Minggu Ini"
                    let scheduleCount = 0;
                    const now = new Date();
                    const oneWeekLater = new Date();
                    oneWeekLater.setDate(now.getDate() + 7);
                    
                    bimbinganData.forEach((student: any) => {
                        const bimbinganList = student.mahasiswa?.bimbingan || [];
                        if (bimbinganList.length > 0) {
                            const activeTask = bimbinganList[0];
                            if (activeTask.jadwalBimbingan && activeTask.status !== 'APPROVED') {
                                const jadwal = new Date(activeTask.jadwalBimbingan);
                                if (jadwal >= now && jadwal <= oneWeekLater) {
                                    scheduleCount++;
                                }
                            }
                            if (activeTask.status === 'SUBMITTED') {
                                allActs.push({
                                    type: 'bimbingan',
                                    status: activeTask.status,
                                    nama: student.mahasiswa?.nama || "Mahasiswa",
                                    judul: `Telah mengupload tugas/revisi Bimbingan: ${activeTask.topik}`,
                                    tanggal: activeTask.tanggal,
                                    raw: activeTask
                                });
                            }
                        }
                    });
                    setThisWeekScheduleCount(scheduleCount);
                }
                const sortedActs = allActs.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
                setActivities(sortedActs);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.id]);

    const getIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return CheckCircle;
            case 'PENDING': return Clock;
            default: return FileText;
        }
    };

    const getIconColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return "text-green-500";
            case 'PENDING': return "text-blue-500";
            default: return "text-red-500";
        }
    };

    const getStatusText = (status: string, type: string) => {
        if (type === 'bimbingan') return "Menunggu Penilaian";
        switch (status) {
            case 'APPROVED': return "Telah Disetujui";
            case 'PENDING': return "Menunggu Peninjauan";
            default: return "Usulan Ditolak";
        }
    };

    const pendingCount = activities.filter(a => a.type === 'pengajuan' && a.status === 'PENDING').length;
    const statsConfig = [
        {
            title: "Menunggu Peninjauan",
            value: `${pendingCount} Usulan`,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Bimbingan Aktif",
            value: `${activeBimbinganCount} Mhs`,
            icon: UsersIcon,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            title: "Jadwal 7 Hari Kedepan",
            value: `${thisWeekScheduleCount} Sesi`,
            icon: Calendar,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            title: "Pesan Masuk",
            value: `${unreadMessages} Baru`,
            icon: MessageSquare,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-8 font-geist overflow-y-auto max-h-screen">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#119DA4] to-[#0D7C82] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        Selamat Datang, {user?.name?.split(' ')[0] || "Dosen"}!
                    </h1>
                    <p className="text-white/80 text-lg w-full ">
                        Kelola peninjauan judul Kerja Praktik, jadwal bimbingan mahasiswa, dan pantau progres akademik secara efisien.
                    </p>
                </div>
                {/* Decorative overlay */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12" />
                <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsConfig.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon
                                    className={`w-6 h-6 ${stat.color}`}
                                />
                            </div>
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Update Terbaru
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">
                            {stat.title}
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-10">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            Aktivitas Terkini
                        </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-6 text-center text-gray-400 text-sm">Memuat aktivitas...</div>
                        ) : activities.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">Belum ada aktivitas pengajuan.</div>
                        ) : (
                            activities.slice(0, 5).map((item, i) => {
                                const Icon = getIcon(item.status);
                                return (
                                <div key={i} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="mt-1">
                                        <Icon className={`w-5 h-5 ${getIconColor(item.status)}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                            {item.type === 'bimbingan' ? `Bimbingan Draf - ${item.nama}` : `Pengajuan Judul - ${item.nama}`}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.judul}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />{" "}
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                                            <span className="mx-1">•</span>
                                            {getStatusText(item.status, item.type)}
                                        </span>
                                    </div>
                                </div>
                            )})
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                            Aksi Cepat
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => navigate("/dosen/peninjauan")}
                                className="w-full py-3 px-4 bg-[#119DA4] hover:bg-[#0e868c] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#119DA4]/20 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Tinjau Pengajuan
                            </button>
                            <button
                                onClick={() => navigate("/dosen/bimbingan")}
                                className="w-full py-3 px-4 bg-white border-2 border-[#119DA4] text-[#119DA4] hover:bg-[#119DA4]/5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <UsersIcon className="w-5 h-5" />
                                Daftar Bimbingan
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#FFF0EB] rounded-3xl p-6 border border-[#FFDccf]">
                        <h3 className="font-bold text-[#D25026] mb-2">
                            Pusat Pesan
                        </h3>
                        <p className="text-sm text-[#D25026]/80 mb-4">
                            Kelola komunikasi dengan mahasiswa bimbingan secara real-time.
                        </p>
                        <button
                            onClick={() => navigate("/dosen/chat")}
                            className="text-sm font-semibold text-[#D25026] hover:underline"
                        >
                            Buka Chat &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
