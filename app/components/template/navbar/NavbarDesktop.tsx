import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { Link, useLocation } from "react-router";

export function NavbarDesktop() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const activeStyle = "text-brand-primary border-b-2 border-brand-primary";
    const inactiveStyle = "text-muted-foreground hover:text-foreground transition-colors";

    const links = [
        { href: "/", label: "Home" },
        { href: "/guide", label: "Panduan" },
        { href: "/requirements", label: "Persyaratan" },
        { href: "/format", label: "Format" },
        { href: "/faq", label: "FAQ" },
    ];

    return (
        <NavigationMenu className="!flex-none !justify-center">
            <NavigationMenuList className="gap-8 !justify-center">
                {links.map((link) => (
                    <NavigationMenuItem 
                        key={link.href} 
                        className={`py-4 text-sm font-medium ${isActive(link.href) ? activeStyle : inactiveStyle}`}
                    >
                        <Link to={link.href}>{link.label}</Link>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
