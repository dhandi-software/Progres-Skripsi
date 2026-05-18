import { useState, useRef } from "react";
import { Camera, BadgeCheck, Mail, Loader2, User, Award, ShieldCheck } from "lucide-react";
import { profileApi } from "~/api/profileApi";
import { pengajuanApi } from "~/api/pengajuan";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";

interface ProfileHeaderProps {
    profile: any;
    onUpdate: () => void;
}

export function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
    const [uploading, setUploading] = useState(false);
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive"} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoClick = () => {
        if (!uploading) fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setToastProps({ title: "File harus berupa gambar", variant: "destructive" });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setToastProps({ title: "Ukuran gambar maksimal 5MB", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            await pengajuanApi.updateDosenProfile({ photo: file });
            setToastProps({ title: "Foto profil berhasil diperbarui", variant: "success" });
            onUpdate();
        } catch (error: any) {
            setToastProps({ title: error.message || "Gagal memperbarui foto profil", variant: "destructive" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const initials = profile?.nama 
        ? profile.nama.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : "?";

    return (
        <div className="relative group/header overflow-visible">
            {toastProps && (
                <div className="fixed top-4 right-4 z-[100]">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}
            
            {/* Luxury Header Background Cover */}
            <div className="h-56 md:h-80 rounded-[2.5rem] relative overflow-hidden shadow-2xl bg-gray-900">
                <img 
                    src="/images/Banner_Universitas_Pancasila.png" 
                    alt="University Banner" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Abstract Glassmorphism Patterns */}
                <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
            
            {/* Profile Info Overlay */}
            <div className="px-8 md:px-16 -mt-24 md:-mt-32 pb-12 flex flex-col md:flex-row items-center md:items-end gap-10 text-center md:text-left relative z-10">
                {/* Luxury Avatar Area */}
                <div className="relative shrink-0 perspective-1000">
                    <div 
                        className={cn(
                            "w-48 h-48 md:w-56 md:h-56 rounded-[3rem] border-8 border-white bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden relative cursor-pointer transform-gpu transition-all duration-500 hover:rotate-2 hover:scale-105",
                            uploading && "animate-pulse"
                        )}
                        onClick={handlePhotoClick}
                    >
                        {profile?.user?.photo ? (
                            <img 
                                src={profileApi.getProfilePhotoUrl(profile.user.photo)} 
                                alt={profile.nama}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-100 text-[#119DA4] font-black text-5xl">
                                {initials}
                            </div>
                        )}
                        
                        {uploading ? (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center group/btn">
                                <Camera className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                            </div>
                        )}
                    </div>
                    
                    {/* Floating Badge */}
                    <div className="absolute -bottom-2 -right-2 bg-[#D25026] text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                        <Award className="w-6 h-6" />
                    </div>
                    
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                </div>

                {/* Identity Info */}
                <div className="flex-1 pb-4 md:pb-6">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                         <span className="px-4 py-1.5 bg-white/30 backdrop-blur-xl border border-white/40 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
                            Lecturer Profile
                        </span>
                        {profile?.jabatan && (
                             <span className="px-4 py-1.5 bg-[#D25026] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-[#D25026]/40">
                                {profile.jabatan}
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {profile?.nama || "..."}
                    </h1>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mt-6">
                        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-[1.5rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:bg-white hover:-translate-y-1">
                            <BadgeCheck className="w-6 h-6 text-[#119DA4]" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">NIDN</span>
                                <span className="font-bold text-gray-800 text-lg leading-none">{profile?.nidn || "-"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-2xl px-6 py-3 rounded-[1.5rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:bg-white hover:-translate-y-1">
                            <Mail className="w-6 h-6 text-[#D25026]" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Email</span>
                                <span className="font-bold text-gray-800 text-lg leading-none">{profile?.user?.email || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
