import { Users, UserPlus, UserCheck, Shield, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { adminApi } from "~/api/admin";
import { StatisticCard } from "~/features/admin/dashboard/components";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "~/components/ui/pagination";

export function DashboardDesktop() {
    const [loading, setLoading] = useState(true);
    const [loadingMonitoring, setLoadingMonitoring] = useState(false);
    const [showWelcomeToast, setShowWelcomeToast] = useState(false);
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
        const justLoggedIn = sessionStorage.getItem("justLoggedIn");
        if (justLoggedIn === "true") {
            setShowWelcomeToast(true);
            sessionStorage.removeItem("justLoggedIn");
        }
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsRes = await adminApi.getDashboardStats();
                const adminRes = await adminApi.getUserCountByRole("admin");
                setStatsData({
                    totalMahasiswa: Number((statsRes as any).activeStudent || 0),
                    totalDosen: Number((statsRes as any).totalDosen || 0),
                    totalAdmin: Number(adminRes.data?.count ?? (adminRes as any).count ?? 0),
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
                
                // monRes is already the parsed JSON object: { data: [...], meta: {...} }
                const responseData = monRes as any;
                if (responseData && responseData.data) {
                    setMonitoringData(responseData.data);
                    setTotalPages(responseData.meta?.totalPages || 1);
                } else {
                    // Fallback if backend hasn't updated format yet
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
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Monitoring Bimbingan Dosen</h2>
                        <p className="text-sm text-gray-500">List of Lecturers and their supervised Students.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Cari Dosen atau Mahasiswa..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="relative w-full md:w-auto">
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
                                <option value="ALL">Semua</option>
                                <option value="SUDAH">Sudah Bimbingan</option>
                                <option value="BELUM">Belum Bimbingan</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
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
                            {loadingMonitoring ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                        Loading monitoring data...
                                    </td>
                                </tr>
                            ) : monitoringData.length === 0 ? (
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
                {/* Pagination */}
                {totalPages >= 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
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
                                        Page {page} of {totalPages}
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
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="text-xs text-gray-700 font-medium truncate max-w-[200px]" title={mhs.judulSkripsi}>{mhs.judulSkripsi}</p>
                                                {mhs.pengujiNama && (
                                                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium border border-purple-100">
                                                        Penguji: {mhs.pengujiNama}
                                                    </span>
                                                )}
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
