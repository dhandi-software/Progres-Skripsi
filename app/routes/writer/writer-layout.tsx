// Sidebar.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Home,
  FileText,
  Folder,
  Settings,
  LogOut,
  FileVideoIcon,
  Plus,
} from "lucide-react";
import { Outlet, useRouteLoaderData } from "react-router";
import { ProtectedRoute } from "~/routes/ProtectedRoute";
import { RoleGuard } from "~/routes/RoleGuard";
import { useAuth } from "~/hooks/useAuth";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  useSidebar
} from "~/components/ui/sidebar";
import { MediaProvider } from "~/features/writer/media/MediaContext";
import { cn } from "~/lib/utils";

type MenuKey =
  | "dashboard"
  | "draft"
  | "media"
  | "edit-profile"
  | "upload"
  | "video"
  | "logout";

const pathToKey = (pathname: string): MenuKey | undefined => {
  if (pathname.startsWith("/writer/draft")) return "draft";
  if (pathname.startsWith("/writer/media")) return "media";
  if (pathname.startsWith("/writer/edit-profile")) return "edit-profile";
  if (pathname.startsWith("/writer/upload")) return "upload";
  if (pathname.startsWith("/writer/video")) return "video";
  if (pathname === "/writer" || pathname.startsWith("/writer/"))
    return "dashboard";
  return undefined;
};

const menuItems = [
  {
    key: "dashboard" as MenuKey,
    title: "Dashboard",
    icon: Home,
    url: "/writer",
  },
  {
    key: "video" as MenuKey,
    title: "Create News Video",
    icon: FileVideoIcon,
    url: "/writer/video",
  },
  {
    key: "draft" as MenuKey,
    title: "Draft",
    icon: FileText,
    url: "/writer/draft",
  },
  {
    key: "media" as MenuKey,
    title: "Media",
    icon: Folder,
    url: "/writer/media",
  },
  {
    key: "edit-profile" as MenuKey,
    title: "Edit Profile",
    icon: Settings,
    url: "/writer/edit-profile",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  const active = pathToKey(location.pathname) ?? "dashboard";

  const handleNavigate = (key: MenuKey | string) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) {
      if (isMobile) setOpenMobile(false);
      navigate(item.url);
      return;
    }

    switch (key) {
      case "upload":
        if (isMobile) setOpenMobile(false);
        navigate("/writer/upload");
        break;
      case "logout":
        logout();
        break;
    }
  };

  return (
    <Sidebar className="border-r border-[#E5E5E5]">
      <SidebarContent className="h-screen bg-[#FAFAFA] flex flex-col py-8 px-6">
        <div className="mb-8 px-2">
          <img
            src="/images/MNI.svg"
            alt="MNI"
            className="h-16 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-8 flex-1">
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

          <div className="flex flex-col gap-4">
            <h2 className="px-3 text-[1rem] font-bold text-[#A1A1A1] tracking-wider uppercase">
              Writer
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

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

export default function WriterLayout() {
  const { isMobile } = useRouteLoaderData("root") as { isMobile: boolean };
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["writer", "admin"]}>
        <MediaProvider>
          <SidebarProvider isMobile={isMobile}>
            <div className="flex w-full">
              <AppSidebar />
              <main className="flex-1 bg-card w-full text-label pb-12">
                <Outlet context={{ isMobile }} />
              </main>
            </div>
          </SidebarProvider>
        </MediaProvider>
      </RoleGuard>
    </ProtectedRoute>
  );
}
