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
    const [isEditing, setIsEditing] = useState(false);
    const [nama, setNama] = useState(profile?.nama || "");
    const [jabatan, setJabatan] = useState(profile?.jabatan || "");
    const [email, setEmail] = useState(profile?.user?.email || "");
    const [nomorTelepon, setNomorTelepon] = useState(profile?.user?.nomorTelepon || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setNama(profile.nama || "");
            setJabatan(profile.jabatan || "");
            setEmail(profile.user?.email || "");
            setNomorTelepon(profile.user?.nomorTelepon || "");
            if (!profile.user?.nomorTelepon) {
                setIsEditing(true);
            }
        }
    }, [profile]);

    const handleSave = async () => {
        if (!nomorTelepon) {
            setToastProps({ title: "Nomor telepon wajib diisi", variant: "destructive" });
            return;
        }
        
        // Validasi nomor telepon Indonesia (mulai dengan 08, 628, atau +628 dan panjang 10-14 digit angka)
        const phoneRegex = /^(08|628|\+628)[0-9]{7,11}$/;
        if (!phoneRegex.test(nomorTelepon)) {
            setToastProps({ title: "Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 0812... atau 62812... dengan panjang 10-14 digit).", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            await pengajuanApi.updateDosenProfile({ nama, jabatan, email, nomorTelepon });
            setToastProps({ title: "Profil berhasil diperbarui", variant: "success" });
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            setToastProps({ title: error.message || "Gagal memperbarui profil", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

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
                    <div className="flex justify-between items-start mb-10">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#119DA4]/10 rounded-2xl flex items-center justify-center">
                                <User className="w-6 h-6 text-[#119DA4]" />
                            </div>
                            Informasi Identitas
                        </h2>
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-600 transition-all border border-transparent hover:border-gray-200"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Profil
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-400 transition-all border border-transparent hover:border-gray-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#119DA4] hover:bg-[#0D7C82] rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-[#119DA4]/30 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Simpan
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap & Gelar</label>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 font-bold text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-[#119DA4]/20 focus:border-[#119DA4]"
                                    placeholder="Masukkan nama lengkap"
                                />
                            ) : (
                                <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                    {profile?.nama || "-"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Jabatan Fungsional</label>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    value={jabatan}
                                    onChange={(e) => setJabatan(e.target.value)}
                                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 font-bold text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-[#119DA4]/20 focus:border-[#119DA4]"
                                    placeholder="Masukkan jabatan"
                                />
                            ) : (
                                <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                    {profile?.jabatan || "-"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                            {isEditing ? (
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 font-bold text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-[#119DA4]/20 focus:border-[#119DA4]"
                                    placeholder="Masukkan email"
                                />
                            ) : (
                                <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                    {profile?.user?.email || "-"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Nomor Telepon <span className="text-red-500">*</span></label>
                            {isEditing ? (
                                <input 
                                    type="tel"
                                    value={nomorTelepon}
                                    onChange={(e) => setNomorTelepon(e.target.value.replace(/[^0-9+]/g, ''))}
                                    className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 font-bold text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-[#119DA4]/20 focus:border-[#119DA4]"
                                    placeholder="Contoh: 081234567890 (Wajib)"
                                    required
                                />
                            ) : (
                                <div className="px-5 py-4 bg-gray-50/50 rounded-2xl border border-gray-50 font-bold text-gray-800 text-lg">
                                    {profile?.user?.nomorTelepon || <span className="text-red-400 italic font-normal text-sm">Belum diisi (Wajib)</span>}
                                </div>
                            )}
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
