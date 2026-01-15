import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import FormatDesktop from "~/features/landing/home/components/Format/FormatDesktop";
import FormatMobile from "~/features/landing/home/components/Format/FormatMobile";

export default function FormatPage() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <FormatMobile /> : <FormatDesktop />;
}
