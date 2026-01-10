import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { BreadArticleDesktop } from "~/components/template/breadcrumb/BreadArticleDesktop";
import { BreadArticleMobile } from "~/components/template/breadcrumb/BreadArticleMobile";

export default function BreadcrumbArticle() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <BreadArticleMobile /> : <BreadArticleDesktop />;
}
