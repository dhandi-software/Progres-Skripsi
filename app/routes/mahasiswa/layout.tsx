// Mahasiswa Layout
import { Outlet, useLocation, useNavigate, useRouteLoaderData } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  Download,
  FileText,
  Users,
  MessageCircle,
  Calendar,
  Trophy,
  BookOpen,
  Contact,
  Clock,
  FileWarning
} from "lucide-react";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import type { ContextType } from "~/root";
import { chatService } from "~/services/chatService";
import { bimbinganApi } from "~/api/bimbinganApi";
import { acaraApi } from "~/api/acaraApi";
import { sidangApi } from "~/api/sidangApi";
import { sanksiApi } from "~/api/sanksiApi";
import { jadwalKpApi } from "~/api/jadwalKpApi";
import { pengajuanApi } from "~/api/pengajuan";
import React from "react";
import { io } from "socket.io-client";
import { UPLOADS_URL } from "~/api/client";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "download"
  | "pengajuan"
  | "bimbingan"
  | "chat"
  | "acara"
  | "direktori"
  | "sidang"
  | "profilemahasiswa"
  | "portfolio"
  | "logbook"
  | "sanksi"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/mahasiswa/download")) return "download";
  if (pathname.startsWith("/mahasiswa/pengajuan")) return "pengajuan";
  if (pathname.startsWith("/mahasiswa/bimbingan")) return "bimbingan";
  if (pathname.startsWith("/mahasiswa/chat")) return "chat";
  if (pathname.startsWith("/mahasiswa/acara")) return "acara";
  if (pathname.startsWith("/mahasiswa/sidang")) return "sidang";
  if (pathname.startsWith("/mahasiswa/profilemahasiswa")) return "profilemahasiswa";
  if (pathname.startsWith("/mahasiswa/logbook")) return "logbook";
  if (pathname.startsWith("/mahasiswa/sanksi")) return "sanksi";
  if (pathname.startsWith("/mahasiswa/direktori")) return "direktori";
  if (pathname === "/mahasiswa" || pathname.startsWith("/mahasiswa/"))
    return "dashboard";
  return undefined;
};

