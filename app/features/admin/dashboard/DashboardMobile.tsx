import {
    Users,
    UserCheck,
    Shield,
    Menu,
    Loader2,
    UserPlus,
    Search,
    Filter,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "~/api/admin";
import { StatisticCard } from "~/features/admin/dashboard/components";
import { useSidebar } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";
export function DashboardMobile() {
    const { setOpenMobile } = useSidebar();
    const [loading, setLoading] = useState(true);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);
    const [statsData, setStatsData] = useState({
        totalMahasiswa: 0,
        totalDosen: 0,
        totalAdmin: 0,
    });
    const [monitoringData, setMonitoringData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch Mahasiswa Count
                const mhsRes = await adminApi.getUserCountByRole("mahasiswa");
                const mhsCount = mhsRes.data?.count ?? (mhsRes as any).count ?? 0;

                // Fetch Dosen Count
                const dosenRes = await adminApi.getUserCountByRole("dosen");
                const dosenCount = dosenRes.data?.count ?? (dosenRes as any).count ?? 0;

                // Fetch Admin Count
                const adminRes = await adminApi.getUserCountByRole("admin");
                const adminCount = adminRes.data?.count ?? (adminRes as any).count ?? 0;

                setStatsData({
                    totalMahasiswa: Number(mhsCount),
                    totalDosen: Number(dosenCount),
                    totalAdmin: Number(adminCount),
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const fetchMonitoring = async () => {
            setLoadingMonitoring(true);
            try {
                const filterParam = statusFilter === 'ALL' ? '' : statusFilter;
                const monRes = await adminApi.getMonitoringData(debouncedSearch, filterParam, page, 10);
                
                const responseData = monRes as any;
                if (responseData && responseData.data) {
                    setMonitoringData(responseData.data);
                    setTotalPages(responseData.meta?.totalPages || 1);
                } else {
                    setMonitoringData(responseData || []);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching monitoring data:", error);
            } finally {
                setLoadingMonitoring(false);
                setLoading(false);
            }
        };
        fetchMonitoring();
    }, [debouncedSearch, statusFilter, page]);

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

             <div className="px-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Monitoring Bimbingan Dosen</h2>
                    <p className="text-sm text-gray-500 mb-2">Pantau status bimbingan mahasiswa.</p>
                    
                    {/* Search Input */}
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Cari Dosen/Mahasiswa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            className="block w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="SUDAH">Sudah Bimbingan</option>
                            <option value="BELUM">Belum Bimbingan</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                    {loadingMonitoring ? (
                        <div className="py-8 text-center text-gray-400 text-sm">
                            Loading monitoring data...
                        </div>
                    ) : monitoringData.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-500">No monitoring data available.</p>
                        </div>
                    ) : (
                        monitoringData.map((dosen) => (
                            <DosenCardMobile key={dosen.id} dosen={dosen} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages >= 1 && (
                    <div className="py-4 mt-2">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page > 1) setPage(page - 1);
                                        }}
                                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="text-sm text-gray-600 px-4">
                                        Page {page} / {totalPages}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (page < totalPages) setPage(page + 1);
                                        }}
                                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for Mobile
function DosenCardMobile({ dosen }: { dosen: any }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">{dosen.nama}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-1">{dosen.nidn}</p>
                    <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">{dosen.jabatan}</span>
                        <span className="text-xs font-medium text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
                            {dosen.totalBimbingan} Bimbingan
                        </span>
                    </div>
                </div>
                <div className="text-gray-400 ml-2">
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
            
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-[11px] uppercase tracking-wider">Mahasiswa Bimbingan ({dosen.mahasiswaBimbingan.length})</h4>
                    {dosen.mahasiswaBimbingan.length === 0 ? (
                        <p className="text-gray-400 italic text-xs">Tidak ada mahasiswa yang sesuai pencarian.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {dosen.mahasiswaBimbingan.map((mhs: any) => (
                                <div key={mhs.id} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm leading-tight">{mhs.nama}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{mhs.nim}</p>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] px-1.5 py-0.5 rounded font-medium uppercase shrink-0 ml-2",
                                            mhs.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        )}>
                                            {mhs.status || "Ongoing"}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        <p className="text-[11px] text-gray-600 font-medium mb-1 line-clamp-2" title={mhs.judulSkripsi}>
                                            Judul: {mhs.judulSkripsi}
                                        </p>
                                        {mhs.pengujiNama && (
                                            <span className="inline-block mt-1 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium border border-purple-100">
                                                Penguji: {mhs.pengujiNama}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
