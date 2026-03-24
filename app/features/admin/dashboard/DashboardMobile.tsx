import {
    Users,
    UserCheck,
    Shield,
    Menu,
    Loader2,
    UserPlus
} from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "~/api/admin";
import { StatisticCard } from "~/features/admin/dashboard/components";
import { useSidebar } from "~/components/ui/sidebar";

export default function DashboardMobile() {
    const { setOpenMobile } = useSidebar();
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        totalMahasiswa: 0,
        totalDosen: 0,
        totalAdmin: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Mahasiswa Count
                const mhsRes = await adminApi.getUserCountByRole("mahasiswa");
                const mhsCount = mhsRes.data?.count || 0;

                // Fetch Dosen Count
                const dosenRes = await adminApi.getUserCountByRole("dosen");
                const dosenCount = dosenRes.data?.count || 0;

                // Fetch Admin Count
                const adminRes = await adminApi.getUserCountByRole("admin");
                const adminCount = adminRes.data?.count || 0;

                setStatsData({
                    totalMahasiswa: Number(mhsCount),
                    totalDosen: Number(dosenCount),
                    totalAdmin: Number(adminCount),
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statistics = [
        {
            title: "Mahasiswa",
            value: statsData.totalMahasiswa,
            icon: Users,
            trend: {
                value: "Active",
                isPositive: true,
            },
        },
        {
            title: "Dosen",
            value: statsData.totalDosen,
            icon: UserCheck,
            trend: {
                 value: "Active",
                 isPositive: true,
            },
        },
        {
            title: "Admin",
            value: statsData.totalAdmin,
            icon: Shield,
             trend: {
                 value: "System",
                 isPositive: true,
            },
        },
    ];

    return (
        <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col font-geist">
            {/* Header Section */}
            <div className="px-6 mb-8 flex flex-col gap-6">
                <div className="flex items-center">
                    <button
                        onClick={() => setOpenMobile(true)}
                        className="p-2 -ml-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-[#0D0D12]" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
                            Dashboard
                        </h1>
                        <p className="text-[0.875rem] text-[#71717A] font-medium leading-none">
                            System Overview
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="px-6 flex flex-col gap-4 mb-8">
                {statistics.map((stat, index) => (
                    <StatisticCard
                        key={index}
                        title={stat.title}
                        value={loading ? "..." : stat.value}
                        icon={stat.icon}
                        trend={stat.trend as any}
                    />
                ))}
            </div>

             <div className="px-6">
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                    <UserPlus className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500">Create new accounts via the menu.</p>
                </div>
            </div>
        </div>
    );
}
