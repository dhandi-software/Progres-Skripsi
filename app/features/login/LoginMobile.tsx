import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { TextField } from "~/components/ui/TextField";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export function LoginMobile() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({ email: false, password: false, rememberMe: false });
    const [loginError, setLoginError] = useState<string | null>(null);
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
        <main>
            <div className="flex justify-center pt-2xl pb-[2.5rem]">
                <img
                    src="/images/MNI.svg"
                    alt="Media Nikel Indonesia"
                    className="w-[12.5rem] h-[4.125rem]"
                />
            </div>
            <div className="flex justify-center gap-[3.125rem] items-center">
                <div className="p-2xl flex flex-col gap-lg rounded-[0.5rem] text-center">
                    <h1 className="text-subheading-h5">Welcome back to Media Nikel Indonesia Management System!</h1>
                    {loginError && (
                        <div className="text-red-500 text-sm text-center">{loginError}</div>
                    )}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">

                        <TextField
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            variant="vertical"
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                        />
                        <TextField
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            type="password"
                            variant="vertical"
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                        />
                        <div className="flex justify-between">
                            <div className="flex items-center gap-[0.625rem]">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) =>
                                        setRememberMe(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal text-gray-900 cursor-pointer"
                                >
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline text-right"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                size="sm"
                                className="w-[6.25rem] bg-brand-primary-muted-foreground hover:bg-brand-primary-muted-foreground/80"
                                disabled={isLoading}
                            >
                                {isLoading ? "Loading..." : "Login"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div >
        </main >
    );
}
