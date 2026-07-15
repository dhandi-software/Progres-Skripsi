import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Filter, ChevronDown, Check, Download, FileText, Table, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { adminApi } from "~/api/admin";
import { cn } from "~/lib/utils";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router";
import { DataTable, type Column } from "~/components/ui/table-user-dosen";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { ForceDeleteModal } from "~/components/ui/force-delete-modal";
import { CustomSelect } from "~/components/ui/custom-select";
import { Checkbox } from "~/components/ui/checkbox";
import { Toast, type ToastProps } from "~/components/ui/toast";

export function UserListDesktop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as "mahasiswa" | "dosen" | "staf") || "mahasiswa";

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterYear, setFilterYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [forceDeleteModalOpen, setForceDeleteModalOpen] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState("");

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Filter Dropdown State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Toast State
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);
  const showToast = (title: string, variant: "success" | "destructive" = "success") => {
    setToastProps({ title, variant });
    setTimeout(() => setToastProps(null), 5000);
  };

  useEffect(() => {
    if (location.state?.toast) {
      showToast(location.state.toast.title, location.state.toast.variant);
      // Clear location state to prevent toast from reappearing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsersByRole(activeTab, currentPage, itemsPerPage, debouncedSearch);
      setUsers(Array.isArray(res.data) ? res.data : []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on tab change
    setSearch(""); // Reset search on tab change
    setFilterYear("");
    setIsFilterOpen(false);
    setSelectedIds([]); // Clear selection on tab change
  }, [activeTab]);

  const handleTabChange = (tab: "mahasiswa" | "dosen" | "staf") => {
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
      // If we are deleting a batch
      if (selectedIds.length > 0 && !userToDelete) {
          try {
              const res = await adminApi.deleteUsersBatch(selectedIds);
              fetchUsers();
              setDeleteModalOpen(false);
              setSelectedIds([]);
              showToast(res.message);
          } catch (error: any) {
              const msg = error.response?.data?.message || "Failed to delete selected users";
              showToast(msg, "destructive");
              setDeleteModalOpen(false);
          }
          return;
      }

      if (!userToDelete) return;
      
      try {
          const res = await adminApi.deleteUser(userToDelete.id);
          fetchUsers(); // Refresh list
          setDeleteModalOpen(false);
          setUserToDelete(null);
          setSelectedIds(prev => prev.filter(id => id !== userToDelete.id)); // Remove from selection if it was there
          showToast(res.message || "User deleted successfully");
      } catch (error: any) {
          const message = error.response?.data?.message || "";
          // If the failure is due to active data, offer force delete via modal
          if (error.response?.status === 400 && (message.includes("data aktif") || message.includes("bimbingan"))) {
              setBlockingMessage(message);
              setDeleteModalOpen(false); // Close first modal
              setTimeout(() => setForceDeleteModalOpen(true), 300); // Small delay for smooth transition
              return;
          } else {
              const msg = error.response?.data?.message || "Failed to delete user";
              showToast(msg, "destructive");
              setDeleteModalOpen(false);
          }
      }
  };

  const handleForceDelete = async () => {
      if (!userToDelete) return;
      
      try {
          const res = await adminApi.deleteUser(userToDelete.id, true);
          fetchUsers();
          setForceDeleteModalOpen(false);
          setUserToDelete(null);
          setSelectedIds(prev => prev.filter(id => id !== userToDelete.id));
          showToast(res.message || "User deleted successfully");
      } catch (error: any) {
          const msg = error.response?.data?.message || "Failed to force delete user";
          showToast(msg, "destructive");
          setForceDeleteModalOpen(false);
      }
  };

  // --- Clear All Flow ---
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [forceClearAllModal1Open, setForceClearAllModal1Open] = useState(false);
  const [forceClearAllModal2Open, setForceClearAllModal2Open] = useState(false);
  const [clearAllInput, setClearAllInput] = useState("");
  const [clearAllBlockingMessage, setClearAllBlockingMessage] = useState("");

  const handleClearAllAccounts = async () => {
      try {
          const res = activeTab === "mahasiswa" 
              ? await adminApi.clearAllMahasiswa(false)
              : activeTab === "dosen"
                  ? await adminApi.clearAllDosen(false)
                  : { message: "Clear all staf not implemented" }; // Placeholder if needed
              
          fetchUsers();
          setClearAllConfirmOpen(false);
          setSelectedIds([]);
          showToast(res.message);
      } catch (error: any) {
          const resData = error.response?.data;
          if (resData?.requireForceAll) {
              setClearAllBlockingMessage(resData.message);
              setClearAllConfirmOpen(false);
              setTimeout(() => setForceClearAllModal1Open(true), 300);
          } else {
              showToast(resData?.message || `Gagal menghapus semua ${activeTab}`, "destructive");
              setClearAllConfirmOpen(false);
          }
      }
  };

  const handleForceClearAllAccounts = async () => {
      if (clearAllInput !== "HAPUS SEMUA") {
          showToast("Teks konfirmasi tidak sesuai", "destructive");
          return;
      }
      try {
          const res = activeTab === "mahasiswa"
              ? await adminApi.clearAllMahasiswa(true)
              : activeTab === "dosen"
                  ? await adminApi.clearAllDosen(true)
                  : { message: "Clear all staf not implemented" };
              
          fetchUsers();
          setForceClearAllModal2Open(false);
          setClearAllInput("");
          setSelectedIds([]);
          showToast(res.message);
      } catch (error: any) {
          showToast(error.response?.data?.message || `Gagal menghapus paksa semua ${activeTab}`, "destructive");
          setForceClearAllModal2Open(false);
      }
  };

  const handleToggleSelect = (id: number) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
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
        const matchesYear = filterYear
          ? user.tahunMasuk?.toString() === filterYear
          : true;

        return matchesYear;
      })
      .sort((a, b) => {
        const nameA = a.nama?.toLowerCase() || "";
        const nameB = b.nama?.toLowerCase() || "";
        if (sortOrder === "asc") return nameA.localeCompare(nameB);
        return nameB.localeCompare(nameA);
      });
  }, [users, sortOrder, filterYear]);

  // Use filtered results directly as they are already paginated from server (mostly)
  // but we still apply client-side sorting/year filter on the current page slice
  const paginatedUsers = filteredUsers;

  const handleSelectAll = (checked: boolean) => {
      if (checked) {
          const allIds = paginatedUsers.map(u => u.user?.id || u.userId || u.id);
          setSelectedIds(prev => {
              const newSet = new Set([...prev, ...allIds]);
              return Array.from(newSet);
          });
      } else {
          const pageIds = paginatedUsers.map(u => u.user?.id || u.userId || u.id);
          setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
      }
  };

  const isAllPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => 
      selectedIds.includes(u.user?.id || u.userId || u.id)
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Columns definition
  const columns: Column<any>[] = [
    {
      header: (
        <Checkbox 
          checked={isAllPageSelected}
          onCheckedChange={(checked) => handleSelectAll(!!checked)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: (user) => {
        const id = user.user?.id || user.userId || user.id;
        return (
          <Checkbox 
            checked={selectedIds.includes(id)}
            onCheckedChange={() => handleToggleSelect(id)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        )
      },
      width: "40px",
      stopRowClick: true,
    },
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
      header: activeTab === "mahasiswa" ? "NIM" : activeTab === "dosen" ? "NIDN" : "Username",
      accessorKey: activeTab === "mahasiswa" ? "nim" : activeTab === "dosen" ? "nidn" : "username",
      cell: (user) => (
        <span className="font-mono text-gray-600">
          {activeTab === "mahasiswa" ? user.nim : activeTab === "dosen" ? user.nidn : user.user?.username}
        </span>
      ),
    },
    {
      header: "Email",
      accessorKey: "email", 
      cell: (user) => <span className="text-gray-600">{user.email || user.user?.mahasiswa?.email || user.user?.dosen?.email || user.user?.staf?.email || user.user?.email || "-"}</span>,
    },
    ...(activeTab === "dosen" ? [{
      header: "Jabatan",
      accessorKey: "jabatan",
      cell: (user: any) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
          {user.jabatan}
        </span>
      ),
    }] : []),
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
                onClick={(e) => {
                     e.stopPropagation();
                     navigate(`/admin/edit-account/${user.user?.id || user.userId || user.id}`)
                }} 
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                title="Edit"
           >
                <Pencil size={18} />
           </button>
           <button 
                onClick={(e) => {
                     e.stopPropagation();
                     confirmDelete(user);
                }}
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

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    // Helper to load image
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    };

    try {
      // Load Logo
      const logoUrl = "https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png";
      const img = await loadImage(logoUrl);
      
      // Calculate center position
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      // Add Logo
      doc.addImage(img, "PNG", centerX - 10, 10, 20, 20);

      // Add University Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("FAKULTAS TEKNIK", centerX, 38, { align: "center" });
      doc.text("UNIVERSITAS PANCASILA", centerX, 44, { align: "center" });

      // Line Separator
      doc.setLineWidth(0.5);
      doc.line(14, 48, pageWidth - 14, 48);

      // Document Title
      doc.setFontSize(12);
      doc.text(`DATA ${activeTab.toUpperCase()}`, centerX, 55, { align: "center" });

      // Info Section (Tahun Akademik & Tanggal Cetak)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      const now = new Date();
      // Estimate Academic Year (Start roughly in August/September)
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      const academicYear = currentMonth >= 7 // August or later
          ? `${currentYear}/${currentYear + 1}`
          : `${currentYear - 1}/${currentYear}`;

      // Date Formatting: "15 Februari 2026"
      const dateString = now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
      });

      // Left column info
      doc.text(`Tahun Akademik : ${academicYear}`, 14, 65);
      // Right column info (approximate X for alignment)
      doc.text(`Tanggal Cetak  : ${dateString}`, pageWidth - 60, 65);


      // Define columns and rows
      const tableColumn = activeTab === "mahasiswa"
        ? ["No", "Name", "NIM", "Email", "Tahun Masuk"]
        : activeTab === "dosen"
            ? ["No", "Name", "NIDN", "Email", "Jabatan"]
            : ["No", "Name", "Username", "Email"];

      const tableRows = users.map((u, index) => {
        const email = u.email || u.user?.mahasiswa?.email || u.user?.dosen?.email || u.user?.staf?.email || u.user?.email || "-";
        if (activeTab === "mahasiswa") {
          return [index + 1, u.nama, u.nim, email, u.tahunMasuk];
        } else if (activeTab === "dosen") {
          return [index + 1, u.nama, u.nidn, email, u.jabatan];
        } else {
          return [index + 1, u.nama, u.user?.username, email];
        }
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70, // Start below the info section
        theme: "striped",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: [210, 80, 38], // #D25026 Orange
          textColor: [255, 255, 255],
          fontStyle: "bold",
          lineWidth: 0.1,
          lineColor: [210, 80, 38],
        },
        bodyStyles: {
          lineWidth: 0,
        },
        alternateRowStyles: {
            fillColor: [255, 245, 240] // Very light orange/gray
        },
        columnStyles: {
          0: { cellWidth: 10 }, // No
          1: { cellWidth: 40 }, // Name
          // ... auto for others
        },
      });

      doc.save(`${activeTab}_data.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF. check console for details.");
    }
  };

  return (
    <div className="p-8 w-full max-w-[1600px] mx-auto font-geist">
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={selectedIds.length > 0 && !userToDelete ? "Delete Multiple Users" : "Delete User"}
        itemName={userToDelete ? userToDelete.name : (selectedIds.length > 0 ? `${selectedIds.length} users` : "")}
        description={`Are you sure you want to delete ${userToDelete ? "this user" : "the selected users"}? This action cannot be undone.`}
      />

      <ForceDeleteModal
        isOpen={forceDeleteModalOpen}
        onClose={() => { setForceDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleForceDelete}
        title="Hapus Paksa Akun"
        itemName={userToDelete?.name || ""}
        description={blockingMessage}
      />

      {/* Clear All Flow Modals */}
      <DeleteConfirmationModal 
        isOpen={clearAllConfirmOpen}
        onClose={() => setClearAllConfirmOpen(false)}
        onConfirm={handleClearAllAccounts}
        title={`Hapus Seluruh ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        itemName=""
        description={`Apakah Anda yakin ingin menghapus seluruh akun ${activeTab}? Akun tanpa data terikat akan dihapus seketika.`}
      />

      <ForceDeleteModal
        isOpen={forceClearAllModal1Open}
        onClose={() => setForceClearAllModal1Open(false)}
        onConfirm={() => {
            setForceClearAllModal1Open(false);
            setTimeout(() => setForceClearAllModal2Open(true), 300);
        }}
        title="Peringatan Data Aktif"
        itemName={`SEMUA ${activeTab.toUpperCase()} TERSISA`}
        description={clearAllBlockingMessage}
      />

      {/* Validation 2 Modal: Require Input */}
      {forceClearAllModal2Open && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in-0">
             <div className="w-[90%] max-w-[450px] bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="bg-red-50 p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                     <AlertTriangle size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-red-900">Validasi Tahap Akhir!</h3>
               </div>
               <div className="p-6 text-center space-y-4">
                  <p className="text-sm text-gray-700">
                      Anda akan menghapus <span className="font-bold">SELURUH</span> {activeTab} beserta <span className="font-bold underline text-red-600">SELURUH RIWAYAT DATA</span> mereka.
                  </p>
                  <div className="space-y-2 mt-4 text-left">
                     <label className="text-xs font-semibold text-gray-500">Ketik <span className="text-red-600">HAPUS SEMUA</span> untuk mengkonfirmasi:</label>
                     <input 
                         type="text" 
                         value={clearAllInput}
                         onChange={(e) => setClearAllInput(e.target.value)}
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-center font-bold tracking-widest focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none uppercase"
                         placeholder="HAPUS SEMUA"
                     />
                  </div>
               </div>
               <div className="p-6 pt-0 flex gap-3">
                  <button onClick={() => setForceClearAllModal2Open(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Batal</button>
                  <button 
                      onClick={handleForceClearAllAccounts} 
                      disabled={clearAllInput !== "HAPUS SEMUA"}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Hapus Permanen
                  </button>
               </div>
             </div>
          </div>
      )}

      {/* Toast Notification */}
      {toastProps && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full">
            <Toast 
                {...toastProps} 
                onClose={() => setToastProps(null)} 
            />
        </div>
      )}

      {/* Search and Filters Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-center">
            <div>
                 <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                 <p className="text-gray-500 text-sm mt-1">Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} accounts.</p>
            </div>
             <div className="flex gap-3">
                 <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                 >
                    <Download size={16} />
                    Download PDF
                 </button>

                 <button
                      onClick={() => setClearAllConfirmOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors shadow-sm"
                 >
                      <Trash2 size={16} />
                      Hapus Semua
                 </button>

                 <Link
                    to={`/admin/create-account?role=${activeTab}`}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-700 text-white rounded-lg text-sm font-medium hover:bg-pink-800 transition-colors shadow-sm"
                  >
                    <div className="bg-white/20 p-0.5 rounded">
                       <Plus size={16} className="text-white" />
                    </div>
                    Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </Link>

                  {selectedIds.length > 0 && (
                      <button
                        onClick={() => {
                            setUserToDelete(null); // Ensure single user is null for batch mode
                            setDeleteModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm animate-in fade-in slide-in-from-right-2"
                      >
                        <Trash2 size={16} />
                        Delete {selectedIds.length} Selected
                      </button>
                  )}
             </div>
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
        {(["mahasiswa", "dosen", "staf"] as const).map((tab) => (
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
            onRowClick={(user) => navigate(`/admin/edit-account/${user.user?.id || user.userId || user.id}`)}
        />

        {/* Pagination */}
        {totalPages > 1 && !loading && (
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                    </PaginationItem>
                    
                    {(() => {
                        let pages: (number | string)[] = [];
                        if (totalPages <= 7) {
                            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                        } else {
                            if (currentPage <= 4) {
                                pages = [1, 2, 3, 4, 5, 'ellipsis-1', totalPages];
                            } else if (currentPage >= totalPages - 3) {
                                pages = [1, 'ellipsis-2', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                            } else {
                                pages = [1, 'ellipsis-1', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-2', totalPages];
                            }
                        }

                        return pages.map((page, idx) => {
                            if (typeof page === 'string') {
                                return <PaginationEllipsis key={`ellipsis-${idx}`} />;
                            }
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink 
                                        href="#" 
                                        isActive={currentPage === page}
                                        onClick={(e) => { e.preventDefault(); handlePageChange(page as number); }}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        });
                    })()}

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
