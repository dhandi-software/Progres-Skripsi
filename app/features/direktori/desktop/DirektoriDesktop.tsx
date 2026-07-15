import { useState, useEffect } from "react";
import { Search, Users, User, Shield, GraduationCap, Briefcase } from "lucide-react";
import { direktoriApi } from "~/api/direktoriApi";
import type { DirectoryUser } from "~/api/direktoriApi";
import { profileApi } from "~/api/profileApi";
import { PublicProfileModal } from "~/components/profile/PublicProfileModal";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";

export function DirektoriDesktop() {
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
            case "MAHASISWA": return <GraduationCap className="w-4 h-4 text-blue-500" />;
            case "DOSEN": return <Briefcase className="w-4 h-4 text-emerald-500" />;
            case "STAF": return <Users className="w-4 h-4 text-orange-500" />;
            case "ADMIN": return <Shield className="w-4 h-4 text-purple-500" />;
            default: return <User className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role.toUpperCase()) {
            case "MAHASISWA": return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Mahasiswa</span>;
            case "DOSEN": return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Dosen</span>;
            case "STAF": return <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Staf</span>;
            case "ADMIN": return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Admin</span>;
            default: return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{role}</span>;
        }
    };

    const filteredUsers = users.filter(u => {
        if (currentUser && u.id === currentUser.id) return false;
        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "SEMUA" || u.role.toUpperCase() === roleFilter.toUpperCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="p-8 font-geist">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Direktori Pengguna</h1>
                <p className="text-gray-500">Cari dan lihat profil seluruh pengguna sistem</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col lg:flex-row gap-6 items-center justify-between w-full">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    <Input
                        type="text"
                        placeholder="Cari nama pengguna..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="pl-12 pr-4 bg-gray-50 border-gray-200 rounded-xl focus-visible:ring-[#119DA4]"
                        style={{ display: 'block', width: '100%' }}
                    />
                </div>

                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 shrink-0">
                    {(["SEMUA", "DOSEN", "MAHASISWA", "STAF"] as const).map(role => (
                        <Button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            variant="ghost"
                            className={`rounded-lg text-sm font-bold whitespace-nowrap transition-all ${roleFilter === role
                                ? "bg-white !text-gray-900 shadow-sm border border-gray-200 hover:bg-gray-50"
                                : "!text-gray-500 hover:!text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {role === "SEMUA" ? "Semua Role" : role.charAt(0) + role.slice(1).toLowerCase()}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col items-center">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
                            <div className="w-32 h-5 bg-gray-200 rounded-full mb-3"></div>
                            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white py-16 px-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center mt-8 w-full" style={{ width: '100%', minWidth: '100%' }}>
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Tidak ditemukan</h3>
                    <p className="text-gray-500">Tidak ada pengguna yang cocok dengan pencarian "{searchQuery}" untuk filter yang dipilih.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => handleCardClick(user.id)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group hover:border-[#119DA4]/30"
                        >
                            <div className="h-20 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 relative group-hover:from-[#119DA4]/5 group-hover:to-[#0D7C82]/5 transition-colors"></div>

                            <div className="px-6 pb-6 pt-0 flex flex-col items-center -mt-10 relative">
                                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-sm mb-3">
                                    {user.photo ? (
                                        <img
                                            src={profileApi.getProfilePhotoUrl(user.photo)}
                                            alt={user.username}
                                            className="w-full h-full object-cover rounded-full bg-gray-100"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full rounded-full bg-gradient-to-br from-[#119DA4] to-[#0D7C82] flex items-center justify-center text-white text-2xl font-bold ${user.photo ? 'hidden' : ''}`}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <h3 className="text-base font-bold text-gray-900 text-center mb-2 group-hover:text-[#119DA4] transition-colors break-words w-full px-2">
                                    {user.username}
                                </h3>

                                <div className="flex items-center gap-1.5 justify-center mb-4">
                                    {getRoleIcon(user.role)}
                                    {getRoleBadge(user.role)}
                                </div>

                                <button className="w-full py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 group-hover:bg-[#119DA4] group-hover:text-white group-hover:border-[#119DA4] transition-all">
                                    Lihat Profil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
