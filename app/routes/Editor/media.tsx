import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import MediaDesktop from "~/features/Editor/media/MediaDesktop";
import MediaMobile from "~/features/Editor/media/MediaMobile";

export default function Media() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <MediaMobile /> : <MediaDesktop />;
}
