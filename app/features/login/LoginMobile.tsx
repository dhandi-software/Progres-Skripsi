import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { TextField } from "~/components/ui/TextField";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { AuthAlert } from "~/components/ui/AuthAlert";

export function LoginMobile() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({ email: false, password: false, rememberMe: false });
    const [loginError, setLoginError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = { email: false, password: false, rememberMe: false };

        if (!email) {
            newErrors.email = true;
        }
        if (!password) {
            newErrors.password = true;
        }

        setErrors(newErrors);
        setLoginError(null);

        if (!newErrors.email && !newErrors.password) {
            try {
                await login({ email, password });
            } catch (error: any) {
                console.error("Login failed", error);
                setLoginError(error.response?.data?.message || "Login failed. Please check your credentials.");
            }
        }
    };

    return (
        <main className="relative min-h-screen w-full overflow-hidden font-geist">
             {/* Full Screen Background */}
             <div className="absolute inset-0 z-0">
                <img
                    src="/images/Background_Mobile.webp"
                    alt="Background"
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-2">
                
                {/* Glassmorphism Header: Logo & Title */}
                <div className="mb-6 w-[95%] max-w-[420px] flex flex-col items-center text-center p-6 rounded-[28px] bg-gradient-to-br from-[#c2410c] via-[#ea580c] to-[#eab308] border border-white/40 shadow-[0_12px_36px_0_rgba(0,0,0,0.22)] relative overflow-hidden transition-all">
                    {/* Ambient Glow */}
                    <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/25 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-300/25 rounded-full blur-2xl" />

                    {/* Inner Translucent Glass Card */}
                    <div className="relative z-10 w-full flex flex-col items-center p-5 rounded-[22px] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-inner">
                        {/* Glassmorphic Logo Box */}
                        <div className="mb-3.5 rounded-2xl bg-white/30 p-3.5 backdrop-blur-md border border-white/50 shadow-md">
                            <img 
                                src="/logo_up.webp" 
                                alt="Logo Universitas Pancasila" 
                                className="h-14 w-auto object-contain drop-shadow-md"
                            />
                        </div>

                        <div className="flex flex-col gap-1 text-white">
                            <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-md text-white">Sistem Informasi</h1>
                            <h2 className="text-lg font-bold text-amber-200 tracking-wide drop-shadow-md">Kerja Praktik</h2>
                        </div>

                        <p className="mt-2.5 text-xs font-medium text-white/95 max-w-[260px] leading-relaxed drop-shadow-sm">
                            Platform terintegrasi untuk pengelolaan administrasi dan monitoring Kerja Praktik.
                        </p>
                    </div>
                </div>

                <div 
                    className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-[95%] max-w-[420px] animate-in fade-in slide-in-from-bottom-5 duration-500"
                >
                    <div className="mb-5">
                        <h2 className="text-xl font-bold text-[#1a1f2c]">Welcome Back!</h2>
                        <p className="text-xs md:text-sm text-zinc-500 mt-1">Please enter your details to sign in.</p>
                    </div>

                    {loginError && (
                        <AuthAlert message={loginError} type="error" className="mb-5" />
                    )}

                    <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-4">
                        <TextField
                            label="Email Address"
                            name="email_address_login"
                            autoComplete="off"
                            placeholder="username@student.univpancasila.ac.id"
                            value={email}
                            variant="vertical"
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            leftIcon={<User size={18} className="text-zinc-400" />}
                            className="bg-white"
                            inputClassName="h-11 border-zinc-200 focus-visible:ring-[#e84e0f]/20 focus-visible:border-[#e84e0f]"
                            labelClassName="font-bold text-xs md:text-sm text-[#1a1f2c]"
                        />
                        <div className="flex flex-col gap-1">
                            <TextField
                                label="Password"
                                name="user_password_login"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                value={password}
                                type={showPassword ? "text" : "password"}
                                variant="vertical"
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                leftIcon={<Lock size={18} className="text-zinc-400" />}
                                className="bg-white"
                                inputClassName="h-11 border-zinc-200 focus-visible:ring-[#e84e0f]/20 focus-visible:border-[#e84e0f]"
                                labelClassName="font-bold text-xs md:text-sm text-[#1a1f2c]"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-zinc-400 hover:text-zinc-600 focus:outline-none flex items-center"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                }
                            />
                            <div className="flex justify-end mt-1">
                                <Link
                                    to="/forgot-password"
                                    className="text-[11px] md:text-xs font-semibold text-[#e84e0f] hover:text-[#c43d08] hover:underline transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember-mobile"
                                checked={rememberMe}
                                onCheckedChange={(checked) =>
                                    setRememberMe(checked === true)
                                }
                               className="border-zinc-300 data-[state=checked]:bg-[#e84e0f] data-[state=checked]:border-[#e84e0f] rounded-md h-4 w-4"
                            />
                            <Label
                                htmlFor="remember-mobile"
                                className="text-xs md:text-sm font-medium text-zinc-600 cursor-pointer select-none"
                            >
                                Remember me
                            </Label>
                        </div>
                        
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-2 h-11 bg-[#e84e0f] hover:bg-[#d44309] text-white font-semibold transition-all active:scale-[0.98] rounded-xl text-sm md:text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </div>

                <div className="mt-4 pb-2 text-center">
                    <p className="text-[10px] md:text-xs font-medium text-zinc-500">
                        © {new Date().getFullYear()} Universitas Pancasila.<br/>All rights reserved.
                    </p>
                </div>
            </div>
        </main>
    );
}
