import { LogActivityDesktop } from "~/features/admin/log-activity/LogActivityDesktop";
import { LogActivityMobile } from "~/features/admin/log-activity/LogActivityMobile";
import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

export default function LogActivityRoute() {
  const { isMobile } = useOutletContext<ContextType>();

  return isMobile ? <LogActivityMobile /> : <LogActivityDesktop />;
}
