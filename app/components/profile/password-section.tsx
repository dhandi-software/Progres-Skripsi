import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { authApi } from "~/api/auth";
import { Toast } from "~/components/ui/toast";

export function PasswordSection() {
    const [loading, setLoading] = useState(false);
    const [toastProps, setToastProps] = useState<{title: string, variant?: "success" | "destructive"} | null>(null);
    
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const toggleShow = (key: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setToastProps({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            await authApi.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setToastProps({ title: "Password berhasil diperbarui", variant: "success" });
            setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            setToastProps({ 
                title: error.response?.data?.message || "Gagal memperbarui password", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            {toastProps && (
                <div className="fixed top-4 right-4 z-[100]">
                    <Toast title={toastProps.title} variant={toastProps.variant} onClose={() => setToastProps(null)} />
                </div>
            )}

            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Keamanan & Password</h2>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Old Password */}
                <div className="space-y-3 col-span-1 md:col-span-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Password Saat Ini
                    </label>
                    <div className="relative">
                        <input 
                            type={showPasswords.old ? "text" : "password"}
                            className="w-full md:w-1/2 bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-[#119DA4] focus:ring-4 focus:ring-[#119DA4]/5 transition-all outline-none pr-14"
                            placeholder="Masukkan password lama..."
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => toggleShow("old")}
                            className="absolute right-[50%] md:right-[50%] translate-x-[-1.5rem] md:translate-x-[-50%] top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* New Password */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Password Baru</label>
                    <div className="relative">
                        <input 
                            type={showPasswords.new ? "text" : "password"}
                            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-[#119DA4] focus:ring-4 focus:ring-[#119DA4]/5 transition-all outline-none pr-14"
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => toggleShow("new")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Konfirmasi Password Baru</label>
                    <div className="relative">
                        <input 
                            type={showPasswords.confirm ? "text" : "password"}
                            className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:border-[#119DA4] focus:ring-4 focus:ring-[#119DA4]/5 transition-all outline-none pr-14"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                        />
                        <button 
                            type="button"
                            onClick={() => toggleShow("confirm")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 flex justify-end">
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-10 py-5 bg-gradient-to-r from-[#119DA4] to-[#0D7C82] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-[#119DA4]/30 hover:shadow-2xl hover:scale-[1.02] transform transition-all flex items-center gap-3 disabled:opacity-70 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Update Keamanan
                    </button>
                </div>
            </form>
            
            {/* Security Tip */}
            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center gap-4 text-gray-400">
                <div className="p-2 bg-gray-50 rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-medium leading-relaxed">
                    Pastikan password Anda minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka untuk keamanan maksimal.
                </p>
            </div>
        </section>
    );
}
