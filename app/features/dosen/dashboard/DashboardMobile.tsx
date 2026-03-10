import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    Users as UsersIcon, 
    MessageSquare
} from "lucide-react";

export function DashboardMobile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        pengajuanApi.getPengajuanByDosen().then((data) => {
            if (data && Array.isArray(data)) {
                const sorted = data.sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
                setActivities(sorted);
            }
        }).catch(err => console.error(err))
          .finally(() => setLoading(false));
    }, []);

    const getIconColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return "bg-green-500";
            case 'PENDING': return "bg-blue-500";
            default: return "bg-red-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'APPROVED': return "Disetujui";
            case 'PENDING': return "Pending";
            default: return "Ditolak";
        }
    };

    const pendingCount = activities.filter(a => a.status === 'PENDING').length;
    const approvedCount = activities.filter(a => a.status === 'APPROVED').length;

    return (
        <div className="p-4 space-y-6 font-geist pb-20">
            {/* Welcome Banner Mobile */}
            <div className="rounded-2xl bg-[#119DA4] p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-1">
                    Hai, {user?.name?.split(' ')[0] || "Dosen"}!
                </h1>
                <p className="text-white/90 text-sm">
                    Tugas & Peninjauan Aktif: <span className="font-bold">{pendingCount} Usulan</span>
                </p>
                <div className="mt-4 flex gap-2">
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
                </div>
            </div>

            {/* Status Summary (Compact) */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-gray-400 text-xs font-medium uppercase">Mhs Bimbingan</span>
                    <div className="flex items-center gap-2 mt-1">
                        <UsersIcon className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-gray-800">{approvedCount}</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm" onClick={() => navigate("/dosen/chat")}>
                    <span className="text-gray-400 text-xs font-medium uppercase">Pesan Masuk</span>
                    <div className="flex items-center gap-2 mt-1">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                        <span className="text-lg font-bold text-gray-800">Cek</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 pb-2 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800 text-lg">Usulan Terkini</h2>
                </div>
                <div className="divide-y divide-gray-50">
                    {loading ? (
                         <div className="p-4 text-center text-gray-400 text-sm">Memuat..</div>
                    ) : activities.length === 0 ? (
                         <div className="p-4 text-center text-gray-400 text-sm">Belum ada aktivitas.</div>
                    ) : (
                        activities.slice(0, 5).map((item, i) => (
                            <div key={i} className="p-4 flex flex-col gap-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${getIconColor(item.status)}`} />
                                    <span className="text-sm font-bold text-gray-900 truncate flex-1">
                                        {item.mahasiswa?.nama || "Mahasiswa"}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 line-clamp-1">{item.judul}</span>
                                <div className="flex items-center justify-between mt-1 border-t border-gray-50 pt-2">
                                     <span className="text-[10px] text-gray-400">
                                         {new Date(item.tanggal).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                     </span>
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                         {getStatusText(item.status)}
                                     </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
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
        </div>
    );
}
