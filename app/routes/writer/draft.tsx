import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import DraftDesktop from "~/features/writer/draft/DraftDesktop";
import DraftMobile from "~/features/writer/draft/DraftMobile";

export default function EventDetail() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <DraftMobile /> : <DraftDesktop />;
}
