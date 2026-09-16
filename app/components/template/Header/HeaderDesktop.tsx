import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";
import { LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import { NavbarDesktop } from "~/components/template/navbar/NavbarDesktop";

export default function HeaderDesktop() {
    const location = useLocation();
    const isArticlePage = location.pathname.startsWith("/article/");

    return (
        <header className={cn("w-full pt-6 bg-transparent pb-6")}>
            <div className="mx-auto w-full max-w-[90rem]">
                <div className="flex items-center justify-between px-4xl min-h-[4.25rem]">
                    <div className="flex items-center flex-1 justify-start">
                        <Link
                            to="/"
                            className="flex items-center gap-3 shrink-0"
                        >
                            <img 
                                src="/logo_up.webp" 
                                alt="Logo Universitas Pancasila" 
                                className="h-12 w-auto"
                            />
                            <div className="flex flex-col font-geist">
                                <span className="text-2xl font-bold text-zinc-950 leading-none tracking-tight">Sistem Informasi</span>
                                <span className="text-base font-medium text-orange-600 leading-none tracking-wide">Kerja Praktik</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center shrink-0">
                        {!isArticlePage && <NavbarDesktop />}
                    </div>

                    <div className="flex items-center justify-end flex-1 h-11 gap-4">
                        <Button asChild variant="default" className="rounded-full">
                            <Link to="/login" className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
