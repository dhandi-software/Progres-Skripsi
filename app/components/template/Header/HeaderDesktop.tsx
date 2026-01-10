import { Link } from "react-router";
import { cn } from "~/lib/utils";
import { LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function HeaderDesktop() {
    return (
        <header className={cn("w-full pt-6 bg-background border-b border-border-subtle pb-6")}>
            <div className="mx-auto w-full max-w-[90rem]">
                <div className="flex items-center justify-between px-4xl min-h-[4.25rem]">
                    <div className="flex items-center flex-1">
                        <Link
                            to="/"
                            className="flex items-center gap-3 shrink-0"
                        >
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                                alt="Logo Universitas Pancasila" 
                                className="h-12 w-auto"
                            />
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-zinc-950 leading-none">Sistem Informasi</span>
                                <span className="text-sm font-medium text-orange-600 leading-none">Kerja Praktek</span>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center h-11 gap-4">
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
