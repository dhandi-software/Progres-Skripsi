import { useOutletContext } from "react-router";
import type { ContextType } from "../../root";
import { SidangDesktop, SidangMobile } from "../../features/dosen/sidang";

export default function SidangRoute() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <SidangMobile /> : <SidangDesktop />;
}
