import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import GuideDesktop from "~/features/landing/home/components/Guide/GuideDesktop";
import GuideMobile from "~/features/landing/home/components/Guide/GuideMobile";

export default function Guide() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <GuideMobile /> : <GuideDesktop />;
}
