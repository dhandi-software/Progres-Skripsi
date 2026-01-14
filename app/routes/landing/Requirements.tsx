import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import RequirementsDesktop from "~/features/landing/home/components/Requirements/RequirementsDesktop";
import RequirementsMobile from "~/features/landing/home/components/Requirements/RequirementsMobile";

export default function RequirementsPage() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <RequirementsMobile /> : <RequirementsDesktop />;
}
