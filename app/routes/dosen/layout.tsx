import React from "react";
import { useLocation, useNavigate } from "react-router";
import { pengajuanApi } from "~/api/pengajuan";
import { bimbinganApi } from "~/api/bimbinganApi";
import {
  LayoutDashboard,
  LogOut,
  Download,
  FileText,
  Users,
  MessageCircle,
  Calendar,
  Award,
  ClipboardList,
  User,
  BookOpen,
  Contact,
} from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import type { ContextType } from "~/root";
import { chatService } from "~/services/chatService";
import { sidangApi } from "~/api/sidangApi";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "download"
  | "peninjauan"
  | "bimbingan"
  | "chat"
  | "acara"
  | "sidang"
  | "penilaian"
  | "laporan"
  | "logbook"
  | "prodiSidang"
  | "prodiBimbingan"
  | "profile"
  | "direktori"
  | "sanksi"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/dosen/download")) return "download";
  if (pathname.startsWith("/dosen/peninjauan")) return "peninjauan";
  if (pathname.startsWith("/dosen/bimbingan")) return "bimbingan";
  if (pathname.startsWith("/dosen/chat")) return "chat";
  if (pathname.startsWith("/dosen/acara")) return "acara";
  if (pathname.startsWith("/dosen/sidang")) return "sidang";
  if (pathname.startsWith("/dosen/penilaian")) return "penilaian";
  if (pathname.startsWith("/dosen/laporan")) return "laporan";
  if (pathname.startsWith("/dosen/prodi/sidang")) return "prodiSidang";
  if (pathname.startsWith("/dosen/prodi/bimbingan")) return "prodiBimbingan";
  if (pathname.startsWith("/dosen/profile")) return "profile";
  if (pathname.startsWith("/dosen/direktori")) return "direktori";
  if (pathname.startsWith("/dosen/logbook")) return "logbook";
  if (pathname.startsWith("/dosen/sanksi")) return "sanksi";
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
    key: "logbook" as MenuKey,
    title: "Logbook Mahasiswa",
    icon: BookOpen,
    url: "/dosen/logbook",
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
    title: "Pengumuman",
    icon: Calendar,
    url: "/dosen/acara",
  },
  {
    key: "direktori" as MenuKey,
    title: "Direktori",
    icon: Contact,
    url: "/dosen/direktori",
  },
  {
    key: "sidang" as MenuKey,
    title: "Manajemen Sidang",
    icon: Calendar,
    url: "/dosen/sidang",
  },
  {
    key: "penilaian" as MenuKey,
    title: "Penilaian",
    icon: Award,
    url: "/dosen/penilaian",
  },
  {
    key: "laporan" as MenuKey,
    title: "Laporan",
    icon: FileText,
    url: "/dosen/laporan",
  },

  {
    key: "sanksi" as MenuKey,
    title: "Sanksi Administrasi",
    icon: ClipboardList,
    url: "/dosen/sanksi",
  },
  {
    key: "profile" as MenuKey,
    title: "Profil Saya",
    icon: User,
    url: "/dosen/profile",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const rootData = useRouteLoaderData("root") as { isMobile: boolean };
  const active = pathToKey(location.pathname) ?? "dashboard";

  // Fetch pending pengajuan count and unread chat count
  const [pendingCount, setPendingCount] = React.useState(0);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [bimbinganBadgeCount, setBimbinganBadgeCount] = React.useState(0);
  const [sidangBadgeCount, setSidangBadgeCount] = React.useState(0);
  const [prodiSidangBadgeCount, setProdiSidangBadgeCount] = React.useState(0);

  React.useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const data = await pengajuanApi.getPengajuanByDosen();
        if (data && Array.isArray(data)) {
          const count = data.filter((item: any) => item.status === 'PENDING' || item.status === 'PENDING_KOORDINATOR').length;
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

    const fetchBimbinganBadge = async () => {
      try {
        const students = await bimbinganApi.getDosenBimbinganStudents();
        let count = 0;
        if (students && Array.isArray(students)) {
            students.forEach((student: any) => {
                const bimbinganList = student.mahasiswa?.bimbingan || [];
                if (bimbinganList.length > 0) {
                    const activeTask = bimbinganList[0];
                    if (activeTask.status === 'SUBMITTED') {
                        count++;
                    }
                }
            });
        }
        setBimbinganBadgeCount(count);
      } catch (error) {
        console.error("Failed to fetch bimbingan badge:", error);
      }
    };

    const fetchSidangBadge = async () => {
      try {
        const data = await sidangApi.getSidangByDosen();
        if (data && Array.isArray(data)) {
            // Advisor badge: status MENUNGGU_PERSETUJUAN_PEMBIMBING
            const advisorCount = data.filter((item: any) => 
                item.status === 'MENUNGGU_PERSETUJUAN_PEMBIMBING' && item.dosenNidn === user?.dosenNidn
            ).length;
            setSidangBadgeCount(advisorCount);

            // Prodi badge: status MENUNGGU_PENJADWALAN_KOORDINATOR, MENUNGGU_VERIFIKASI_KAPRODI, MENUNGGU_KONFIRMASI_JADWAL_KAPRODI
            const prodiStatuses = ['MENUNGGU_PENJADWALAN_KOORDINATOR', 'MENUNGGU_VERIFIKASI_KAPRODI', 'MENUNGGU_KONFIRMASI_JADWAL_KAPRODI'];
            const prodiCount = data.filter((item: any) => 
                prodiStatuses.includes(item.status)
            ).length;
            setProdiSidangBadgeCount(prodiCount);
        }
      } catch (error) {
        console.error("Failed to fetch sidang badge:", error);
      }
    };

    // Initial fetch
    fetchPendingCount();
    fetchUnread();
    fetchBimbinganBadge();
    fetchSidangBadge();
    
    // Setup interval to periodically check (optional, but good for real-time feel)
    const intervalId = setInterval(() => {
        fetchPendingCount();
        fetchUnread();
        fetchBimbinganBadge();
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
      <SidebarContent className={cn(
        "bg-[#FAFAFA] flex flex-col py-8 custom-scrollbar transition-all duration-200",
        isCollapsed ? "px-2 items-center" : "px-6"
      )}>
        {/* Logo Section */}
        <div className={cn("mb-8 flex items-center justify-center", isCollapsed ? "px-0" : "px-2")}>
          <img
            src="https://uppress.univpancasila.ac.id/wp-content/uploads/2023/05/UP4.png"
            alt="Logo"
            className={cn(
              "object-contain transition-all duration-200",
              isCollapsed ? "h-10 w-10" : "h-16 w-auto"
            )}
          />
        </div>

        <div className="flex flex-col gap-8 flex-1 w-full">
          {/* Menu Section */}
          <div className="flex flex-col gap-4 w-full">
            {!isCollapsed && (
              <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase truncate">
                Menu Utama
              </h2>
            )}
            <div className="flex flex-col gap-1 w-full">
              {menuItems.filter(item => {
                const jabatan = (user?.jabatan || "").toLowerCase().trim();
                const isAuthorized = jabatan === "pejabat prodi" || 
                                   jabatan === "penjabat prodi" || 
                                   jabatan === "dosen reguler" ||
                                   jabatan.includes("koordinator");
                
                const isDosenReguler = jabatan === "dosen reguler";
                
                // Whitelist for Prodi-only areas
                const isProdiItem = (item as any).prodiOnly || 
                                   item.key === "prodiSidang" || 
                                   item.key === "prodiBimbingan";

                // Hide active supervision menus for Dosen Reguler
                const hiddenForReguler = ["peninjauan", "bimbingan", "chat", "penilaian", "sidang", "logbook", "laporan", "sanksi"];
                if (isDosenReguler && hiddenForReguler.includes(item.key || "")) return false;

                if (isProdiItem) return isAuthorized;
                return true;
              }).map((item) => {
                const isActive = active === item.key;
                const IconComponent = item.icon;
                
                let title = item.title;

                return (
                  <div key={item.key} className="flex flex-col gap-1 w-full">
                    <div
                      onClick={() => handleNavigate(item.key || "")}
                      title={isCollapsed ? title : undefined}
                      className={cn(
                        "group flex items-center rounded-xl cursor-pointer transition-all duration-200 relative",
                        isCollapsed ? "justify-center p-3" : "justify-between px-3 py-3",
                        isActive ? "bg-[#FFF0EB]" : "hover:bg-gray-50",
                      )}
                    >
                      <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-4")}>
                        <div
                          className={cn(
                            "flex items-center justify-center rounded-full w-8 h-8 shrink-0 transition-colors",
                            isActive ? "bg-[#D25026]" : "bg-[#A1A1A1] group-hover:bg-gray-400"
                          )}
                        >
                          {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                        </div>
                        {!isCollapsed && (
                          <span
                            className={cn(
                              "flex-1 font-medium text-[1rem] transition-colors truncate",
                              isActive ? "text-[#D25026]" : "text-[#A1A1A1] group-hover:text-gray-600"
                            )}
                          >
                            {title}
                          </span>
                        )}
                      </div>
                      
                      {item.key === "bimbingan" && bimbinganBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {bimbinganBadgeCount}
                        </div>
                      )}
                      {item.key === "peninjauan" && pendingCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {pendingCount}
                        </div>
                      )}
                      {item.key === "chat" && unreadCount > 0 && (
                        <div className={cn(
                          "bg-[#00a884] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {unreadCount}
                        </div>
                      )}
                      {item.key === "sidang" && sidangBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {sidangBadgeCount}
                        </div>
                      )}
                      {item.key === "prodiSidang" && prodiSidangBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {prodiSidangBadgeCount}
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
        <div className="mt-auto w-full">
          <button
            onClick={() => handleNavigate("logout")}
            title={isCollapsed ? "Log Out" : undefined}
            className={cn(
              "w-full flex items-center bg-white border border-[#E5E5E5] rounded-sm hover:bg-gray-50 transition-colors",
              isCollapsed ? "justify-center p-3" : "gap-4 px-4 py-3"
            )}
          >
            <LogOut className="w-5 h-5 text-black shrink-0" />
            {!isCollapsed && <span className="font-medium text-[1rem] text-black truncate">Log Out</span>}
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
      <RoleGuard allowedRoles={["dosen", "dosen_pembimbing", "kaprodi", "staf"]}>
        <SidebarProvider isMobile={isMobile}>
          <div className="flex w-full h-screen overflow-hidden bg-neutral-50 print:h-auto print:overflow-visible print:bg-white">
            <AppSidebar />
            <main className={cn(
              "flex-1 w-full h-full overflow-y-auto print:h-auto print:overflow-visible print:p-0 print:pb-0",
              location.pathname.includes("/chat") ? "pb-0" : "pb-12"
            )}>
              {/* Desktop Header with Sidebar Trigger Toggle */}
              {!location.pathname.includes("/chat") && (
                <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200/80 sticky top-0 z-30 print:hidden">
                  <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 text-gray-700" />
                  <span className="font-bold text-gray-700 text-sm tracking-tight">Portal Dosen</span>
                </div>
              )}
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && !location.pathname.includes("/chat") && (
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm print:hidden">
                  <SidebarTrigger className="p-2 -ml-2 text-gray-700" />
                  <span className="ml-2 font-bold text-[#119DA4] text-lg tracking-tight">Dosen Panel</span>
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
