import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import PendingReviewDesktop from "~/features/Editor/pending-review/PendingReviewDesktop";
import PendingReviewMobile from "~/features/Editor/pending-review/PendingReviewMobile";

export default function pending() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <PendingReviewMobile /> : <PendingReviewDesktop />;
}
