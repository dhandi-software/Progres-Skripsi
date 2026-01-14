import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import FAQDesktop from "~/features/landing/home/components/FAQ/FAQDesktop";
import FAQMobile from "~/features/landing/home/components/FAQ/FAQMobile";

export default function FAQPage() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <FAQMobile /> : <FAQDesktop />;
}
