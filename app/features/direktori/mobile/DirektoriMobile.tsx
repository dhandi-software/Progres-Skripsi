import { useState, useEffect } from "react";
import { Search, Users, User, Shield, GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import { direktoriApi } from "~/api/direktoriApi";
import type { DirectoryUser } from "~/api/direktoriApi";
import { profileApi } from "~/api/profileApi";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

export function DirektoriMobile() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<DirectoryUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"SEMUA" | "MAHASISWA" | "DOSEN" | "STAF" | "ADMIN">("SEMUA");
    
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await direktoriApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch directory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (userId: number) => {
        setSelectedUserId(userId);
        setProfileModalOpen(true);
    };

    const getRoleIcon = (role: string) => {
        switch (role.toUpperCase()) {
            case "MAHASISWA": return <GraduationCap className="w-3.5 h-3.5 text-blue-500" />;
            case "DOSEN": return <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
            case "STAF": return <Users className="w-3.5 h-3.5 text-orange-500" />;
            case "ADMIN": return <Shield className="w-3.5 h-3.5 text-purple-500" />;
            default: return <User className="w-3.5 h-3.5 text-gray-500" />;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role.toUpperCase()) {
            case "MAHASISWA": return <span className="text-blue-700 text-[10px] font-bold">Mahasiswa</span>;
            case "DOSEN": return <span className="text-emerald-700 text-[10px] font-bold">Dosen</span>;
            case "STAF": return <span className="text-orange-700 text-[10px] font-bold">Staf</span>;
            case "ADMIN": return <span className="text-purple-700 text-[10px] font-bold">Admin</span>;
            default: return <span className="text-gray-700 text-[10px] font-bold">{role}</span>;
        }
    };

    const filteredUsers = users.filter(u => {
        if (currentUser && u.id === currentUser.id) return false;
        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "SEMUA" || u.role.toUpperCase() === roleFilter.toUpperCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-geist">
            {/* Header Sticky */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center gap-3">
                    <h1 className="text-lg font-bold text-gray-900 line-clamp-1">Direktori Pengguna</h1>
                </div>
                
                <div className="px-4 pb-3 space-y-3">
                    <div className="relative w-full" style={{ flex: '1 1 auto' }}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <Input 
                            type="text" 
                            placeholder="Cari pengguna..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="pl-9 pr-4 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-[#119DA4] text-sm h-10"
                            style={{ display: 'block', width: '100%' }}
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {(["SEMUA", "DOSEN", "MAHASISWA", "STAF"] as const).map(role => (
                            <Button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                variant="ghost"
                                size="sm"
                                className={`rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                    roleFilter === role 
                                        ? "!bg-[#119DA4] hover:!bg-[#0D7C82] !text-white shadow-sm border-none" 
                                        : "bg-white !text-gray-500 border border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {role === "SEMUA" ? "Semua Role" : role.charAt(0) + role.slice(1).toLowerCase()}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    [1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                            <div className="flex-1">
                                <div className="w-32 h-4 bg-gray-200 rounded-full mb-2"></div>
                                <div className="w-20 h-3 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    ))
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white py-12 px-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center mt-8 mx-2 w-full" style={{ width: '100%', minWidth: '100%' }}>
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-7 h-7 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">Tidak ditemukan</h3>
                        <p className="text-xs text-gray-500">Tidak ada pengguna yang cocok dengan pencarian "{searchQuery}" untuk filter yang dipilih.</p>
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div 
                            key={user.id} 
                            onClick={() => handleCardClick(user.id)}
                            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-full border border-gray-100 shrink-0 relative flex items-center justify-center overflow-hidden">
                                {user.photo ? (
                                    <img 
                                        src={profileApi.getProfilePhotoUrl(user.photo)} 
                                        alt={user.username}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full bg-gradient-to-br from-[#119DA4] to-[#0D7C82] flex items-center justify-center text-white text-lg font-bold ${user.photo ? 'hidden' : ''}`}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 mb-1 break-words">
                                    {user.username}
                                </h3>
                                <div className="flex items-center gap-1.5">
                                    <div className={`p-1 rounded-md ${
                                        user.role.toUpperCase() === 'MAHASISWA' ? 'bg-blue-50' :
                                        user.role.toUpperCase() === 'DOSEN' ? 'bg-emerald-50' :
                                        user.role.toUpperCase() === 'STAF' ? 'bg-orange-50' : 'bg-purple-50'
                                    }`}>
                                        {getRoleIcon(user.role)}
                                    </div>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>

                            <div className="p-2 text-gray-400">
                                <ChevronRight className="w-5 h-5" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Profile Modal */}
            {selectedUserId && (
                <PublicProfileModal
                    userId={selectedUserId}
                    open={profileModalOpen}
                    onOpenChange={setProfileModalOpen}
                />
            )}
        </div>
    );
}
