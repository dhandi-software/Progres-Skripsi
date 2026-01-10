import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { IndexDesktop, IndexMobile } from "~/features/landing/index/pages";
export default function Index() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <IndexMobile /> : <IndexDesktop />;
}
