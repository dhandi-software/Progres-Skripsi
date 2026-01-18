import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { DashboardDesktop, DashboardMobile } from "~/features/mahasiswa/dashboard";

export default function DashboardRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <DashboardMobile /> : <DashboardDesktop />;
}

