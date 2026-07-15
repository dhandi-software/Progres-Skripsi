import { useState } from "react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { Link, useNavigate } from "react-router";
import { AuthAlert } from "~/components/ui/AuthAlert";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { authService } from "~/services/authService";

export function ForgotPasswordMobile() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1 State
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    
    // Step 2 State
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Global Error/Success State
    const [alertMsg, setAlertMsg] = useState<string | null>(null);
    const [alertType, setAlertType] = useState<"error" | "success">("error");

    const handleCheckEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlertMsg(null);
        if (!email) {
            setEmailError(true);
            return;
        }
        setEmailError(false);
        setIsChecking(true);

        try {
            const res = await authService.checkEmail(email);
            if (res.userId) {
                setUserId(res.userId);
                setStep(2);
            }
        } catch (error: any) {
            console.error(error);
            setAlertType("error");
            setAlertMsg(error.response?.data?.message || "Email tidak ditemukan.");
        } finally {
            setIsChecking(false);
        }
    };

    const validatePassword = (pass: string) => {
        if (pass.length < 8) return "Password minimal 8 karakter";
        if (!/\d/.test(pass)) return "Password harus mengandung setidaknya satu angka";
        if (!/[!@#$`%^&*(),.?":{}|<>]/.test(pass)) return "Password harus mengandung karakter spesial (@, #, $, dll)";
        return null;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlertMsg(null);
        let hasError = false;

        const passErr = validatePassword(newPassword);
        if (passErr) {
            setPasswordError(passErr);
            hasError = true;
        } else {
            setPasswordError(null);
        }

        if (!confirmPassword || newPassword !== confirmPassword) {
            setConfirmError(true);
            hasError = true;
        } else {
            setConfirmError(false);
        }

        if (hasError || !userId) return;

        setIsResetting(true);
        try {
            const res = await authService.resetPassword(userId, newPassword);
            setAlertType("success");
            setAlertMsg(res.message);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error: any) {
            console.error(error);
            setAlertType("error");
            setAlertMsg(error.response?.data?.message || "Gagal mereset password.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <main className="relative min-h-screen w-full overflow-hidden font-geist">
             {/* Full Screen Background */}
             <div className="absolute inset-0 z-0">
                <img
                    src="/images/Background.svg"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
                <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 relative">
                    
                    {step === 1 && (
                        <Link to="/login" className="absolute top-4 left-4 text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1 text-sm font-medium">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                    )}
                    {step === 2 && (
                        <button onClick={() => {setStep(1); setAlertMsg(null);}} className="absolute top-4 left-4 text-zinc-400 hover:text-zinc-700 transition-colors flex items-center gap-1 text-sm font-medium">
                            <ArrowLeft size={16} /> Batal
                        </button>
                    )}

                    {/* Header: Logo & Title */}
                    <div className="mb-6 mt-6 flex flex-col items-center text-center">
                         <div className="mb-4 rounded-xl bg-gradient-to-br from-[#119DA4] to-[#FDE789] p-4 shadow-lg">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                                alt="Logo Universitas Pancasila" 
                                className="h-16 w-auto mix-blend-multiply"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-zinc-900 leading-tight tracking-tight">Sistem Informasi</span>
                            <span className="text-base font-semibold text-[#119DA4] leading-tight tracking-wide">Kerja Praktik</span>
                        </div>
                         <h2 className="mt-4 text-base font-medium text-zinc-600">
                            {step === 1 ? "Forgot Password" : "Create New Password"}
                         </h2>
                    </div>

                    {alertMsg && (
                        <AuthAlert message={alertMsg} type={alertType} className="mb-6" />
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleCheckEmail} className="flex flex-col gap-4">
                            <TextField
                                label="Email Address"
                                placeholder="username@student.univpancasila.ac.id"
                                value={email}
                                variant="vertical"
                                onChange={(e) => setEmail(e.target.value)}
                                error={emailError}
                                className="bg-zinc-50 focus:bg-white transition-colors"
                            />
                            
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full mt-2 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] rounded-xl text-base"
                                disabled={isChecking}
                            >
                                {isChecking ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span>Mengecek...</span>
                                    </div>
                                ) : (
                                    "Lanjut"
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <TextField
                                    label="New Password"
                                    placeholder="********"
                                    value={newPassword}
                                    type={showPassword ? "text" : "password"}
                                    variant="vertical"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    error={!!passwordError}
                                    className="bg-zinc-50 focus:bg-white transition-colors"
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-zinc-400 hover:text-zinc-600 focus:outline-none flex items-center"
                                        >
                                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </button>
                                    }
                                />
                                {passwordError && (
                                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <TextField
                                    label="Confirm New Password"
                                    placeholder="********"
                                    value={confirmPassword}
                                    type={showConfirmPassword ? "text" : "password"}
                                    variant="vertical"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={confirmError}
                                    className="bg-zinc-50 focus:bg-white transition-colors"
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="text-zinc-400 hover:text-zinc-600 focus:outline-none flex items-center"
                                        >
                                            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </button>
                                    }
                                />
                                {confirmError && confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">Password tidak cocok</p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full mt-2 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] rounded-xl text-base"
                                disabled={isResetting || alertType === 'success'}
                            >
                                {isResetting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span>Menyimpan...</span>
                                    </div>
                                ) : (
                                    "Simpan Password Baru"
                                )}
                            </Button>
                        </form>
                    )}

                </div>
            </div>
        </main>
    );
}
