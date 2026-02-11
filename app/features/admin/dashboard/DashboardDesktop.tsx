import { Users, UserPlus, UserCheck, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "~/api/admin";
import { StatisticCard } from "~/features/admin/dashboard/components";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";

export default function DashboardDesktop() {
    const [loading, setLoading] = useState(true);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);
    const [statsData, setStatsData] = useState({
        totalMahasiswa: 0,
        totalDosen: 0,
        totalAdmin: 0,
    });
    const [monitoringData, setMonitoringData] = useState<any[]>([]);

    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem("justLoggedIn");
        if (justLoggedIn === "true") {
            setShowWelcomeToast(true);
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Counts
                const [mhsRes, dosenRes, adminRes] = await Promise.all([
                    adminApi.getUserCountByRole("mahasiswa"),
                    adminApi.getUserCountByRole("dosen"),
                    adminApi.getUserCountByRole("admin")
                ]);

                setStatsData({
                    totalMahasiswa: Number(mhsRes.data?.count || 0),
                    totalDosen: Number(dosenRes.data?.count || 0),
                    totalAdmin: Number(adminRes.data?.count || 0),
                });

                // Fetch Monitoring Data
                const monRes = await adminApi.getMonitoringData();
                setMonitoringData(monRes.data || []);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statistics = [
        { title: "Total Mahasiswa", value: statsData.totalMahasiswa, icon: Users, trend: { value: "Active Students", isPositive: true } },
        { title: "Total Dosen", value: statsData.totalDosen, icon: UserCheck, trend: { value: "Active Lecturers", isPositive: true } },
        { title: "Total Admin", value: statsData.totalAdmin, icon: Shield, trend: { value: "System Administrators", isPositive: true } },
    ];

    return (
        <div className="w-full min-h-screen px-6 py-6 bg-gray-50 font-geist">
            {/* Header Section */}
            <div className="flex justify-between mb-8">
                <div className="w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
                    <p className="text-sm text-gray-500">Overview of system users and monitoring.</p>
                </div>
                {showWelcomeToast && <Toast title="Welcome back, Admin!" duration={5000} variant="success" />}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statistics.map((stat, index) => (
                    <StatisticCard key={index} title={stat.title} value={stat.value} icon={stat.icon} trend={stat.trend} />
                ))}
            </div>

            {/* Monitoring Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">Monitoring Bimbingan Dosen</h2>
                    <p className="text-sm text-gray-500">List of Lecturers and their supervised Students.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Dosen Name</th>
                                <th className="px-6 py-4">NIDN</th>
                                <th className="px-6 py-4">Jabatan</th>
                                <th className="px-6 py-4 text-center">Total Bimbingan</th>
                                <th className="px-6 py-4">Mahasiswa List</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {monitoringData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        No data available or failed to load.
                                    </td>
                                </tr>
                            ) : (
                                monitoringData.map((dosen) => (
                                    <DosenRow key={dosen.id} dosen={dosen} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Sub-component for expandable row (optional, simplified for now)
function DosenRow({ dosen }: { dosen: any }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className={cn("hover:bg-gray-50 transition-colors cursor-pointer", expanded && "bg-gray-50")} onClick={() => setExpanded(!expanded)}>
                <td className="px-6 py-4 font-medium text-gray-900">{dosen.nama}</td>
                <td className="px-6 py-4 text-gray-600 font-mono">{dosen.nidn}</td>
                <td className="px-6 py-4 text-gray-600">
                   <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{dosen.jabatan}</span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-gray-900">{dosen.totalBimbingan}</td>
                <td className="px-6 py-4 text-gray-500">
                   <div className="flex items-center gap-1 text-xs">
                        {expanded ? "Hide Details" : "Show Details"}
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                   </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-gray-50/50">
                    <td colSpan={5} className="px-6 py-4">
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                            <h4 className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wider">Mahasiswa Bimbingan</h4>
                            {dosen.mahasiswaBimbingan.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No students under supervision.</p>
                            ) : (
                                <div className="grid gap-2">
                                    {dosen.mahasiswaBimbingan.map((mhs: any) => (
                                        <div key={mhs.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{mhs.nama}</p>
                                                <p className="text-xs text-gray-500 font-mono">{mhs.nim}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-700 font-medium truncate max-w-[200px]" title={mhs.judulSkripsi}>{mhs.judulSkripsi}</p>
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase",
                                                    mhs.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                )}>
                                                    {mhs.status || "Ongoing"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}
