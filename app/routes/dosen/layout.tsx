import React from "react";
import { useLocation, useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import {
  LayoutDashboard,
  LogOut,
  Download,
  FileText,
  Users,
  MessageCircle,
  Calendar,
  Award,
} from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import type { ContextType } from "~/root";
import { chatService } from "~/services/chatService";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "download"
  | "peninjauan"
  | "bimbingan"
  | "chat"
  | "acara"
  | "penilaian"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/dosen/download")) return "download";
  if (pathname.startsWith("/dosen/peninjauan")) return "peninjauan";
  if (pathname.startsWith("/dosen/bimbingan")) return "bimbingan";
  if (pathname.startsWith("/dosen/chat")) return "chat";
  if (pathname.startsWith("/dosen/acara")) return "acara";
  if (pathname.startsWith("/dosen/penilaian")) return "penilaian";
  if (pathname === "/dosen" || pathname.startsWith("/dosen/"))
    return "dashboard";
  return undefined;
};

const menuItems = [
  {
    key: "dashboard" as MenuKey,
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dosen",
  },
  {
    key: "download" as MenuKey,
    title: "Download",
    icon: Download,
    url: "/dosen/download",
  },
  {
    key: "peninjauan" as MenuKey,
    title: "Peninjauan Formulir",
    icon: FileText,
    url: "/dosen/peninjauan",
  },
  {
    key: "bimbingan" as MenuKey,
    title: "Bimbingan",
    icon: Users,
    url: "/dosen/bimbingan",
  },
  {
    key: "chat" as MenuKey,
    title: "Chat",
    icon: MessageCircle,
    url: "/dosen/chat",
  },
  {
    key: "acara" as MenuKey,
    title: "Acara",
    icon: Calendar,
    url: "/dosen/acara",
  },
  {
    key: "penilaian" as MenuKey,
    title: "Penilaian",
    icon: Award,
    url: "/dosen/penilaian",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const rootData = useRouteLoaderData("root") as { isMobile: boolean };
  // const _isMobile = rootData?.isMobile ?? isMobile; // Unused variable
  const active = pathToKey(location.pathname) ?? "dashboard";

  // Fetch pending pengajuan count and unread chat count
  const [pendingCount, setPendingCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await pengajuanApi.getPengajuanByDosen();
        if (data && Array.isArray(data)) {
          const count = data.filter((item: any) => item.status === 'PENDING').length;
          setPendingCount(count);
        }
      } catch (error) {
        console.error("Failed to fetch pending requests count:", error);
      }
    };
    
    const fetchUnread = async () => {
      if (!user) return;
      try {
        const data = await chatService.getUnreadCount(user.id);
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch unread chat count:", error);
      }
    };

    // Initial fetch
    fetchPendingCount();
    fetchUnread();
    
    // Setup interval to periodically check (optional, but good for real-time feel)
    const intervalId = setInterval(() => {
        fetchPendingCount();
        fetchUnread();
    }, 30000); // Check every 30s
    return () => clearInterval(intervalId);
  }, [user]);

  const handleNavigate = (key: MenuKey) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) {
      if (isMobile) setOpenMobile(false);
      navigate(item.url);
      return;
    }

    if (key === "logout") {
        logout();
    }
  };

  return (
    <Sidebar className="border-r border-[#E5E5E5] bg-white overflow-y-hidden">
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
                      onClick={() => handleNavigate(item.key)}
                      className={cn(
                        "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200",
                        isActive ? "bg-[#FFF0EB]" : "hover:bg-gray-50",
                      )}
                    >
                      <div className="flex items-center gap-4">
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
                      </div>
                      
                      {item.key === "peninjauan" && pendingCount > 0 && (
                        <div className="bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]">
                          {pendingCount}
                        </div>
                      )}
                      {item.key === "chat" && unreadCount > 0 && (
                        <div className="bg-[#00a884] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]">
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

export default function DosenLayout() {
  const location = useLocation();
  const { isMobile } = useRouteLoaderData<ContextType>("root") as ContextType;
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["dosen", "dosen_pembimbing"]}>
        <SidebarProvider isMobile={isMobile}>
          <div className="flex w-full h-screen overflow-hidden bg-neutral-50">
            <AppSidebar />
            <main className={cn(
              "flex-1 w-full h-full overflow-y-auto",
              location.pathname.includes("/chat") ? "pb-0" : "pb-12"
            )}>
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && !location.pathname.includes("/chat") && (
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                  <SidebarTrigger className="p-2 -ml-2 text-gray-700" />
                  <span className="ml-2 font-bold text-[#119DA4] text-lg tracking-tight">Dosen Panel</span>
                </div>
              )}
              {isMobile && location.pathname.includes("/chat") && (
                <div className="md:hidden absolute top-4 left-4 z-50">
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
