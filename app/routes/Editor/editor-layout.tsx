// Sidebar.tsx
import { useLocation, useNavigate } from "react-router";
import { FileText, Folder, Settings, LogOut } from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import { newsApi } from "~/api/news";

import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    useSidebar
} from "~/components/ui/sidebar";
import { MediaProvider as EditorMediaProvider } from "~/features/Editor/media/MediaContext";
import { cn } from "~/lib/utils";

type MenuKey = "pending" | "media" | "edit-profile" | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
    if (pathname.startsWith("/editor/media")) return "media";
    if (pathname.startsWith("/editor/edit-profile")) return "edit-profile";

    if (pathname === "/editor" || pathname.startsWith("/editor/"))
        return "pending";
    return undefined;
};

const menuItems = [
    {
        key: "pending" as MenuKey,
        title: "Pending Reviews",
        icon: FileText,
        url: "/editor",
        showBadge: true,
    },
    {
        key: "media" as MenuKey,
        title: "Media",
        icon: Folder,
        url: "/editor/media",
    },
    {
        key: "edit-profile" as MenuKey,
        title: "Edit Profile",
        icon: Settings,
        url: "/editor/edit-profile",
    },
];

export function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { setOpenMobile, isMobile } = useSidebar();
    const active = pathToKey(location.pathname) ?? "pending";

    // Fetch pending count from API
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await newsApi.getNews({
                    status: "pending" as any,
                    limit: 1,
                    page: 1,
                });
                if (response.code === 200 && response.data) {
                    setPendingCount(response.data.total_rows || 0);
                }
            } catch (error) {
                console.error("Error fetching pending count:", error);
                setPendingCount(0);
            }
        };
        fetchPendingCount();
    }, []);

    const handleNavigate = (key: MenuKey | string) => {
        const item = menuItems.find((item) => item.key === key);
        if (item) {
            if (isMobile) setOpenMobile(false);
            navigate(item.url);
            return;
        }

        switch (key) {
            case "logout":
                logout();
                break;
        }
    };

    return (
        <Sidebar className="border-r border-[#E5E5E5]">
            <SidebarContent className="h-screen bg-[#FAFAFA] flex flex-col py-8 px-6">
                {/* Logo Section */}
                <div className="mb-8 px-2">
                    <img
                        src="/images/MNI.svg"
                        alt="MNI"
                        className="h-16 w-auto object-contain"
                    />
                </div>

                <div className="flex flex-col gap-8 flex-1">
                    {/* Admin Panel Section */}
                    <div className="flex flex-col gap-4">
                        <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase">
                            Editor
                        </h2>
                        <div className="flex flex-col gap-1">
                            {menuItems.map((item) => {
                                const isActive = active === item.key;
                                const IconComponent = item.icon;

                                return (
                                    <div key={item.key} className="flex flex-col gap-1">
                                        <div
                                            onClick={() => handleNavigate(item.key)}
                                            className={cn(
                                                "group flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200",
                                                isActive ? "bg-[#F5F5F5]" : "hover:bg-gray-50"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center rounded-full w-8 h-8 shrink-0 transition-colors",
                                                    isActive ? "bg-[#D25026]" : "bg-[#A1A1A1] group-hover:bg-gray-400"
                                                )}
                                            >
                                                <IconComponent className="w-5 h-5 text-white" />
                                            </div>
                                            <span
                                                className={cn(
                                                    "flex-1 font-medium text-[1rem] transition-colors",
                                                    isActive ? "text-[#D25026]" : "text-[#A1A1A1] group-hover:text-gray-600"
                                                )}
                                            >
                                                {item.title}
                                            </span>
                                            {item.showBadge && pendingCount > 0 && (
                                                <div className="flex items-center justify-center bg-[#D25026] text-white text-[10px] font-bold h-5 w-5 rounded-full">
                                                    {pendingCount}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Logout Section */}
                <div className="mt-auto">
                    <button
                        onClick={() => handleNavigate("logout")}
                        className="w-full flex items-center gap-4 px-4 py-3 bg-white border border-[#E5E5E5] rounded-sm hover:bg-gray-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5 text-black" />
                        <span className="font-medium text-[1rem] text-black">Log Out</span>
                    </button>
                </div>
            </SidebarContent>
        </Sidebar>
    );
}

export default function EditorLayout() {
    const { isMobile } = useRouteLoaderData("root") as { isMobile: boolean };
    return (
        <ProtectedRoute>
            <RoleGuard allowedRoles={["editor", "admin"]}>
                <EditorMediaProvider>
                    <SidebarProvider isMobile={isMobile}>
                        <div className="flex w-full">
                            <AppSidebar />
                            <main className="flex-1 bg-card w-full text-label pb-12">
                                <Outlet context={{ isMobile }} />
                            </main>
                        </div>
                    </SidebarProvider>
                </EditorMediaProvider>
            </RoleGuard>
        </ProtectedRoute>
    );
}
