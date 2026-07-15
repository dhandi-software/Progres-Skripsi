import React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  User,
  Calendar,
  MessageSquare,
  Megaphone,
  Download,
  ClipboardList,
  Contact,
} from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import { chatService } from "~/services/chatService";
import { sidangApi } from "~/api/sidangApi";
import type { ContextType } from "~/root";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "sidang"
  | "jadwal"
  | "acara"
  | "download"
  | "chat"
  | "sanksi"
  | "direktori"
  | "profile"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/staf/profile")) return "profile";
  if (pathname.startsWith("/staf/chat")) return "chat";
  if (pathname.startsWith("/staf/sidang")) return "sidang";
  if (pathname.startsWith("/staf/jadwal")) return "jadwal";
  if (pathname.startsWith("/staf/acara")) return "acara";
  if (pathname.startsWith("/staf/download")) return "download";
  if (pathname.startsWith("/staf/direktori")) return "direktori";
  if (pathname.startsWith("/staf/sanksi")) return "sanksi";
  if (pathname === "/staf" || pathname.startsWith("/staf/"))
    return "dashboard";
  return undefined;
};

const menuItems = [
  {
    key: "dashboard" as MenuKey,
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/staf",
  },
  {
    key: "jadwal" as MenuKey,
    title: "Manajemen Jadwal",
    icon: Calendar,
    url: "/staf/jadwal",
  },
  {
    key: "acara" as MenuKey,
    title: "Pengumuman & Acara",
    icon: Megaphone,
    url: "/staf/acara",
  },
  {
    key: "direktori" as MenuKey,
    title: "Direktori",
    icon: Contact,
    url: "/staf/direktori",
  },
  {
    key: "download" as MenuKey,
    title: "Download",
    icon: Download,
    url: "/staf/download",
  },
  {
    key: "chat" as MenuKey,
    title: "Chat",
    icon: MessageSquare,
    url: "/staf/chat",
  },
  {
    key: "sanksi" as MenuKey,
    title: "Sanksi Administrasi",
    icon: ClipboardList,
    url: "/staf/sanksi",
  },
  {
    key: "profile" as MenuKey,
    title: "Profil Saya",
    icon: User,
    url: "/staf/profile", // Placehoder if needed
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const active = pathToKey(location.pathname) ?? "dashboard";

  const [sidangBadgeCount, setSidangBadgeCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const data = await chatService.getUnreadCount(user.id);
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch unread chat count:", error);
      }
    };

    const fetchSidangBadge = async () => {
      try {
        const data = await sidangApi.getAllSidang();
        if (data && Array.isArray(data)) {
            // Staff badge: status MENUNGGU_PENJADWALAN_KOORDINATOR
            const count = data.filter((item: any) => 
                item.status === 'MENUNGGU_PENJADWALAN_KOORDINATOR'
            ).length;
            setSidangBadgeCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch sidang badge:", error);
      }
    };

    fetchUnread();
    fetchSidangBadge();

    const intervalId = setInterval(() => {
        fetchUnread();
        fetchSidangBadge();
    }, 30000); // Check every 30s
    return () => clearInterval(intervalId);
  }, [user]);

  const handleNavigate = (key: string) => {
    if (key === "logout") {
        logout();
        return;
    }
    const item = menuItems.find((item) => item.key === key);
    if (item && item.url) {
      if (isMobile) setOpenMobile(false);
      navigate(item.url);
      return;
    }
  };

  return (
    <Sidebar className="border-r border-[#E5E5E5] bg-white overflow-y-hidden print:hidden">
      <SidebarContent className="bg-[#FAFAFA] flex flex-col py-8 px-6 custom-scrollbar">
        {/* Logo Section */}
        <div className="mb-8 px-2">
          <img
            src="https://uppress.univpancasila.ac.id/wp-content/uploads/2023/05/UP4.png"
            alt="Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-8 flex-1">
          {/* Menu Section */}
          <div className="flex flex-col gap-4">
            <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase">
              Menu Utama
            </h2>
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const isActive = active === item.key;
                const IconComponent = item.icon;

                return (
                  <div key={item.key} className="flex flex-col gap-1">
                    <div
                      onClick={() => handleNavigate(item.key || "")}
                      className={cn(
                        "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200",
                        isActive ? "bg-[#D25026]" : "hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-full w-8 h-8 shrink-0 transition-colors",
                            isActive ? "bg-white/20" : "bg-[#A1A1A1] group-hover:bg-gray-400"
                          )}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                        </div>
                        <span
                          className={cn(
                            "flex-1 font-bold text-[1rem] transition-colors ml-1",
                            isActive ? "text-white" : "text-[#A1A1A1] group-hover:text-gray-600"
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                      
                      {item.key === "sidang" && sidangBadgeCount > 0 && (
                        <div className="bg-white text-[#D25026] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]">
                          {sidangBadgeCount}
                        </div>
                      )}
                      {item.key === "chat" && unreadCount > 0 && (
                        <div className={cn(
                            "text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                            isActive ? "bg-white text-[#D25026]" : "bg-[#D25026] text-white"
                        )}>
                          {unreadCount}
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

export default function StafLayout() {
  const location = useLocation();
  const { isMobile } = useRouteLoaderData<ContextType>("root") as ContextType;
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["staf", "staf_univ"]}>
        <SidebarProvider isMobile={isMobile}>
          <div className="flex w-full h-screen overflow-hidden bg-neutral-50 print:h-auto print:overflow-visible print:bg-white">
            <AppSidebar />
            <main className={cn(
              "flex-1 w-full h-full overflow-y-auto print:h-auto print:overflow-visible print:p-0 print:pb-0",
              location.pathname.includes("/chat") ? "pb-0" : "pb-12"
            )}>
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && !location.pathname.includes("/chat") && (
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm print:hidden">
                  <SidebarTrigger className="p-2 -ml-2 text-gray-700" />
                  <span className="ml-2 font-bold text-[#119DA4] text-lg tracking-tight">Staff Panel</span>
                </div>
              )}
              {isMobile && location.pathname.includes("/chat") && (
                <div className="md:hidden absolute top-4 left-4 z-50 print:hidden">
                   <SidebarTrigger className="p-2 bg-white rounded-full shadow-md text-gray-700" />
                </div>
              )}
              <Outlet context={{ isMobile }} />
            </main>
          </div>
        </SidebarProvider>
      </RoleGuard>
    </ProtectedRoute>
  );
}
