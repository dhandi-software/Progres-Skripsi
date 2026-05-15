import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { TextField } from "~/components/ui/TextField";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
import { AuthAlert } from "~/components/ui/AuthAlert";

export function LoginDesktop() {
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
                    src="/images/Background.svg"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                {/* Overlay for better contrast */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Login Card Container - Landscape Mode */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Left Column: Branding / Visual */}
                    <div className="hidden w-5/12 flex-col items-center justify-center bg-gradient-to-br from-[#119DA4] to-[#FDE789] p-12 lg:flex relative overflow-hidden">
                         {/* Decorative Circles */}
                         <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
                         <div className="absolute bottom-10 right-10 w-60 h-60 bg-[#119DA4]/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="mb-8 rounded-2xl bg-white/90 p-4 shadow-lg shadow-black/5 backdrop-blur-sm">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                                    alt="Logo Universitas Pancasila" 
                                    className="h-32 w-auto"
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-white">
                                <span className="text-3xl font-bold leading-tight tracking-tight drop-shadow-sm">Sistem Informasi</span>
                                <span className="text-xl font-semibold text-white/90 leading-tight tracking-wide drop-shadow-sm">Kerja Praktik</span>
                            </div>
                            <p className="mt-6 text-sm text-white/90 w-full leading-relaxed font-medium drop-shadow-sm">
                                Platform terintegrasi untuk pengelolaan administrasi dan monitoring kerja Praktik mahasiswa Universitas Pancasila.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Login Form */}
                    <div className="flex w-full flex-col justify-center bg-white p-8 lg:w-7/12 lg:p-16">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-zinc-900">Welcome Back!</h2>
                            <p className="mt-2 text-zinc-500">Please enter your details to sign in.</p>
                        </div>

                        {loginError && (
                            <AuthAlert message={loginError} type="error" className="mb-6" />
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <TextField
                                label="Email Address"
                                placeholder="username@student.univpancasila.ac.id"
                                value={email}
                                variant="vertical"
                                onChange={(e) => setEmail(e.target.value)}
                                error={errors.email}
                                className="bg-zinc-50 focus:bg-white transition-colors"
                            />
                            
                            <div className="flex flex-col gap-1">
                                <TextField
                                    label="Password"
                                    placeholder="••••••••"
                                    value={password}
                                    type={showPassword ? "text" : "password"}
                                    variant="vertical"
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={errors.password}
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
                                <div className="flex justify-end mt-1">
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) =>
                                        setRememberMe(checked === true)
                                    }
                                    className="border-gray-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 rounded"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal text-zinc-600 cursor-pointer select-none"
                                >
                                    Remember me 
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full mt-2 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98] rounded-xl text-base"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-zinc-100 text-center">
                            <p className="text-xs text-zinc-400">
                                © {new Date().getFullYear()} Universitas Pancasila. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
