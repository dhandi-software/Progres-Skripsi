import { useState, useEffect } from "react";
import { User, Briefcase, Mail, Send, Loader2, Edit3, Save, X, Award } from "lucide-react";
import { pengajuanApi } from "~/api/pengajuan";
import { Toast } from "~/components/ui/toast";
import { PasswordSection } from "~/components/profile/password-section";

interface ProfileDetailsProps {
    profile: any;
    onUpdate: () => void;
}

export function ProfileDetails({ profile, onUpdate }: ProfileDetailsProps) {
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive"} | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {toastProps && (
                <div className="fixed top-4 right-4 z-[100]">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}

            {/* Main Info Card */}
            <div className="md:col-span-2 space-y-8">
                <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                    <h2 className="text-2xl font-black text-gray-900 mb-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#119DA4]/10 rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6 text-[#119DA4]" />
                        </div>
                        Informasi Identitas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap & Gelar</label>
                            <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                {profile?.nama || "-"}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Jabatan Fungsional</label>
                            <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                {profile?.jabatan || "-"}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">NIDN System ID</label>
                            <div className="px-5 py-4 bg-gray-100/50 rounded-2xl border border-gray-100 font-mono font-black text-gray-400 text-lg cursor-not-allowed">
                                {profile?.nidn || "-"}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Status Verifikasi</label>
                            <div className="px-5 py-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                <span className="font-black text-green-700 text-sm uppercase tracking-wider">Aktif & Terverifikasi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Management */}
                <PasswordSection />
            </div>

            {/* Sidebar Stats/Info */}
            <div className="space-y-8">
                <div className="bg-gradient-to-br from-[#119DA4] to-[#0D7C82] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 opacity-80">Aktivitas Terbaru</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                                <Send className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black leading-none truncate">Manajemen Bimbingan</p>
                                <p className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-wider">Terakhir update: Hari ini</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-black leading-none truncate break-all">{profile?.user?.email || "Email N/A"}</p>
                                <p className="text-[10px] opacity-70 mt-1 uppercase font-bold tracking-wider">Official University Mail</p>
                            </div>
                        </div>
                    </div>
                    
                    <button className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-black uppercase tracking-widest transition-all">
                        Pengaturan Keamanan
                    </button>
                </div>
                
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm text-center">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Sistem Terintegrasi</p>
                    <div className="flex justify-center gap-4 grayscale opacity-40">
                         <Award className="w-8 h-8" />
                         <Briefcase className="w-8 h-8" />
                         <ShieldCheck className="w-8 h-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck({ className, size = 24 }: { className?: string, size?: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
