import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import CreateArticleDesktop from "~/features/admin/create-article/CreateArticleDesktop";
import CreateArticleMobile from "~/features/admin/create-article/CreateArticleMobile";

export default function CreateArticlePage() {
    const { isMobile } = useOutletContext<ContextType>();
    return isMobile ? <CreateArticleMobile /> : <CreateArticleDesktop />;
}
