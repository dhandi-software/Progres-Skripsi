import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import { chatService } from "~/services/chatService";
import { jadwalKpApi } from "~/api/jadwalKpApi";
import type { JadwalKp } from "~/api/jadwalKpApi";
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Users as UsersIcon, 
    MessageSquare,
    BarChart3,
    TrendingUp,
    Calendar
} from "lucide-react";

export function DashboardMobile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllActivities, setShowAllActivities] = useState(false);
    const [upcomingJadwal, setUpcomingJadwal] = useState<JadwalKp[]>([]);

    const [activeBimbinganCount, setActiveBimbinganCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);
    
    const isDosenReguler = user?.jabatan?.toLowerCase().includes("reguler");
    const [prodiStats, setProdiStats] = useState({ totalStudents: 0, avgProgress: 0 });

    useEffect(() => {
        const fetchAll = async () => {
            try {
                if (isDosenReguler) {
                    const monitoringData = await bimbinganApi.getAllProdiBimbingan();
                    if (monitoringData && Array.isArray(monitoringData)) {
                        const totalStudents = monitoringData.reduce((acc, d) => acc + (d.totalStudents || 0), 0);
                        const avgProgress = Math.round(monitoringData.reduce((acc, d) => acc + (d.activeProgress || 0), 0) / (monitoringData.length || 1));
                        setProdiStats({ totalStudents, avgProgress });
                    }
                }

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
                    bimbinganData.forEach((student: any) => {
                        const bimbinganList = student.mahasiswa?.bimbingan || [];
                        if (bimbinganList.length > 0) {
                            const activeTask = bimbinganList[0];
                            if (activeTask.status === 'SUBMITTED' && !activeTask.isReadDosen) {
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
                }
                const sortedActs = allActs.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
                setActivities(sortedActs);

                // Jadwal KP
                const jadwalData = await jadwalKpApi.getAllJadwalKp();
                if (jadwalData && Array.isArray(jadwalData)) {
                    const now = new Date();
                    const upcoming = jadwalData.filter(j => new Date(j.tanggal) >= now && j.tipe === 'PENGARAHAN_KP').sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
                    setUpcomingJadwal(upcoming);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.id, isDosenReguler]);

    const getIconColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return "bg-green-500";
            case 'PENDING': return "bg-blue-500";
            default: return "bg-red-500";
        }
    };

    const getStatusText = (status: string, type: string) => {
        if (type === 'bimbingan') return "Koreksi";
        switch (status) {
            case 'APPROVED': return "Disetujui";
            case 'PENDING': return "Pending";
            default: return "Ditolak";
        }
    };

    const pendingCount = activities.filter(a => a.type === 'pengajuan' && a.status === 'PENDING').length;

    return (
        <div className="p-4 space-y-6 font-geist pb-20">
            {/* Welcome Banner Mobile */}
            <div className="rounded-2xl bg-[#119DA4] p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-1">
                    Hai, {user?.name?.split(' ')[0] || "Dosen"}!
                </h1>
                <p className="text-white/90 text-sm">
                    {isDosenReguler 
                        ? `Pantau ${prodiStats.totalStudents} mahasiswa aktif di Prodi.`
                        : `Tugas & Peninjauan Aktif: ${pendingCount} Usulan`}
                </p>
                <div className="mt-4 flex gap-2">
                    {isDosenReguler ? (
                        <button 
                             onClick={() => navigate("/dosen/prodi/bimbingan")}
                             className="flex-1 bg-white text-[#119DA4] py-2 rounded-lg text-sm font-bold shadow-sm"
                        >
                            Monitoring Bimbingan
                        </button>
                    ) : (
                        <>
                            <button 
                                 onClick={() => navigate("/dosen/peninjauan")}
                                 className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Tinjau KP
                            </button>
                            <button 
                                onClick={() => navigate("/dosen/bimbingan")}
                                className="flex-1 bg-white text-[#119DA4] py-2 rounded-lg text-sm font-bold shadow-sm"
                            >
                                Bimbingan
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Notification Banner for Upcoming Jadwal Mobile */}
            {upcomingJadwal.map((jadwal, index) => (
                <div key={`jadwal-${index}`} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-emerald-800 font-bold text-sm">{jadwal.judul}</h3>
                            <p className="text-emerald-600 text-[10px] mt-1 pr-2 leading-relaxed font-semibold">
                                Jadwal {jadwal.tipe === 'PENGARAHAN_KP' ? 'Pengarahan KP' : 'Pengumpulan Sidang'}: {new Date(jadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {jadwal.deskripsi && <p className="text-emerald-700 text-[10px] mt-2 pr-2 leading-relaxed italic">"{jadwal.deskripsi}"</p>}
                        </div>
                    </div>
                </div>
            ))}

            {/* Status Summary (Compact) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        {isDosenReguler ? "Rata Progres" : "Mhs Bimbingan"}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        {isDosenReguler ? (
                            <>
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                <span className="text-lg font-bold text-gray-800">{prodiStats.avgProgress}%</span>
                            </>
                        ) : (
                            <>
                                <UsersIcon className="w-4 h-4 text-green-600" />
                                <span className="text-lg font-bold text-gray-800">{activeBimbinganCount}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" onClick={() => navigate("/dosen/chat")}>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Pesan Masuk</span>
                    <div className="flex items-center gap-2 mt-1">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-lg font-bold text-gray-800">{unreadMessages || 0}</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-lg">Aktivitas Terkini</h2>
                    {activities.length > 5 && (
                        <button 
                            onClick={() => setShowAllActivities(true)}
                            className="text-sm text-orange-600 font-medium"
                        >
                            Lihat Semua
                        </button>
                    )}
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                         <div className="p-4 text-center text-gray-400 text-sm">Memuat..</div>
                    ) : activities.length === 0 ? (
                         <div className="p-4 text-center text-gray-400 text-sm">Belum ada aktivitas baru.</div>
                    ) : (
                        activities.slice(0, 5).map((item, i) => (
                            <div key={i} className="p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getIconColor(item.status)}`} />
                                    <span className="text-sm font-bold text-gray-900 truncate flex-1">
                                        {item.type === 'bimbingan' ? `Bimbingan Draf - ${item.nama}` : `Pengajuan Judul - ${item.nama}`}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-1">{item.judul}</span>
                                <div className="flex items-center justify-between mt-1 border-t border-gray-50 pt-2">
                                     <span className="text-[10px] text-gray-400">
                                         {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                     </span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                         {getStatusText(item.status, item.type)}
                                     </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {activities.length > 5 && (
                    <div className="p-3">
                        <button 
                            onClick={() => setShowAllActivities(true)}
                            className="w-full py-2 text-sm text-[#119DA4] font-medium bg-gray-50 rounded-lg"
                        >
                            Lihat Semua Aktivitas
                        </button>
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div className="p-4 rounded-2xl bg-[#FFF0EB] border border-[#FFDccf] flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-[#D25026] text-sm">Pusat Pesan</h3>
                    <p className="text-xs text-[#D25026]/80">Lihat pesan dari kord/mhs.</p>
                </div>
                <button 
                    onClick={() => navigate("/dosen/chat")}
                    className="px-4 py-2 bg-white text-[#D25026] text-xs font-bold rounded-lg shadow-sm"
                >
                    Chat
                </button>
            </div>

            {/* Modal "Lihat Semua" Aktivitas Mobile */}
            {showAllActivities && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-in slide-in-from-bottom-full duration-300">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-[#119DA4] text-white">
                        <h3 className="text-lg font-bold">Semua Aktivitas</h3>
                        <button onClick={() => setShowAllActivities(false)} className="p-2 text-white/80 hover:text-white rounded-lg">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div className="overflow-y-auto divide-y divide-gray-50 flex-1 p-2 bg-gray-50 pb-10">
                        {activities.map((item, i) => (
                            <div key={i} className="p-4 flex flex-col gap-1 bg-white m-2 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getIconColor(item.status)}`} />
                                    <span className="text-sm font-bold text-gray-900 truncate flex-1">
                                        {item.type === 'bimbingan' ? `Bimbingan Draf - ${item.nama}` : `Pengajuan Judul - ${item.nama}`}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-2">{item.judul}</span>
                                <div className="flex items-center justify-between mt-2 border-t border-gray-50 pt-2 text-[10px] text-gray-400">
                                     <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                     <span className="font-bold uppercase tracking-widest">{getStatusText(item.status, item.type)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

