import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Filter, ChevronDown, Check } from "lucide-react";
import { adminApi } from "~/api/admin";
import { cn } from "~/lib/utils";
import { Link, useSearchParams, useNavigate } from "react-router";
import { DataTable, type Column } from "~/components/ui/table-user-dosen";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { CustomSelect } from "~/components/ui/custom-select";

export default function UserListDesktop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as "mahasiswa" | "dosen") || "mahasiswa";

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterYear, setFilterYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);

  // Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsersByRole(activeTab);
      // Ensure data is array
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1); // Reset page on tab change
    setSearch(""); // Reset search on tab change
    setFilterYear("");
    setIsFilterOpen(false);
  }, [activeTab]);

  const handleTabChange = (tab: "mahasiswa" | "dosen") => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tab);
      return newParams;
    });
  };

  const confirmDelete = (user: any) => {
      // Handle both nested user object or flat structure if any
      const id = user.user?.id || user.userId || user.id; // Fallback
      setUserToDelete({ id, name: user.nama });
      setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
      if (!userToDelete) return;
      
      try {
          await adminApi.deleteUser(userToDelete.id);
          fetchUsers(); // Refresh list
          setDeleteModalOpen(false);
          setUserToDelete(null);
      } catch (error) {
          console.error("Failed to delete user", error);
          alert("Failed to delete user");
      }
  };

  // Filter & Pagination Logic
  const uniqueYears = useMemo(() => {
      if (activeTab !== "mahasiswa") return [];
      const years = users.map(u => u.tahunMasuk).filter(Boolean);
      return Array.from(new Set(years)).sort().reverse();
  }, [users, activeTab]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          user.nama?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          (user.nim && user.nim.toLowerCase().includes(searchLower)) ||
          (user.nidn && user.nidn.toLowerCase().includes(searchLower)) ||
          (user.jurusan && user.jurusan.toLowerCase().includes(searchLower)) ||
          (user.jabatan && user.jabatan.toLowerCase().includes(searchLower));

        const matchesYear = filterYear
          ? user.tahunMasuk?.toString() === filterYear
          : true;

        return matchesSearch && matchesYear;
      })
      .sort((a, b) => {
        const nameA = a.nama?.toLowerCase() || "";
        const nameB = b.nama?.toLowerCase() || "";
        if (sortOrder === "asc") return nameA.localeCompare(nameB);
        return nameB.localeCompare(nameA);
      });
  }, [users, search, sortOrder, filterYear]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Columns definition
  const columns: Column<any>[] = [
    {
      header: "No",
      cell: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
      width: "60px",
    },
    {
      header: "Name",
      accessorKey: "nama",
      cell: (user) => (
         <div className="flex items-center gap-3">
            <div className="w-9 h-9 relative rounded-[40px] bg-gray-200 overflow-hidden flex-shrink-0">
                 <img src={`https://ui-avatars.com/api/?name=${user.nama}&background=random`} alt={user.nama} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
                <span className="font-medium text-gray-900">{user.nama}</span>
            </div>
         </div>
      )
    },
    {
      header: activeTab === "mahasiswa" ? "NIM" : "NIDN",
      accessorKey: activeTab === "mahasiswa" ? "nim" : "nidn",
      cell: (user) => (
        <span className="font-mono text-gray-600">
          {activeTab === "mahasiswa" ? user.nim : user.nidn}
        </span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email", 
      cell: (user) => <span className="text-gray-600">{user.email || user.user?.email || "-"}</span>,
    },
    {
      header: activeTab === "mahasiswa" ? "Jurusan" : "Jabatan",
      accessorKey: activeTab === "mahasiswa" ? "jurusan" : "jabatan",
      cell: (user) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
          {activeTab === "mahasiswa" ? user.jurusan : user.jabatan}
        </span>
      ),
    },
    ...(activeTab === "mahasiswa"
      ? [
          {
            header: "Tahun Masuk",
            accessorKey: "tahunMasuk",
            cell: (user: any) => (
              <span className="text-gray-600">{user.tahunMasuk || "-"}</span>
            ),
          },
        ]
      : []),
    {
      header: "Actions",
      cell: (user) => (
        <div className="flex justify-end gap-2">
           <button 
                onClick={() => navigate(`/admin/edit-account/${user.user?.id || user.userId}`)} 
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                title="Edit"
           >
                <Pencil size={18} />
           </button>
           <button 
                onClick={() => confirmDelete(user)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                title="Delete"
           >
                <Trash2 size={18} />
           </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto font-geist">
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        itemName={userToDelete?.name}
        description="Are you sure you want to delete this user? This action cannot be undone."
      />

      {/* Search and Filters Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                 <p className="text-gray-500 text-sm mt-1">Manage {activeTab === "mahasiswa" ? "Mahasiswa" : "Dosen"} accounts.</p>
            </div>
             <Link
                to={`/admin/create-account?role=${activeTab}`}
                className="flex items-center gap-2 px-4 py-2 bg-pink-700 text-white rounded-lg text-sm font-medium hover:bg-pink-800 transition-colors shadow-sm"
              >
                <div className="bg-white/20 p-0.5 rounded">
                   <Plus size={16} className="text-white" />
                </div>
                Create New {activeTab === "mahasiswa" ? "Mahasiswa" : "Dosen"}
              </Link>
        </div>

        {/* Filter Bar */}
        <div className="w-full inline-flex justify-between items-center">
            {/* Left side filters */}
            <div className="flex justify-start items-center gap-4 relative">
                 {/* Filter Dropdown */}
                 <div className="relative">
                     <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={cn(
                            "px-3 py-2 rounded-xl border flex justify-center items-center cursor-pointer transition-colors gap-2 text-sm font-medium",
                            isFilterOpen || filterYear ? "bg-orange-50 border-orange-200 text-orange-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        )}
                     >
                        <Filter size={16} />
                        <span>Filter</span>
                        {(filterYear) && <div className="w-2 h-2 rounded-full bg-orange-600 ml-1" />}
                     </button>

                     {/* Custom Filter Popover/Menu */}
                     {isFilterOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-40 animate-in fade-in-0 zoom-in-95 duration-200">
                             <div className="flex flex-col gap-4">
                                 {/* Sort Order */}
                                 <div className="space-y-2">
                                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort Order</label>
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={() => setSortOrder('asc')}
                                            className={cn("flex items-center justify-between flex-1 px-3 py-2 rounded-lg text-sm border", sortOrder === 'asc' ? "border-orange-200 bg-orange-50 text-orange-700" : "border-gray-100 hover:bg-gray-50")}
                                         >
                                            <span>A-Z</span>
                                            {sortOrder === 'asc' && <Check size={14} />}
                                         </button>
                                         <button 
                                            onClick={() => setSortOrder('desc')}
                                            className={cn("flex items-center justify-between flex-1 px-3 py-2 rounded-lg text-sm border", sortOrder === 'desc' ? "border-orange-200 bg-orange-50 text-orange-700" : "border-gray-100 hover:bg-gray-50")}
                                         >
                                            <span>Z-A</span>
                                            {sortOrder === 'desc' && <Check size={14} />}
                                         </button>
                                     </div>
                                 </div>

                                 {/* Year Filter (Mahasiswa only) */}
                                 {activeTab === 'mahasiswa' && (
                                     <div className="space-y-2">
                                         <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tahun Masuk</label>
                                         <div className="relative">
                                         <CustomSelect 
                                             options={[
                                                 { label: "All Years", value: "all" }, // specific handling for empty value might differ
                                                 ...uniqueYears.map(year => ({ label: year.toString(), value: year.toString() }))
                                             ]}
                                             value={filterYear || "all"} 
                                             onChange={(val) => setFilterYear(val === "all" ? "" : val)}
                                             placeholder="All Years"
                                             className="w-full"
                                         />
                                         </div>
                                     </div>
                                 )}

                                 <div className="pt-2 border-t border-gray-100">
                                     <button 
                                        onClick={() => { setFilterYear(""); setSortOrder("asc"); setIsFilterOpen(false); }}
                                        className="w-full py-2 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                                     >
                                         Reset Filters
                                     </button>
                                 </div>
                             </div>
                        </div>
                     )}
                 </div>

                 {/* Active Filters Display Chips */}
                 {filterYear && (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100">
                         <span>Year: {filterYear}</span>
                         <button onClick={() => setFilterYear("")} className="hover:bg-orange-200 rounded-full p-0.5 transition-colors">
                             <Plus size={12} className="rotate-45" />
                         </button>
                     </div>
                 )}
            </div>

            {/* Right side search */}
            <div className="flex justify-start items-center gap-3">
                 <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all w-64"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                 </div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(["mahasiswa", "dosen"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="space-y-4">
        <DataTable
            data={paginatedUsers}
            columns={columns}
            isLoading={loading}
            emptyMessage={`No ${activeTab} found matching your search.`}
        />

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && !loading && (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                         if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                             if (Math.abs(page - currentPage) === 3) return <PaginationEllipsis key={page} />;
                             return null;
                         }

                         return (
                            <PaginationItem key={page}>
                                <PaginationLink 
                                    href="#" 
                                    isActive={currentPage === page}
                                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                         )
                    })}

                    <PaginationItem>
                        <PaginationNext 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )}
      </div>

      {/* Overlay for Dropdown click outside */}
      {isFilterOpen && (
          <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setIsFilterOpen(false)} />
      )}
    </div>
  );
}
