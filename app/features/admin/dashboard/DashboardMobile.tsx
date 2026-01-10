import {
    FileText,
    TrendingUp,
    Clock,
    Users,
    Edit,
    Menu,
    Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { newsApi } from "~/api/news";
import { adminApi } from "~/api/admin";
import {
    StatisticCard,
    LatestActivityCard,
} from "~/features/admin/dashboard/components";
import { useSidebar } from "~/components/ui/sidebar";

export default function DashboardMobile() {
    const { setOpenMobile } = useSidebar();
    const [loading, setLoading] = useState(true);
    const [latestActivities, setLatestActivities] = useState<any[]>([]);
    const [statsData, setStatsData] = useState({
        totalArticles: 0,
        popularCategory: "-",
        scheduledArticles: 0,
        activeWriters: 0,
        activeEditors: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Latest Activities
                const activitiesRes = await newsApi.getNewsLatestActivities();
                const activitiesData = activitiesRes.data || [];

                // Map to card format
                const mappedActivities = activitiesData.map((item, idx) => ({
                    id: idx + 1,
                    title: item.title,
                    category: item.categories?.map(c => c.name) || [],
                    topics: item.topics?.map(t => `#${t.name}`) || [],
                    author: item.user?.name || "Unknown",
                    status: "Published",
                    views: 0,
                    timestamp: new Date().toLocaleDateString(),
                }));
                setLatestActivities(mappedActivities);

                // Fetch Popular Category
                const popCatRes = await newsApi.getPopularCategory();
                const popCatName = popCatRes.data?.name || "-";

                // Fetch Total Articles Count using new endpoint
                const totalRes = await newsApi.getNewsCountByStatus("published");
                const totalCount = totalRes.data?.count || 0;

                // Fetch Scheduled Articles Count using new endpoint
                const scheduledRes = await newsApi.getNewsCountByStatus("scheduled");
                const scheduledCount = scheduledRes.data?.count || 0;

                // Fetch Active Writers Count
                const writersRes = await adminApi.getUserCountByRole("writer");
                const writersCount = writersRes.data?.count || 0;

                // Fetch Active Editors Count
                const editorsRes = await adminApi.getUserCountByRole("editor");
                const editorsCount = editorsRes.data?.count || 0;

                setStatsData({
                    totalArticles: Number(totalCount),
                    popularCategory: popCatName,
                    scheduledArticles: Number(scheduledCount),
                    activeWriters: Number(writersCount),
                    activeEditors: Number(editorsCount),
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Statistics data with real values from API
    const statistics = [
        {
            title: "Total Articles",
            value: statsData.totalArticles,
            icon: FileText,
            trend: {
                value: "↑ + 12% from last month",
                isPositive: true,
            },
        },
        {
            title: "Popular Category",
            value: statsData.popularCategory,
            icon: TrendingUp,
        },
        {
            title: "Scheduled Article",
            value: statsData.scheduledArticles,
            icon: Clock,
        },
        {
            title: "Active Writer",
            value: statsData.activeWriters,
            icon: Users,
        },
        {
            title: "Active Editor",
            value: statsData.activeEditors,
            icon: Edit,
        },
    ];

    return (
        <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col">
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
                            Summary of system statistics
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="px-6 grid grid-cols-2 gap-4 mb-10">
                {statistics.map((stat, index) => (
                    <StatisticCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend as any}
                        className={index === statistics.length - 1 ? "col-span-2" : ""}
                    />
                ))}
            </div>

            {/* Latest Activities Section */}
            <div className="px-6 flex flex-col gap-6">
                <h2 className="text-[1.25rem] font-bold text-[#0D0D12]">
                    Latest Activities
                </h2>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-[#D25026] animate-spin" />
                    </div>
                ) : latestActivities.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
                        No activities found
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {latestActivities.map((activity) => (
                            <LatestActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
