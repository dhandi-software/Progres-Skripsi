import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import { acaraApi } from "~/api/acaraApi";
import { jadwalKpApi } from "~/api/jadwalKpApi";
import type { JadwalKp } from "~/api/jadwalKpApi";
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp,
    XCircle,
    AlertCircle,
    MessageSquare as MessageSquareIcon,
    ClipboardList,
} from "lucide-react";
import { cn } from "~/lib/utils";

export function DashboardDesktop() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [bimbinganTasks, setBimbinganTasks] = useState<any[]>([]);
    const [acaras, setAcaras] = useState<any[]>([]);
    const [unreadAcaraCount, setUnreadAcaraCount] = useState(0);
    const [upcomingJadwal, setUpcomingJadwal] = useState<JadwalKp[]>([]);
    const [showAllActivities, setShowAllActivities] = useState(false);

    const fetchAcaraData = () => {
        acaraApi.getAcara()
            .then(res => setAcaras(res.data))
            .catch(console.error);

        acaraApi.getUnreadCount()
            .then(res => setUnreadAcaraCount(res.count))
            .catch(console.error);
    };

    useEffect(() => {
        pengajuanApi.getProfile().then(setProfile).catch(console.error);
        if (user?.id) {
            bimbinganApi.getMahasiswaAllTasks()
                .then(tasks => {
                    const grouped = tasks.reduce((acc: any, task: any) => {
                        if (!acc[task.topik] || task.versi > acc[task.topik].versi) {
                            acc[task.topik] = task;
                        }
                        return acc;
                    }, {});
                    setBimbinganTasks(Object.values(grouped));
                })
                .catch(console.error);
            
            fetchAcaraData();
            jadwalKpApi.getAllJadwalKp()
                .then((data: JadwalKp[]) => {
                    const now = new Date();
                    const upcoming = data.filter(j => new Date(j.tanggal) >= now && j.tipe !== 'JADWAL_SIDANG').sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
                    setUpcomingJadwal(upcoming);
                })
                .catch(console.error);
        }
    }, [user?.id]);

    useEffect(() => {
        window.addEventListener('update-unread-count', fetchAcaraData);
        return () => window.removeEventListener('update-unread-count', fetchAcaraData);
    }, []);

    const getActivities = () => {
        const activities: any[] = [];
        
        // 1. Dokumen Belum Lengkap: Only show if NO pengajuan
        if (!profile?.pengajuanJudul || profile.pengajuanJudul.length === 0) {
            activities.push({
                title: "Dokumen Belum Lengkap",
                desc: "Silakan upload Transkrip Nilai terbaru.",
                time: "Belum Lengkap",
                icon: FileText,
                color: "text-orange-500",
                rawDate: new Date(9999, 11, 31) // Pin to top
            });
        }

        if (profile?.pengajuanJudul && profile.pengajuanJudul.length > 0) {
            const p = profile.pengajuanJudul[0];
            let dynActivity: { title: string, desc: string, icon: any, color: string, rawDate: Date, time?: string } | null = null;
            if (p.status === 'PENDING') {
                dynActivity = {
                    title: "Pengajuan Sedang Diproses",
                    desc: `Usulan judul "${p.judul}" sedang menunggu persetujuan.`,
                    icon: Clock,
                    color: "text-blue-500",
                    rawDate: new Date(p.tanggal)
                };
            } else if (p.status === 'APPROVED') {
                dynActivity = {
                    title: "Pengajuan Judul Disetujui",
                    desc: `Usulan judul "${p.judul}" telah disetujui.`,
                    icon: CheckCircle,
                    color: "text-green-500",
                    rawDate: new Date(p.tanggal)
                };
            } else if (p.status === 'REJECTED') {
                dynActivity = {
                    title: "Pengajuan Judul Ditolak",
                    desc: `Usulan judul "${p.judul}" ditolak.`,
                    icon: XCircle,
                    color: "text-red-500",
                    rawDate: new Date(p.tanggal)
                };
            } else if (p.status === 'REVISION') {
                dynActivity = {
                    title: "Pengajuan Perlu Revisi",
                    desc: `Usulan judul "${p.judul}" diminta revisi oleh dosen.`,
                    icon: AlertCircle,
                    color: "text-yellow-600",
                    rawDate: new Date(p.tanggal)
                };
            }
            if (dynActivity) {
                // Formatting time explicitly
                dynActivity.time = new Date(p.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
                activities.push(dynActivity);
            }
        }

        // 3. Status Bimbingan
        bimbinganTasks.forEach(t => {
            const dateStr = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
            if (t.status === 'REVISION') {
                activities.push({
                    title: "Revisi Bimbingan",
                    desc: `Dosen mereviu draf ${t.topik} dan memberikan catatan.`,
                    time: dateStr,
                    icon: AlertCircle,
                    color: "text-red-500",
                    rawDate: new Date(t.tanggal)
                });
            } else if (t.status === 'ASSIGNED') {
                activities.push({
                    title: "Tugas Bimbingan Baru",
                    desc: `Anda mendapat target bimbingan bab ${t.topik}.`,
                    time: dateStr,
                    icon: FileText,
                    color: "text-blue-500",
                    rawDate: new Date(t.tanggal)
                });
            } else if (t.status === 'SUBMITTED') {
                activities.push({
                    title: "Draf Bimbingan Terkirim",
                    desc: `Draf ${t.topik} menunggu reviu dosen.`,
                    time: dateStr,
                    icon: Clock,
                    color: "text-orange-500",
                    rawDate: new Date(t.tanggal)
                });
            } else if (t.status === 'APPROVED') {
                activities.push({
                    title: "Bimbingan Disetujui",
                    desc: `Bab ${t.topik} telah disetujui dosen.`,
                    time: dateStr,
                    icon: CheckCircle,
                    color: "text-green-500",
                    rawDate: new Date(t.tanggal)
                });
            }
        });
        
        // 4. Berita Acara (Acara)
        acaras.forEach(a => {
            activities.push({
                title: a.type === 'ASSIGNMENT' ? `Tugas Baru: ${a.title}` : `Pengumuman: ${a.title}`,
                desc: `${a.dosen.nama} memposting di timeline.`,
                time: new Date(a.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }),
                icon: a.type === 'ASSIGNMENT' ? FileText : AlertCircle,
                color: a.type === 'ASSIGNMENT' ? "text-cyan-500" : "text-purple-500",
                rawDate: new Date(a.createdAt),
                isRead: a.isRead, // New property
                onClick: () => navigate("/mahasiswa/acara", { state: { selectedId: a.id } }) // Pass ID
            });
        });

        // Sort by rawDate descending
        return activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    };

    return (
        <div className="p-6 lg:p-10 space-y-8 font-geist">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#119DA4] to-[#0D7C82] p-8 text-white shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">
                        Selamat Datang, {user?.name || "Mahasiswa"}!
                    </h1>
                    <p className="text-white/80 text-lg w-full">
                        Pantau progres Kerja Praktik kamu, ajukan bimbingan, dan
                        kelola dokumen administrasi dalam satu platform
                        terintegrasi.
                    </p>
                </div>
                {/* Decorative overlay */}
                <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-12" />
                <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            </div>

            {/* Notification Banner for Upcoming Jadwal */}
            {upcomingJadwal.map((jadwal, index) => (
                <div key={`jadwal-${index}`} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 shrink-0">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${jadwal.tipe === 'PENGARAHAN_KP' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {jadwal.tipe === 'PENGARAHAN_KP' ? 'Pengarahan KP' : 'Pengumpulan Laporan Sidang'}
                                </span>
                            </div>
                            <h3 className="text-emerald-800 font-bold text-lg">{jadwal.judul}</h3>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="bg-emerald-600 text-white font-black text-lg px-4 py-1.5 rounded-xl shadow-md">
                                    {new Date(jadwal.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="bg-emerald-100 text-emerald-800 font-black text-lg px-4 py-1.5 rounded-xl border border-emerald-200">
                                    {new Date(jadwal.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {jadwal.deskripsi && <p className="text-emerald-700 text-xs mt-3 italic">"{jadwal.deskripsi}"</p>}
                        </div>
                    </div>
                    {jadwal.tipe === 'PENGARAHAN_SIDANG' && (
                        <button 
                            onClick={() => navigate("/mahasiswa/sidang")}
                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
                        >
                            Kumpul Laporan
                        </button>
                    )}
                </div>
            ))}


            {/* Notification Banner for Rejected Applications */}
            {profile?.pengajuanJudul && profile.pengajuanJudul.length > 0 && profile.pengajuanJudul[0].status === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full text-red-600">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg">Pengajuan Judul Ditolak</h3>
                            <p className="text-red-600 text-sm mt-1 mb-0">Usulan judul "{profile.pengajuanJudul[0].judul}" tidak disetujui. Silakan perbaiki dan ajukan ulang formulir.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate("/mahasiswa/pengajuan")}
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                        Ajukan Kembali
                    </button>
                </div>
            )}

            {/* Notification Banner for Revision Pengajuan */}
            {profile?.pengajuanJudul && profile.pengajuanJudul.length > 0 && profile.pengajuanJudul[0].status === 'REVISION' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-yellow-100 rounded-full text-yellow-700 shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-yellow-800 font-bold text-lg">Pengajuan Judul Perlu Revisi</h3>
                                <p className="text-yellow-700 text-sm mt-1 mb-0">
                                    Usulan judul "{profile.pengajuanJudul[0].judul}" diminta revisi oleh dosen pembimbing. Silakan perbaiki dan ajukan ulang.
                                </p>
                                {profile.pengajuanJudul[0].remarks && (
                                    <div className="mt-3 p-3 bg-white border border-yellow-200 rounded-xl">
                                        <p className="text-xs font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                            <MessageSquareIcon className="w-3.5 h-3.5" /> Komentar Dosen:
                                        </p>
                                        <p className="text-sm text-yellow-900 italic">"{profile.pengajuanJudul[0].remarks}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate("/mahasiswa/pengajuan")}
                            className="w-full sm:w-auto px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0"
                        >
                            Perbaiki & Ajukan Ulang
                        </button>
                    </div>
                </div>
            )}

            {/* Notification Banner for Bimbingan Revisions */}
            {bimbinganTasks.filter(t => t.status === 'REVISION').map((t, index) => (
                <div key={`rev-${index}`} className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="p-3 bg-orange-100 rounded-full text-orange-600 shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-orange-800 font-bold text-lg">Ada Revisi Bimbingan: {t.topik}</h3>
                                <p className="text-orange-700 text-sm mt-1 mb-0">Dosen pembimbing telah memberikan catatan revisi untuk draf Anda. Silakan perbaiki dan unggah kembali.</p>
                                {t.catatan && t.catatan !== 'Task Assigned' && (
                                    <div className="mt-3 p-3 bg-white border border-orange-200 rounded-xl">
                                        <p className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1">
                                            <MessageSquareIcon className="w-3.5 h-3.5" /> Komentar Dosen:
                                        </p>
                                        <p className="text-sm text-orange-900 italic">"{t.catatan}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate("/mahasiswa/bimbingan")}
                            className="w-full sm:w-auto px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0"
                        >
                            Lihat Revisi
                        </button>
                    </div>
                </div>
            ))}
            
            {/* Notification Banner for Unread Acara */}
            {unreadAcaraCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600 shrink-0">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-blue-800 font-bold text-lg">Pengumuman Baru</h3>
                            <p className="text-blue-600 text-sm mt-1 mb-0">Ada {unreadAcaraCount} pengumuman atau berita acara baru dari dosen pembimbing yang belum Anda baca.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate("/mahasiswa/acara")}
                        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                        Lihat Sekarang
                    </button>
                </div>
            )}

            {/* Notification Banner for Missing Pengajuan */}
            {(!profile?.pengajuanJudul || profile.pengajuanJudul.length === 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-full text-amber-600 shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-amber-800 font-bold text-lg">Lengkapi Pengajuan Formulir</h3>
                            <p className="text-amber-600 text-sm mt-1 mb-0">Silakan lengkapi pengajuan formulir untuk melakukan bimbingan.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate("/mahasiswa/pengajuan")}
                        className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                        Lengkapi Sekarang
                    </button>
                </div>
            )}
 
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        title: "Status KP",
                        value: "Aktif",
                        icon: CheckCircle,
                        color: "text-green-600",
                        bg: "bg-green-50",
                    },
                    {
                        title: "SKS Tempuh",
                        value: `${profile?.pengajuanJudul && profile.pengajuanJudul.length > 0 ? profile.pengajuanJudul[0].sksDicapai || 0 : 0} SKS`,
                        icon: BookOpen,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                    },
                    {
                        title: "Bimbingan",
                        value: `${bimbinganTasks.filter(t => t.status === 'APPROVED').length} Kali`,
                        icon: UsersIcon,
                        color: "text-orange-600",
                        bg: "bg-orange-50",
                    },
                    {
                        title: "Target Selesai",
                        value: "Juli 2026",
                        icon: Calendar,
                        color: "text-purple-600",
                        bg: "bg-purple-50",
                    },
                ].map((stat, i) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Recent Activity / Notifications */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            Aktivitas Terkini
                        </h2>
                        {/* Tampilkan tombol 'Lihat Semua' dengan modal popup hanya jika jumlah aktivitas lebih dari 5 */}
                        {getActivities().length > 5 && (
                            <button 
                                onClick={() => setShowAllActivities(true)}
                                className="text-sm text-[#119DA4] font-medium hover:underline"
                            >
                                Lihat Semua
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-gray-50">
                        {getActivities().slice(0, 5).map((item, i) => (
                            <div
                                key={i}
                                onClick={item.onClick}
                                className={cn(
                                    "p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors",
                                    item.onClick ? "cursor-pointer" : ""
                                )}
                            >
                                <div className="mt-1">
                                    <item.icon
                                        className={`w-5 h-5 ${item.color}`}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        {item.title}
                                        {item.isRead === false && (
                                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-sm" />
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {item.desc}
                                    </p>
                                    <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />{" "}
                                        {item.time}
                                    </span>
                                </div>
                            </div>
                        ))}
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
                                onClick={() => navigate("/mahasiswa/pengajuan")}
                                className="w-full py-3 px-4 bg-[#119DA4] hover:bg-[#0e868c] text-white rounded-xl font-medium transition-all shadow-lg shadow-[#119DA4]/20 flex items-center justify-center gap-2"
                            >
                                <FileText className="w-5 h-5" />
                                Ajukan Judul Baru
                            </button>
                            <button
                                onClick={() => navigate("/mahasiswa/bimbingan")}
                                className="w-full py-3 px-4 bg-white border-2 border-[#119DA4] text-[#119DA4] hover:bg-[#119DA4]/5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <UsersIcon className="w-5 h-5" />
                                Daftar Bimbingan
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#FFF0EB] rounded-3xl p-6 border border-[#FFDccf]">
                        <h3 className="font-bold text-[#D25026] mb-2">
                            Butuh Bantuan?
                        </h3>
                        <p className="text-sm text-[#D25026]/80 mb-4">
                            Jika mengalami kendala teknis atau administrasi,
                            hubungi staf prodi melalui fitur chat.
                        </p>
                        <button
                            onClick={() => navigate("/mahasiswa/chat")}
                            className="text-sm font-semibold text-[#D25026] hover:underline"
                        >
                            Hubungi Staf &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal "Lihat Semua" Aktivitas */}
            {showAllActivities && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">Semua Aktivitas</h3>
                            <button onClick={() => setShowAllActivities(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="overflow-y-auto divide-y divide-gray-50 flex-1 p-2">
                            {getActivities().map((item, i) => (
                                <div key={i} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors rounded-xl mx-2">
                                    <div className="mt-1"><item.icon className={`w-6 h-6 ${item.color}`} /></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                                        <span className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> {item.time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function UsersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

