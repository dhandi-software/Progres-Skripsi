import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { DashboardDesktop, DashboardMobile } from "~/features/admin/dashboard";

export default function AdminDashboardRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <DashboardMobile /> : <DashboardDesktop />;
}
