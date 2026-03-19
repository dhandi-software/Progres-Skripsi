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
} from "lucide-react";

export function DashboardDesktop() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [showAllActivities, setShowAllActivities] = useState(false);

    useEffect(() => {
        pengajuanApi.getProfile().then(setProfile).catch(console.error);
    }, []);

    const getActivities = () => {
        const activities: any[] = [];
        
        // 1. Dokumen Belum Lengkap: Only show if NO pengajuan
        if (!profile?.pengajuanJudul || profile.pengajuanJudul.length === 0) {
            activities.push({
                title: "Dokumen Belum Lengkap",
                desc: "Silakan upload Transkrip Nilai terbaru.",
                time: "Kemarin",
                icon: FileText,
                color: "text-orange-500",
            });
        }

        if (profile?.pengajuanJudul && profile.pengajuanJudul.length > 0) {
            const p = profile.pengajuanJudul[0];
            let dynActivity = null;
            if (p.status === 'PENDING') {
                dynActivity = {
                    title: "Pengajuan Sedang Diproses",
                    desc: `Usulan judul "${p.judul}" sedang menunggu persetujuan.`,
                    time: "Update terbaru",
                    icon: Clock,
                    color: "text-blue-500",
                };
            } else if (p.status === 'APPROVED') {
                dynActivity = {
                    title: "Pengajuan Judul Disetujui",
                    desc: `Usulan judul "${p.judul}" telah disetujui.`,
                    time: "Update terbaru",
                    icon: CheckCircle,
                    color: "text-green-500",
                };
            } else if (p.status === 'REJECTED') {
                dynActivity = {
                    title: "Pengajuan Judul Ditolak",
                    desc: `Usulan judul "${p.judul}" ditolak.`,
                    time: "Update terbaru",
                    icon: XCircle,
                    color: "text-red-500",
                };
            }
            if (dynActivity) {
                // Prepend so it appears first
                activities.unshift(dynActivity);
            }
        }
        return activities;
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
                        value: "110 SKS",
                        icon: BookOpen,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                    },
                    {
                        title: "Bimbingan",
                        value: "3 Kali",
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
                        <button 
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="text-sm text-[#119DA4] font-medium hover:underline"
                        >
                            {showAllActivities ? "Sembunyikan" : "Lihat Semua"}
                        </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {(showAllActivities ? getActivities() : getActivities().slice(0, 5)).map((item, i) => (
                            <div
                                key={i}
                                className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="mt-1">
                                    <item.icon
                                        className={`w-5 h-5 ${item.color}`}
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">
                                        {item.title}
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
