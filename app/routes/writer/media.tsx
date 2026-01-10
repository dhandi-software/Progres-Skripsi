import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import MediaDesktop from "~/features/writer/media/MediaDesktop";
import MediaMobile from "~/features/writer/media/MediaMobile";

export default function WritterMedia() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <MediaMobile /> : <MediaDesktop />;
}
