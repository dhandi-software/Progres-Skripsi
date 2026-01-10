import { FileText, TrendingUp, Clock, Users, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { newsApi } from "~/api/news";
import { adminApi } from "~/api/admin";
import {
    StatisticCard,
    ActivitiesTable,
} from "~/features/admin/dashboard/components";
import { Toast } from "~/components/ui/toast";

export default function DashboardDesktop() {
    const [loading, setLoading] = useState(true);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);
    const [latestActivities, setLatestActivities] = useState<any[]>([]);
    const [statsData, setStatsData] = useState({
        totalArticles: 0,
        popularCategory: "-",
        scheduledArticles: 0,
        activeWriters: 0,
        activeEditors: 0,
    });

    // Check if user just logged in (flag set during login)
    useEffect(() => {
        const justLoggedIn = sessionStorage.getItem("justLoggedIn");
        if (justLoggedIn === "true") {
            setShowWelcomeToast(true);
            // Clear the flag so toast doesn't show on subsequent visits
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Latest Activities
                const activitiesRes = await newsApi.getNewsLatestActivities();
                const activitiesData = activitiesRes.data || [];

                // Map to table format
                const mappedActivities = activitiesData.map((item) => ({
                    id: item.id,
                    title: item.title,
                    category: item.categories?.map((c) => c.name) || [],
                    topics: item.topics?.map((t) => t.name) || [],
                    author: item.user?.name || "Unknown",
                }));
                setLatestActivities(mappedActivities);

                // Fetch Popular Category
                const popCatRes = await newsApi.getPopularCategory();
                const popCatName = popCatRes.data?.name || "-";

                // Fetch Total Articles Count using new endpoint
                const totalRes =
                    await newsApi.getNewsCountByStatus("published");
                const totalCount = totalRes.data?.count || 0;

                // Fetch Scheduled Articles Count using new endpoint
                const scheduledRes =
                    await newsApi.getNewsCountByStatus("scheduled");
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
                value: "+ 12% from last month",
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

    // Use mapped activities
    const activities = latestActivities;

    return (
        <div className="w-full min-h-screen px-6 py-6 bg-gray-50">
            {/* Header Section */}
            <div className="flex justify-between">
                <div className="w-full mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500">
                        Summary of system activities and statistics
                    </p>
                </div>

                {/* Welcome Banner - only show after login */}
                {showWelcomeToast && (
                    <Toast
                        title="Welcome back, APNI!"
                        duration={5000}
                        variant="success"
                    />
                )}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 mb-8">
                {statistics.map((stat, index) => (
                    <StatisticCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        trend={stat.trend}
                    />
                ))}
            </div>

            {/* Latest Activities Section */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Latest Activities
                </h2>
                <ActivitiesTable activities={activities} />
            </div>
        </div>
    );
}
