import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { pengajuanApi } from "~/api/pengajuan";
import { ProfileHeader } from "./components/profile-header";
import { ProfileDetails } from "./components/profile-details";

export default function ProfileDosenDesktop() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const data = await pengajuanApi.getDosenProfile();
            setProfile(data);
        } catch (error) {
            console.error("Failed to fetch dosen profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#119DA4] animate-spin" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-orange-400 animate-pulse" />
                </div>
                <p className="text-xl font-black text-gray-900 tracking-tight uppercase">Menyiapkan Profil Mewah Anda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto pt-12 px-6">
                 <ProfileHeader profile={profile} onUpdate={fetchProfile} />
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto mt-16 px-6 md:px-12">
                 <ProfileDetails profile={profile} onUpdate={fetchProfile} />
            </div>

            {/* Decorative Luxury Footer */}
            <div className="mt-24 border-t border-gray-100 py-12 text-center overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#119DA4]/5 to-transparent rounded-full blur-[100px] -z-10" />
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em] mb-4">Official Executive Panel</p>
                <div className="flex justify-center items-center gap-6 text-gray-400 text-xs font-bold">
                    <span>© University Portal v4.0</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>Secure Infrastructure</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>Verified Academic Identity</span>
                </div>
            </div>
        </div>
    );
}
