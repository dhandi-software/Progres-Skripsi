import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  UserPlus,
  Users,
  Settings,
  FileText,
  BarChart3,
  MessageSquare,
  ClipboardList,
  Download,
  Contact,
} from "lucide-react";
import { Outlet, useRouteLoaderData, isRouteErrorResponse, useRouteError } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import type { ContextType } from "~/root";
import { AlertCircle, Home } from "lucide-react";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar, SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "users"
  | "monitoring"
  | "acara"
  | "download"
  | "chat"
  | "penilaian"
  | "sanksi"
  | "direktori"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/create-account") || pathname.startsWith("/admin/edit-account")) return "users";
  if (pathname.startsWith("/admin/monitoring")) return "monitoring";
  if (pathname.startsWith("/admin/chat")) return "chat";
  if (pathname.startsWith("/admin/acara")) return "acara";
  if (pathname.startsWith("/admin/download")) return "download";
  if (pathname.startsWith("/admin/penilaian")) return "penilaian";
  if (pathname.startsWith("/admin/sanksi")) return "sanksi";
  if (pathname.startsWith("/admin/direktori")) return "direktori";
  if (pathname === "/admin" || pathname.startsWith("/admin/"))
    return "dashboard";
  return undefined;
};

const menuItems = [
  {
    key: "dashboard" as MenuKey,
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/admin",
  },
  {
    key: "users" as MenuKey,
    title: "User Management",
    icon: Users,
    url: "/admin/users",
  },
  {
    key: "monitoring" as MenuKey,
    title: "Monitoring Bimbingan",
    icon: BarChart3,
    url: "/admin/monitoring",
  },
  {
    key: "acara" as MenuKey,
    title: "Pengumuman",
    icon: ClipboardList,
    url: "/admin/acara",
  },
  {
    key: "direktori" as MenuKey,
    title: "Direktori",
    icon: Contact,
    url: "/admin/direktori",
  },
  {
    key: "download" as MenuKey,
    title: "Download",
    icon: Download,
    url: "/admin/download",
  },
  {
    key: "chat" as MenuKey,
    title: "Chat",
    icon: MessageSquare,
    url: "/admin/chat",
  },
  {
    key: "penilaian" as MenuKey,
    title: "Penilaian Evaluasi",
    icon: FileText,
    url: "/admin/penilaian",
  },
  {
    key: "sanksi" as MenuKey,
    title: "Sanksi Administrasi",
    icon: ClipboardList,
    url: "/admin/sanksi",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const rootData = useRouteLoaderData("root") as { isMobile: boolean };
  const active = pathToKey(location.pathname) ?? "dashboard";

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
              Admin Menu
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
                      <span
                        className={cn(
                          "flex-1 font-medium text-[1rem] transition-colors",
                          isActive ? "text-[#D25026]" : "text-[#A1A1A1] group-hover:text-gray-600"
                        )}
                      >
                        {item.title}
                      </span>
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

export default function AdminLayout() {
  const location = useLocation();
  const { isMobile } = useRouteLoaderData<ContextType>("root") as ContextType;
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <SidebarProvider isMobile={isMobile}>
          <div className="flex w-full h-screen overflow-hidden bg-neutral-50 print:h-auto print:overflow-visible print:bg-white">
            <AppSidebar />
            <main className={cn(
              "flex-1 w-full h-full overflow-y-auto print:h-auto print:overflow-visible print:p-0 print:pb-0",
              "pb-12" // simplified
            )}>
              {/* Mobile Header with Hamburger Menu */}
              {isMobile && (
                <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm print:hidden">
                  <SidebarTrigger className="p-2 -ml-2" />
                  <span className="ml-2 font-bold text-[#119DA4] text-lg tracking-tight">Admin Panel</span>
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

export function ErrorBoundary({ error }: { error: unknown }) {
  const err = useRouteError();
  const routeError = isRouteErrorResponse(err) ? err : null;

  let message = "Mohon Maaf, Terjadi Kesalahan";
  let details = "Terjadi masalah pada sistem admin. Tim kami sedang menanganinya.";

  if (routeError) {
    if (routeError.status === 404) {
      message = "Halaman Tidak Ditemukan";
      details = "Maaf, halaman admin yang Anda tuju tidak tersedia.";
    } else {
      message = `Error ${routeError.status}`;
      details = routeError.statusText;
    }
  } else if (err instanceof Error) {
    details = err.message;
  }

  // Coba ambil context jika memungkinkan
  const rootData = useRouteLoaderData("root") as ContextType | undefined;
  const isMobile = rootData?.isMobile ?? false;

  return (
    <SidebarProvider isMobile={isMobile}>
      <div className="flex w-full h-screen overflow-hidden bg-neutral-50">
        <AppSidebar />
        <main className="flex-1 w-full h-full overflow-y-auto grid place-items-center p-6 bg-slate-50" style={{ width: "100%" }}>
          <div className="bg-white rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 border border-slate-100 mx-auto" style={{ width: "100%", maxWidth: "450px", minWidth: "320px" }}>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">{message}</h1>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              {details}
            </p>
            <div className="flex flex-col gap-3">
              <a href="/admin" className="inline-flex items-center justify-center gap-2 bg-[#119DA4] hover:bg-[#0c7a80] text-white rounded-xl h-12 px-6 font-bold transition-all shadow-lg shadow-[#119DA4]/30">
                <Home size={18} />
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
