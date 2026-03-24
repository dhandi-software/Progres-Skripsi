import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import DashboardDesktop from "~/features/admin/dashboard/DashboardDesktop";
import DashboardMobile from "~/features/admin/dashboard/DashboardMobile";

export default function AdminDashboardRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <DashboardMobile /> : <DashboardDesktop />;
}
