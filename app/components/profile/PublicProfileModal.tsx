import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import Avatar, { AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { profileApi } from "~/api/profileApi";
import { Loader2, User, Mail, Phone, Briefcase, GraduationCap, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface PublicProfileModalProps {
    userId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PublicProfileModal({ userId, open, onOpenChange }: PublicProfileModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && userId) {
            fetchProfile(userId);
        } else {
            setProfile(null);
            setError(null);
        }
    }, [open, userId]);

    const fetchProfile = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileApi.getPublicProfile(id);
            setProfile(data);
        } catch (err: any) {
            setError(err.message || "Gagal memuat profil");
        } finally {
            setLoading(false);
        }
    };

    const getAvatarInitials = (name: string) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-3xl border-none shadow-2xl">
                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#119DA4] to-[#0D7C82] pointer-events-none" />
                
                <DialogHeader className="p-0 m-0">
                    <DialogTitle className="hidden">Profil Pengguna</DialogTitle>
                    <DialogDescription className="hidden">Detail profil pengguna.</DialogDescription>
                </DialogHeader>
                
                <div className="h-32 w-full" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#119DA4] animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-500">Memuat detail profil...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <X className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-red-500">{error}</p>
                        <button onClick={() => onOpenChange(false)} className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold text-gray-700 transition-colors">Tutup</button>
                    </div>
                ) : profile ? (
                    <div className="flex flex-col items-center pb-8">
                        <div className="relative -mt-16 mb-4">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-xl bg-gray-100" src={profile.photo ? profileApi.getProfilePhotoUrl(profile.photo) : ""}>
                                <AvatarImage src={profile.photo ? profileApi.getProfilePhotoUrl(profile.photo) : ""} />
                                <AvatarFallback className="text-4xl font-black text-gray-400">
                                    {getAvatarInitials(profile.nama || profile.email)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm" />
                        </div>

                        <div className="text-center px-6 mb-8 w-full">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">{profile.nama || "Unknown"}</h2>
                            <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                {profile.role}
                            </div>
                            <p className="text-sm text-gray-500 font-medium">{profile.subRole}</p>
                        </div>

                        <div className="w-full px-6 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    {profile.role === 'MAHASISWA' ? <GraduationCap className="w-5 h-5 text-indigo-500" /> : <Briefcase className="w-5 h-5 text-indigo-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{profile.role === 'MAHASISWA' ? 'NPM' : 'NIDN/ID'}</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{profile.identitas}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <Mail className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Terdaftar</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                    <Phone className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nomor Telepon</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{profile.nomorTelepon || <span className="text-gray-400 italic font-normal">Belum diisi</span>}</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => onOpenChange(false)}
                            className="mt-8 px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 transition-all active:scale-95"
                        >
                            Tutup
                        </button>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
