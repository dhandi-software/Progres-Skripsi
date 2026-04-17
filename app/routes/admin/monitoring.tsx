import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { MonitoringDesktop, MonitoringMobile } from "~/features/admin/monitoring";

export default function AdminMonitoringRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <MonitoringMobile /> : <MonitoringDesktop />;
}
