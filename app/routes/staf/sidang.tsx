import { useOutletContext } from "react-router";
import type { ContextType } from "../../root";
import { StafSidangDesktop, StafSidangMobile } from "../../features/staf/sidang";

export default function StafSidangRoute() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <StafSidangMobile /> : <StafSidangDesktop />;
}
