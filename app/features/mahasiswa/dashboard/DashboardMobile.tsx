import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { pengajuanApi } from "~/api/pengajuan";
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
import { bimbinganApi } from "~/api/bimbinganApi";
import { acaraApi } from "~/api/acaraApi";

export function DashboardMobile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [bimbinganTasks, setBimbinganTasks] = useState<any[]>([]);
    const [acaras, setAcaras] = useState<any[]>([]);
    const [unreadAcaraCount, setUnreadAcaraCount] = useState(0);
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
            activities.push(
                { 
                    title: "Upload Transkrip", 
                    desc: "Lengkapi berkas pendaftaran kerja praktik.",
                    time: "Belum Lengkap", 
                    color: "text-orange-500", 
                    icon: ClipboardList,
                    rawDate: new Date(9999, 11, 31),
                    onClick: () => navigate("/mahasiswa/pengajuan")
                }
            );
        }
        if (profile?.pengajuanJudul && profile.pengajuanJudul.length > 0) {
            const p = profile.pengajuanJudul[0];
            let dynActivity: { title: string, time: string, color: string, rawDate: Date } | null = null;
            if (p.status === 'PENDING') {
                dynActivity = { title: "Sedang Diproses", time: "Baru", color: "text-blue-500", rawDate: new Date(p.tanggal) };
            } else if (p.status === 'APPROVED') {
                dynActivity = { title: "Judul Disetujui", time: "Baru", color: "text-green-500", rawDate: new Date(p.tanggal) };
            } else if (p.status === 'REJECTED') {
                dynActivity = { title: "Judul Ditolak", time: "Baru", color: "text-red-500", rawDate: new Date(p.tanggal) };
            } else if (p.status === 'REVISION') {
                dynActivity = { title: "Pengajuan Perlu Revisi", time: "Baru", color: "text-yellow-600", rawDate: new Date(p.tanggal) };
            }
            if (dynActivity) {
                dynActivity.time = new Date(p.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
                activities.push({
                    ...dynActivity,
                    desc: "Pembaruan status pengajuan judul bimbingan.",
                    icon: FileText,
                    onClick: () => navigate("/mahasiswa/pengajuan")
                });
            }
        }

        // 3. Status Bimbingan
        bimbinganTasks.forEach(t => {
            const dateStr = new Date(t.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
            if (t.status === 'REVISION') {
                activities.push({
                    title: "Revisi Bimbingan",
                    desc: `Ada catatan revisi untuk topik: ${t.topik}`,
                    time: dateStr,
                    color: "text-red-500",
                    icon: AlertCircle,
                    rawDate: new Date(t.tanggal),
                    onClick: () => navigate("/mahasiswa/bimbingan")
                });
            } else if (t.status === 'ASSIGNED') {
                activities.push({
                    title: "Tugas Baru",
                    desc: `Tugas baru ditugaskan: ${t.topik}`,
                    time: dateStr,
                    color: "text-blue-500",
                    icon: Calendar,
                    rawDate: new Date(t.tanggal),
                    onClick: () => navigate("/mahasiswa/bimbingan")
                });
            } else if (t.status === 'SUBMITTED') {
                activities.push({
                    title: "Draf Terkirim",
                    desc: `Draf untuk topik ${t.topik} telah diunggah.`,
                    time: dateStr,
                    color: "text-orange-500",
                    icon: TrendingUp,
                    rawDate: new Date(t.tanggal),
                    onClick: () => navigate("/mahasiswa/bimbingan")
                });
            } else if (t.status === 'APPROVED') {
                activities.push({
                    title: "Disetujui",
                    desc: `Draf topik ${t.topik} telah disetujui dosen.`,
                    time: dateStr,
                    color: "text-green-500",
                    icon: CheckCircle,
                    rawDate: new Date(t.tanggal),
                    onClick: () => navigate("/mahasiswa/bimbingan")
                });
            }
        });

        // 4. Berita Acara (Acara)
        acaras.forEach(a => {
            activities.push({
                title: a.type === 'ASSIGNMENT' ? `Instruksi Baru: ${a.title}` : `Pengumuman: ${a.title}`,
                desc: `${a.dosen.nama} memposting di timeline.`,
                time: new Date(a.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }),
                icon: a.type === 'ASSIGNMENT' ? FileText : AlertCircle,
                color: a.type === 'ASSIGNMENT' ? "text-cyan-500" : "text-purple-500",
                rawDate: new Date(a.createdAt),
                isRead: a.isRead,
                onClick: () => navigate("/mahasiswa/acara", { state: { selectedId: a.id } })
            });
        });

        return activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    };

    return (
        <div className="p-4 space-y-6 font-geist pb-20">
            {/* Welcome Banner Mobile */}
            <div className="rounded-2xl bg-[#119DA4] p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-1">
                    Hai, {user?.name?.split(' ')[0] || "Mahasiswa"}!
                </h1>
                <p className="text-white/90 text-sm">
                    Status KP kamu: <span className="font-bold">Aktif</span>
                </p>
                <div className="mt-4 flex gap-2">
                    <button 
                         onClick={() => navigate("/mahasiswa/pengajuan")}
                         className="flex-1 bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Ajukan Judul
                    </button>
                    <button 
                        onClick={() => navigate("/mahasiswa/bimbingan")}
                        className="flex-1 bg-white text-[#119DA4] py-2 rounded-lg text-sm font-bold shadow-sm"
                    >
                        Bimbingan
                    </button>
                </div>
            </div>

            {/* Notification Banner for Rejected Applications Mobile */}
            {profile?.pengajuanJudul && profile.pengajuanJudul.length > 0 && profile.pengajuanJudul[0].status === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-red-800 font-bold text-sm">Pengajuan Ditolak</h3>
                            <p className="text-red-600 text-[10px] mt-1 pr-2 leading-relaxed">
                                Usulan "{profile.pengajuanJudul[0].judul}" tidak disetujui. Silakan ajukan ulang formulir.
                            </p>
                            <button 
                                onClick={() => navigate("/mahasiswa/pengajuan")}
                                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm w-full"
                            >
                                Ajukan Kembali
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner for Revision Pengajuan Mobile */}
            {profile?.pengajuanJudul && profile.pengajuanJudul.length > 0 && profile.pengajuanJudul[0].status === 'REVISION' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-700 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-yellow-800 font-bold text-sm">Pengajuan Perlu Revisi</h3>
                            <p className="text-yellow-700 text-[10px] mt-1 pr-2 leading-relaxed">
                                Usulan "{profile.pengajuanJudul[0].judul}" diminta revisi oleh dosen. Silakan perbaiki dan ajukan ulang.
                            </p>
                            {profile.pengajuanJudul[0].remarks && (
                                <div className="mt-2 p-2.5 bg-white border border-yellow-200 rounded-lg">
                                    <p className="text-[10px] font-bold text-yellow-700 mb-1 flex items-center gap-1">
                                        <MessageSquareIcon className="w-3 h-3" /> Komentar Dosen:
                                    </p>
                                    <p className="text-[11px] text-yellow-900 italic leading-relaxed">"{profile.pengajuanJudul[0].remarks}"</p>
                                </div>
                            )}
                            <button 
                                onClick={() => navigate("/mahasiswa/pengajuan")}
                                className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm w-full"
                            >
                                Perbaiki & Ajukan Ulang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner for Bimbingan Revisions Mobile */}
            {bimbinganTasks.filter(t => t.status === 'REVISION').map((t, index) => (
                <div key={`rev-${index}`} className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-orange-800 font-bold text-sm">Ada Revisi Bimbingan: {t.topik}</h3>
                            <p className="text-orange-600 text-[10px] mt-1 pr-2 leading-relaxed">
                                Dosen pembimbing telah memberikan catatan revisi untuk draf Anda. Silakan perbaiki dan unggah kembali.
                            </p>
                            {t.catatan && t.catatan !== 'Task Assigned' && (
                                <div className="mt-2 p-2.5 bg-white border border-orange-200 rounded-lg">
                                    <p className="text-[10px] font-bold text-orange-700 mb-1 flex items-center gap-1">
                                        <MessageSquareIcon className="w-3 h-3" /> Komentar Dosen:
                                    </p>
                                    <p className="text-[11px] text-orange-900 italic leading-relaxed">"{t.catatan}"</p>
                                </div>
                            )}
                            <button 
                                onClick={() => navigate("/mahasiswa/bimbingan")}
                                className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm w-full"
                            >
                                Lihat Revisi
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Notification Banner for Unread Acara Mobile */}
            {unreadAcaraCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600 shrink-0">
                            <ClipboardList className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-800 font-bold text-sm">Pengumuman Baru</h3>
                            <p className="text-blue-600 text-[10px] mt-1 pr-2 leading-relaxed">
                                Ada {unreadAcaraCount} pengumuman atau berita acara baru dari dosen pembimbing yang belum Anda baca.
                            </p>
                            <button 
                                onClick={() => navigate("/mahasiswa/acara")}
                                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm w-full"
                            >
                                Lihat Pengumuman
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Banner for Missing Pengajuan Mobile */}
            {(!profile?.pengajuanJudul || profile.pengajuanJudul.length === 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-amber-800 font-bold text-sm">Lengkapi Pengajuan Formulir</h3>
                            <p className="text-amber-600 text-[10px] mt-1 pr-2 leading-relaxed">
                                Silakan lengkapi pengajuan formulir untuk melakukan bimbingan.
                            </p>
                            <button 
                                onClick={() => navigate("/mahasiswa/pengajuan")}
                                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm w-full"
                            >
                                Lengkapi Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Summary (Compact) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 text-xs font-medium uppercase">SKS Tempuh</span>
                    <div className="flex items-center gap-2 mt-1">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span className="text-lg font-bold text-gray-800">110</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 text-xs font-medium uppercase">Target</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-lg font-bold text-gray-800">Jul '26</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-lg">Aktivitas</h2>
                    {/* Tampilkan tombol toggle dikanan atas hanya jika jumlah aktivitas lebih dari 5 */}
                    {getActivities().length > 5 && (
                        <button 
                            onClick={() => setShowAllActivities(true)}
                            className="text-sm text-orange-600 font-medium font-['Noto_Sans']"
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
                            className={`p-4 flex items-center justify-between ${item.onClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-current ${item.color}`} />
                                <span className="text-sm font-medium text-gray-700">{item.title}</span>
                            </div>
                            <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                    ))}
                </div>
                {/* Tombol expand di bagian bawah khusus untuk mobile, disembunyikan jika data sedang diexpand atau < 5 */}
                {getActivities().length > 5 && (
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
                    <h3 className="font-bold text-[#D25026] text-sm">Butuh Bantuan?</h3>
                    <p className="text-xs text-[#D25026]/80">Chat dengan staf prodi sekarang.</p>
                </div>
                <button 
                    onClick={() => navigate("/mahasiswa/chat")}
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
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="overflow-y-auto divide-y divide-gray-50 flex-1 p-2 bg-gray-50 pb-10">
                        {getActivities().map((item, i) => {
                            const Icon = item.icon || AlertCircle;
                            return (
                                <div 
                                    key={i} 
                                    onClick={item.onClick}
                                    className={`p-4 flex items-center justify-between bg-white m-2 rounded-xl shadow-sm border border-gray-100 ${item.onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}`}
                                >
                                    <div className="flex items-start gap-4 text-left">
                                        <div className="mt-1 shrink-0"><Icon className={`w-5 h-5 ${item.color}`} /></div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                {item.title}
                                                {item.isRead === false && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm animate-pulse" />
                                                )}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 pr-2">{item.desc || ''}</p>
                                            <span className="text-[10px] text-gray-400 mt-2 block flex gap-1 items-center font-medium">
                                                <Clock className="w-3 h-3"/>{item.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
