import { Link } from "react-router";
import { LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function HeaderMobile() {
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-border-subtle px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
                 <img
                    src="/logo_up.webp"
                    alt="Logo UP"
                    className="h-10 w-auto"
                />
                <span className="text-lg font-bold text-zinc-950">SIKP</span>
            </Link>

            <div className="flex items-center gap-4">
                <Button asChild size="sm" className="rounded-full">
                    <Link to="/login" className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Login
                    </Link>
                </Button>
            </div>
        </header>
    );
}
