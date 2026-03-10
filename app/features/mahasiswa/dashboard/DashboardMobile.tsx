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
} from "lucide-react";

export function DashboardMobile() {
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
            activities.push(
                { title: "Upload Transkrip", time: "Kmrin", color: "text-orange-500" }
            );
        }
        if (profile?.pengajuanJudul && profile.pengajuanJudul.length > 0) {
            const p = profile.pengajuanJudul[0];
            let dynActivity = null;
            if (p.status === 'PENDING') {
                dynActivity = { title: "Sedang Diproses", time: "Baru", color: "text-blue-500" };
            } else if (p.status === 'APPROVED') {
                dynActivity = { title: "Judul Disetujui", time: "Baru", color: "text-green-500" };
            } else if (p.status === 'REJECTED') {
                dynActivity = { title: "Judul Ditolak", time: "Baru", color: "text-red-500" };
            }
            if (dynActivity) {
                activities.unshift(dynActivity);
            }
        }
        return activities;
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
                    <button 
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className="text-sm text-orange-600 font-medium font-['Noto_Sans']"
                    >
                        {showAllActivities ? "Sembunyikan" : "Lihat Semua"}
                    </button>
                </div>
                <div className="divide-y divide-gray-50">
                    {(showAllActivities ? getActivities() : getActivities().slice(0, 5)).map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-current ${item.color}`} />
                                <span className="text-sm font-medium text-gray-700">{item.title}</span>
                            </div>
                            <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                    ))}
                </div>
                <div className="p-3">
                    <button className="w-full py-2 text-sm text-[#119DA4] font-medium bg-gray-50 rounded-lg">
                        Lihat Semua Aktivitas
                    </button>
                </div>
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
        </div>
    );
}
