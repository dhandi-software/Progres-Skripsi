import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { TextField } from "~/components/ui/TextField";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Eye, EyeOff } from "lucide-react";
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
        <main className="relative min-h-screen w-screen overflow-hidden font-geist" style={{ width: "100vw" }}>
             {/* Full Screen Background */}
             <div className="absolute inset-0 z-0">
                <img
                    src="/images/kuning.png"
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-4">
                <div 
                    className="rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-500 w-full max-w-md"
                    style={{ width: "100%", maxWidth: "450px", minWidth: "320px" }}
                >
                    
                    {/* Header: Logo & Title */}
                    <div className="mb-6 flex flex-col items-center text-center">
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
                         <h2 className="mt-4 text-base font-medium text-zinc-600">Welcome Back!</h2>
                    </div>

                    {loginError && (
                        <AuthAlert message={loginError} type="error" className="mb-6" />
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                                    className="text-xs font-medium text-[#119DA4] hover:text-[#0e8389] hover:underline transition-colors"
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
                               className="border-gray-300 data-[state=checked]:bg-[#119DA4] data-[state=checked]:border-[#119DA4] rounded"
                            />
                            <Label
                                htmlFor="remember-mobile"
                                className="text-sm font-normal text-zinc-600 cursor-pointer select-none"
                            >
                                Remember me
                            </Label>
                        </div>
                        
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-2 h-11 bg-[#119DA4] hover:bg-[#0e8389] text-white font-medium shadow-lg shadow-[#119DA4]/20 transition-all active:scale-[0.98] rounded-xl text-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                     <div className="mt-8 text-center">
                        <p className="text-[10px] text-zinc-400">
                            © {new Date().getFullYear()} Universitas Pancasila. All rights reserved.
                        </p>
                    </div>
                </div>
            </div >
        </main >
    );
}
