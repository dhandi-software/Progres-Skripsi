import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import ScheduleDesktop from "~/features/landing/home/components/Schedule/ScheduleDesktop";
import ScheduleMobile from "~/features/landing/home/components/Schedule/ScheduleMobile";

export default function SchedulePage() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <ScheduleMobile /> : <ScheduleDesktop />;
}
