import { useState, useEffect } from "react";
import { User, Loader2, Edit3, Save, X, Award } from "lucide-react";
import { pengajuanApi } from "~/api/pengajuan";
import { Toast } from "~/components/ui/toast";
import { useAuth } from "~/hooks/useAuth";

interface ProfileDetailsProps {
    profile: any;
    onUpdate: () => void;
}

export function ProfileDetails({ profile, onUpdate }: ProfileDetailsProps) {
    const { user } = useAuth();
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive"} | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [nama, setNama] = useState(user?.name || profile?.nama || "");
    const [email, setEmail] = useState(profile?.email || "");
    const [nomorTelepon, setNomorTelepon] = useState(profile?.nomorTelepon || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setNama(user?.name || profile.nama || "");
            setEmail(profile?.email || "");
            setNomorTelepon(profile?.nomorTelepon || "");
            if (!profile?.nomorTelepon) {
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
            await pengajuanApi.updateProfile({ nama, email, nomorTelepon });
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
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group mb-12">
            {toastProps && (
                <div className="fixed top-4 right-4 z-[100]">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}
            <div className="flex justify-between items-start mb-10">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#119DA4]/10 rounded-2xl flex items-center justify-center">
                        <User className="w-6 h-6 text-[#119DA4]" />
                    </div>
                    Informasi Kontak & Identitas
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
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
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
                            {user?.name || profile?.nama || "-"}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">NPM</label>
                    <div className="px-5 py-4 bg-gray-100/50 rounded-2xl border border-gray-100 font-mono font-black text-gray-400 text-lg cursor-not-allowed">
                        {user?.mahasiswaNim || profile?.nim || "-"}
                    </div>
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
                            {profile?.email || "-"}
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
                            {profile?.nomorTelepon || <span className="text-red-400 italic font-normal text-sm">Belum diisi (Wajib)</span>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
