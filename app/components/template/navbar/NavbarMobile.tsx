import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

export function NavbarMobile() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const activeStyle = "text-brand-primary border-b-2 border-brand-primary whitespace-nowrap";
    const inactiveStyle = "text-muted-foreground whitespace-nowrap hover:text-foreground";

    const links = [
        { href: "/", label: "Home" },
        { href: "/guide", label: "Panduan" },
        { href: "/requirements", label: "Persyaratan" },
        { href: "/format", label: "Format" },
        { href: "/faq", label: "FAQ" },
    ];

    return (
        <div className="w-full overflow-x-auto border-b mt-sm scrollbar-hide px-4">
            <NavigationMenu className="w-max">
                <NavigationMenuList className="flex-nowrap gap-6">
                    {links.map((link) => (
                        <NavigationMenuItem 
                            key={link.href} 
                            className={cn("py-3 text-sm font-medium", isActive(link.href) ? activeStyle : inactiveStyle)}
                        >
                            <Link to={link.href}>{link.label}</Link>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
