// Admin Layout
import { useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  LogOut,
  FileEdit,
  Plus,
  PlayCircle,
  Megaphone,
  UserPlus,
  UserCog,
  FileText,
  History,
  ChevronDown
} from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import type { ContextType } from "~/root";

import { SidebarProvider, Sidebar, SidebarContent, useSidebar } from "~/components/ui/sidebar";
import { MediaProvider as AdminMediaProvider } from "~/features/admin/media/MediaContext";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "create-news-video"
  | "advertisement-management"
  | "create-account"
  | "manage-account"
  | "article-and-media"
  | "draft"
  | "log-activity"
  | "logout"
  | "upload";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/admin/upload")) return "upload";
  if (pathname.startsWith("/admin/advertisement"))
    return "advertisement-management";
  if (pathname.startsWith("/admin/create-account"))
    return "create-account";
  if (pathname.startsWith("/admin/manage-account"))
    return "manage-account";
  if (pathname.startsWith("/admin/article")) return "article-and-media";
  if (pathname.startsWith("/admin/media")) return "article-and-media";
  if (pathname.startsWith("/admin/draft")) return "draft";
  if (pathname.startsWith("/admin/log")) return "log-activity";
  if (pathname.startsWith("/admin/create")) return "create-news-video";
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
    key: "create-news-video" as MenuKey,
    title: "Create a News Video",
    icon: PlayCircle,
    url: "/admin/create",
  },
  {
    key: "advertisement-management" as MenuKey,
    title: "Advertisement Management",
    icon: Megaphone,
    url: "/admin/advertisement",
  },
  {
    key: "create-account" as MenuKey,
    title: "Create Account",
    icon: UserPlus,
    url: "/admin/create-account",
  },
  {
    key: "manage-account" as MenuKey,
    title: "Manage Account",
    icon: UserCog,
    url: "/admin/manage-account",
  },
  {
    key: "article-and-media" as MenuKey,
    title: "Article & Media",
    icon: FileText,
    url: "/admin/article",
    hasSubmenu: true,
    submenu: [
      { title: "Article", url: "/admin/article" },
      { title: "Media", url: "/admin/media" },
    ],
  },
  {
    key: "draft" as MenuKey,
    title: "Draft",
    icon: FileEdit,
    url: "/admin/draft",
  },
  {
    key: "log-activity" as MenuKey,
    title: "Log Activity",
    icon: History,
    url: "/admin/log",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const rootData = useRouteLoaderData("root") as { isMobile: boolean };
  const _isMobile = rootData?.isMobile ?? isMobile;
  const active = pathToKey(location.pathname) ?? "dashboard";

  const handleNavigate = (key: MenuKey) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) {
      if (isMobile) setOpenMobile(false);
      navigate(item.url);
      return;
    }

    switch (key) {
      case "upload":
        if (isMobile) setOpenMobile(false);
        navigate("/admin/upload");
        break;
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
          {/* Actions Section */}
          <div className="flex flex-col gap-4">
            <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase">
              Actions
            </h2>
            <button
              onClick={() => handleNavigate("upload")}
              className="w-full flex items-center justify-center gap-2 bg-[#D25026] text-white py-3 px-4 rounded-sm hover:bg-[#B3411A] transition-colors font-medium text-[1rem]"
            >
              <Plus className="w-5 h-5" />
              Create New Article
            </button>
          </div>

          {/* Admin Panel Section */}
          <div className="flex flex-col gap-4">
            <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase">
              Admin Panel
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
                        isActive && !item.hasSubmenu ? "bg-[#F5F5F5]" : "hover:bg-gray-50",
                        isActive && item.hasSubmenu ? "bg-[#F5F5F5]" : ""
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
                      {item.hasSubmenu && (
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-all duration-200",
                          isActive ? "text-[#D25026]" : "text-[#A1A1A1]",
                          isActive ? "rotate-0" : "-rotate-90"
                        )} />
                      )}
                    </div>

                    {/* Submenu Rendering */}
                    {item.hasSubmenu && isActive && (
                      <div className="flex flex-col gap-1 pl-12 pr-3 py-1">
                        {item.submenu?.map((sub) => {
                          const isSubActive = location.pathname === sub.url;
                          return (
                            <div
                              key={sub.url}
                              onClick={() => {
                                if (isMobile) setOpenMobile(false);
                                navigate(sub.url);
                              }}
                              className={cn(
                                "py-2 px-3 rounded-lg cursor-pointer transition-colors text-sm font-medium",
                                isSubActive ? "text-[#D25026]" : "text-[#A1A1A1] hover:text-[#0A0A0A]"
                              )}
                            >
                              {sub.title}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
  const { isMobile } = useRouteLoaderData<ContextType>("root") as ContextType;
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        <AdminMediaProvider>
          <SidebarProvider isMobile={isMobile}>
            <div className="flex w-full">
              <AppSidebar />
              <main className="flex-1 bg-card w-full text-label pb-12">
                <Outlet context={{ isMobile }} />
              </main>
            </div>
          </SidebarProvider>
        </AdminMediaProvider>
      </RoleGuard>
    </ProtectedRoute>
  );
}
