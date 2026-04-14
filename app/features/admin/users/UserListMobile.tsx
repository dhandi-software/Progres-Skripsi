import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, Monitor, Pencil, Trash2, Check, X, ChevronRight, MoreVertical } from "lucide-react";
import { adminApi } from "~/api/admin";
import { cn } from "~/lib/utils";
import { CreateAccountMobile } from "../create-account/CreateAccountMobile";
import { useNavigate } from "react-router";
import { Checkbox } from "~/components/ui/checkbox";
import { DeleteConfirmationModal } from "~/components/ui/delete-confirmation-modal";
import { ForceDeleteModal } from "~/components/ui/force-delete-modal";
import { Toast, type ToastProps } from "~/components/ui/toast";
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "~/components/ui/drawer";
import { useSidebar } from "~/components/ui/sidebar";

export default function UserListMobile() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"mahasiswa" | "dosen">("mahasiswa");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState("");
    
    // Selection & Delete state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
    const [forceDeleteModalOpen, setForceDeleteModalOpen] = useState(false);
    const [blockingMessage, setBlockingMessage] = useState("");

    // Toast State
    const [toastProps, setToastProps] = useState<ToastProps | null>(null);
    const showToast = (title: string, variant: "success" | "destructive" = "success") => {
        setToastProps({ title, variant });
        setTimeout(() => setToastProps(null), 5000);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.getUsersByRole(activeTab);
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
        setSelectedIds([]);
        setSearch("");
    }, [activeTab]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const searchLower = search.toLowerCase();
            return (
                user.nama?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                (user.nim && user.nim.toLowerCase().includes(searchLower)) ||
                (user.nidn && user.nidn.toLowerCase().includes(searchLower))
            );
        });
    }, [users, search]);

    const handleToggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredUsers.map(u => u.user?.id || u.userId || u.id));
        }
    };

    const handleDelete = async () => {
        if (selectedIds.length > 0 && !userToDelete) {
            try {
                const res = await adminApi.deleteUsersBatch(selectedIds);
                fetchUsers();
                setDeleteModalOpen(false);
                setSelectedIds([]);
                showToast(res.message);
            } catch (error: any) {
                const msg = error.response?.data?.message || "Gagal menghapus beberapa user";
                showToast(msg, "destructive");
                setDeleteModalOpen(false);
            }
            return;
        }

        if (!userToDelete) return;
        try {
            const res = await adminApi.deleteUser(userToDelete.id);
            fetchUsers();
            setDeleteModalOpen(false);
            setUserToDelete(null);
            setSelectedIds(prev => prev.filter(id => id !== userToDelete.id));
            showToast(res.message || "User berhasil dihapus");
        } catch (error: any) {
            const message = error.response?.data?.message || "";
            
            // If the failure is due to active data, offer force delete via modal
            if (error.response?.status === 400 && (message.includes("data aktif") || message.includes("bimbingan"))) {
                setBlockingMessage(message);
                setDeleteModalOpen(false); // Close first modal
                setTimeout(() => setForceDeleteModalOpen(true), 300); // Small delay for smooth transition
                return;
            } else {
                const msg = error.response?.data?.message || "Gagal menghapus user";
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
            showToast(res.message || "User berhasil dihapus");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Gagal menghapus user secara paksa";
            showToast(msg, "destructive");
            setForceDeleteModalOpen(false);
        }
    };

    const confirmDelete = (user: any) => {
        const id = user.user?.id || user.userId || user.id;
        setUserToDelete({ id, name: user.nama });
        setDeleteModalOpen(true);
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 pb-24 font-geist">
            <DeleteConfirmationModal 
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={selectedIds.length > 0 && !userToDelete ? "Hapus Beberapa User" : "Hapus User"}
                itemName={userToDelete ? userToDelete.name : (selectedIds.length > 0 ? `${selectedIds.length} user` : "")}
                description="Apakah Anda yakin ingin menghapus data ini secara permanen?"
            />

            <ForceDeleteModal
                isOpen={forceDeleteModalOpen}
                onClose={() => { setForceDeleteModalOpen(false); setUserToDelete(null); }}
                onConfirm={handleForceDelete}
                title="Hapus Paksa Akun"
                itemName={userToDelete?.name || ""}
                description={blockingMessage}
            />

            {/* Toast Notification */}
            {toastProps && (
                <div className="fixed top-6 left-6 right-6 z-[100] animate-in slide-in-from-top-full">
                    <Toast 
                        {...toastProps} 
                        onClose={() => setToastProps(null)} 
                    />
                </div>
            )}

             <div className="bg-white px-5 py-6 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-900">User Management</h1>
                    <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DrawerTrigger asChild>
                             <button className="w-10 h-10 bg-[#D25026] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                                <Plus size={20} />
                            </button>
                        </DrawerTrigger>
                        <DrawerContent className="h-[92vh]">
                             <div className="h-full overflow-y-auto">
                                <CreateAccountMobile />
                             </div>
                        </DrawerContent>
                    </Drawer>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
                    {(["mahasiswa", "dosen"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize",
                                activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="search"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#D25026]/20 transition-all"
                    />
                </div>
            </div>

            {/* Selection Toolbar (Floating at bottom but above navbar) */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-20 left-4 right-4 bg-gray-900 text-white p-4 rounded-2xl shadow-xl z-30 flex justify-between items-center animate-in slide-in-from-bottom-5">
                    <div className="flex items-center gap-3">
                         <button onClick={() => setSelectedIds([])} className="p-1 hover:bg-white/10 rounded-full">
                            <X size={18} />
                         </button>
                         <span className="text-sm font-medium">{selectedIds.length} terpilih</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
                        >
                            {selectedIds.length === filteredUsers.length ? "Deselect All" : "Select All"}
                        </button>
                        <button 
                            onClick={() => { setUserToDelete(null); setDeleteModalOpen(true); }}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                            <Trash2 size={14} /> Hapus
                        </button>
                    </div>
                </div>
            )}

            {/* User List Containers */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-[#D25026]/20 border-t-[#D25026] rounded-full animate-spin" />
                        <span className="text-gray-500 text-sm animate-pulse">Memuat data...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Monitor size={48} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const id = user.user?.id || user.userId || user.id;
                        const isSelected = selectedIds.includes(id);

                        return (
                            <div 
                                key={id}
                                onClick={() => handleToggleSelect(id)}
                                className={cn(
                                    "bg-white p-4 rounded-2xl border transition-all flex items-center gap-4 active:scale-[0.98]",
                                    isSelected ? "border-[#D25026] ring-1 ring-[#D25026]/10" : "border-gray-100"
                                )}
                            >
                                <Checkbox 
                                    checked={isSelected}
                                    onCheckedChange={() => handleToggleSelect(id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="border-gray-300"
                                />

                                <div className="flex-1 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${user.nama}&background=random`} 
                                            alt={user.nama} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-gray-900 text-sm truncate">{user.nama}</span>
                                        <span className="text-xs text-gray-500 font-mono truncate">
                                            {activeTab === 'mahasiswa' ? user.nim : user.nidn}
                                        </span>
                                        <span className="text-[10px] text-gray-400 truncate mt-0.5">{user.email || user.user?.email || '-'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/admin/edit-account/${id}`);
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-600 active:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                confirmDelete(user);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 active:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded-md uppercase tracking-wider">
                                        {activeTab === 'mahasiswa' ? user.tahunMasuk || 'N/A' : user.jabatan?.split(' ')[0]}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

