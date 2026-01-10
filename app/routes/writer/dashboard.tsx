import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import DashboardDesktop from "~/features/writer/dashboard/DashboardDesktop";
import DashboardMobile from "~/features/writer/dashboard/DashboardMobile";

export default function EventDetail() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <DashboardMobile /> : <DashboardDesktop />;
}