const menuItems = [
  {
    key: "dashboard" as MenuKey,
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/mahasiswa",
  },
  {
    key: "download" as MenuKey,
    title: "Download",
    icon: Download,
    url: "/mahasiswa/download",
  },
  {
    key: "pengajuan" as MenuKey,
    title: "Pengajuan Formulir",
    icon: FileText,
    url: "/mahasiswa/pengajuan",
  },
  {
    key: "bimbingan" as MenuKey,
    title: "Bimbingan",
    icon: Users,
    url: "/mahasiswa/bimbingan",
  },
  {
    key: "chat" as MenuKey,
    title: "Chat",
    icon: MessageCircle,
    url: "/mahasiswa/chat",
  },
  {
    key: "acara" as MenuKey,
    title: "Pengumuman",
    icon: Calendar,
    url: "/mahasiswa/acara",
  },
  {
    key: "direktori" as MenuKey,
    title: "Direktori",
    icon: Contact,
    url: "/mahasiswa/direktori",
  },
  {
    key: "sidang" as MenuKey,
    title: "Jadwal Sidang",
    icon: Calendar,
    url: "/mahasiswa/sidang",
  },
  {
    key: "logbook" as MenuKey,
    title: "Logbook KP",
    icon: BookOpen,
    url: "/mahasiswa/logbook",
  },
  {
    key: "sanksi" as MenuKey,
    title: "Sanksi Administrasi",
    icon: FileWarning,
    url: "/mahasiswa/sanksi",
  },

  {
    key: "profilemahasiswa" as MenuKey,
    title: "Profil Mahasiswa",
    icon: Trophy,
    url: "/mahasiswa/profilemahasiswa",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setOpenMobile, isMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const rootData = useRouteLoaderData("root") as { isMobile: boolean };
  const _isMobile = rootData?.isMobile ?? isMobile;
  const active = pathToKey(location.pathname) ?? "dashboard";
  const { user } = useAuth(); // Needed for ID
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [bimbinganBadgeCount, setBimbinganBadgeCount] = React.useState(0);
  const [acaraBadgeCount, setAcaraBadgeCount] = React.useState(0);
  const [sidangBadgeCount, setSidangBadgeCount] = React.useState(0);
  const [sanksiBadgeCount, setSanksiBadgeCount] = React.useState(0);
  const [dashboardBadgeCount, setDashboardBadgeCount] = React.useState(0);
  const [sidangMenuTitle, setSidangMenuTitle] = React.useState("Pengumpulan Laporan Sidang");
  const [isPengajuanPending, setIsPengajuanPending] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch Chat Unread Count
      chatService.getUnreadCount(user.id)
        .then(data => setUnreadCount(data.count || 0))
        .catch(err => console.error("Sidebar Chat Error:", err));

      // Fetch Pengajuan Status
      pengajuanApi.getProfile()
        .then((profileRes: any) => {
          if (profileRes.pengajuanJudul && profileRes.pengajuanJudul.length > 0) {
            const latestPengajuan = profileRes.pengajuanJudul[0];
            setIsPengajuanPending(latestPengajuan.status === 'PENDING');
          }
        })
        .catch((err: any) => console.error("Sidebar Pengajuan Error:", err));

      // Fetch Bimbingan Tasks
      bimbinganApi.getMahasiswaAllTasks()
        .then(tasks => {
          if (tasks && Array.isArray(tasks)) {
            const grouped = tasks.reduce((acc: any, task: any) => {
              if (!acc[task.topik] || task.versi > acc[task.topik].versi) acc[task.topik] = task;
              return acc;
            }, {});
            const uniqueTasks: any[] = Object.values(grouped);
            const active = uniqueTasks.find((t: any) => t.status !== 'APPROVED');
            setBimbinganBadgeCount(active && (active.status === 'ASSIGNED' || active.status === 'REVISION') ? 1 : 0);
          }
        })
        .catch(err => console.error("Sidebar Bimbingan Error:", err));

      // Fetch Acara Unread Count
      acaraApi.getUnreadCount()
        .then(data => {
          setAcaraBadgeCount(data.count || 0);
        })
        .catch(err => console.error("Sidebar Acara Error:", err));

      // Fetch Sidang Notification
      sidangApi.getSidangMahasiswa()
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            const latest = data[0];
            // Show badge if not seen by student
            if (!latest.mahasiswaSeen) {
              setSidangBadgeCount(1);
            } else {
              setSidangBadgeCount(0);
            }

            if (latest.status === 'TERJADWAL') {
              setSidangMenuTitle("Jadwal Sidang");
            } else {
              setSidangMenuTitle("Pengumpulan Laporan Sidang");
            }
          } else {
            setSidangMenuTitle("Pengumpulan Laporan Sidang");
          }
        })
        .catch(err => console.error("Sidebar Sidang Error:", err));

      // Fetch Sanksi count
      sanksiApi.getAllSanksi()
        .then(data => {
          if (data && Array.isArray(data)) {
            setSanksiBadgeCount(data.length);
          }
        })
        .catch(err => console.error("Sidebar Sanksi Error:", err));

      // Fetch Jadwal KP & Sidang for notifications
      jadwalKpApi.getAllJadwalKp()
        .then((data: any) => {
          if (data && Array.isArray(data)) {
            const now = new Date();
            const activePengarahanKp = data.some((j: any) => j.tipe === 'PENGARAHAN_KP' && now <= new Date(j.tanggalSelesai));
            const activePengarahanSidang = data.some((j: any) => j.tipe === 'PENGARAHAN_SIDANG' && now <= new Date(j.tanggalSelesai));
            setDashboardBadgeCount((activePengarahanKp ? 1 : 0) + (activePengarahanSidang ? 1 : 0));
          }
        })
        .catch((err: any) => console.error("Sidebar Jadwal Error:", err));
    };
    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Real-time socket notifications
  React.useEffect(() => {
    if (!user) return;

    // Connect to the socket server
    const socket = io(UPLOADS_URL);

    // Join user-specific room for private notifications
    socket.emit('join', user.id);

    const refetchCount = () => {
      acaraApi.getUnreadCount().then(data => {
        setAcaraBadgeCount(data.count || 0);
      });
    };

    // Handle local sync from the timeline component
    const handleLocalRead = () => {
      // Optimistically decrement for immediate feedback
      setAcaraBadgeCount(prev => Math.max(0, prev - 1));
      // Verify with server after a small delay
      setTimeout(refetchCount, 1000);
    };

    socket.on('new_acara', () => {
      refetchCount();

      // Native browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pengumuman Baru", {
          body: "Ada instruksi atau pengumuman baru dari dosen di timeline.",
          icon: "/logo_up.webp"
        });
      }
    });

    // Handle sync when an item is read (from other devices)
    socket.on('acara_read', () => {
      refetchCount();
    });

    // Handle local sync from the timeline component
    window.addEventListener('update-unread-count', handleLocalRead);

    // Request permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
      window.removeEventListener('update-unread-count', handleLocalRead);
    };
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
              {menuItems.map((item) => {
                const isActive = active === item.key;
                const IconComponent = item.icon;
                const itemTitle = item.key === 'sidang' ? sidangMenuTitle : item.title;

                return (
                  <div key={item.key} className="flex flex-col gap-1 w-full">
                    <div
                      onClick={() => handleNavigate(item.key)}
                      title={isCollapsed ? itemTitle : undefined}
                      className={cn(
                        "group flex items-center rounded-xl cursor-pointer transition-all duration-200 relative",
                        isCollapsed ? "justify-center p-3" : "gap-4 px-3 py-3",
                        isActive ? "bg-[#FFF0EB]" : "hover:bg-gray-50",
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
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "flex-1 font-medium text-[1rem] transition-colors truncate",
                            isActive ? "text-[#D25026]" : "text-[#A1A1A1] group-hover:text-gray-600"
                          )}
                        >
                          {itemTitle}
                        </span>
                      )}
                      {item.key === "dashboard" && dashboardBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px] shadow-sm shadow-red-200",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {dashboardBadgeCount}
                        </div>
                      )}
                      {item.key === "bimbingan" && bimbinganBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {bimbinganBadgeCount}
                        </div>
                      )}
                      {item.key === "pengajuan" && isPengajuanPending && (
                        <div className={cn(
                          "bg-blue-500 text-white p-1 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-blue-200",
                          isCollapsed && "absolute -top-1 -right-1"
                        )} title="Menunggu Persetujuan">
                          <Clock className="w-3.5 h-3.5" />
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
                      {item.key === "acara" && acaraBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#D25026] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {acaraBadgeCount}
                        </div>
                      )}
                      {item.key === "sidang" && sidangBadgeCount > 0 && (
                        <div className={cn(
                          "bg-[#FF7A00] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {sidangBadgeCount}
                        </div>
                      )}
                      {item.key === "sanksi" && sanksiBadgeCount > 0 && (
                        <div className={cn(
                          "bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center shrink-0 min-w-[20px]",
                          isCollapsed && "absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px]"
                        )}>
                          {sanksiBadgeCount}
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

export default function MahasiswaLayout() {
  const location = useLocation();
  const { isMobile } = useRouteLoaderData<ContextType>("root") as ContextType;
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["mahasiswa"]}>
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
                  <span className="font-bold text-gray-700 text-sm tracking-tight">Portal Mahasiswa</span>
                </div>
              )}
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && !location.pathname.includes("/chat") && (
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm print:hidden">
                  <SidebarTrigger className="p-2 -ml-2 text-gray-700" />
                  <span className="ml-2 font-bold text-[#119DA4] text-lg tracking-tight">Kerja Praktik</span>
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
