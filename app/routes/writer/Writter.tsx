import { useOutletContext, useSearchParams } from "react-router";
import type { ContextType } from "~/root";
import CreateArticleDesktop from "~/features/writer/create-article/CreateArticleDesktop";
import CreateArticleMobile from "~/features/writer/create-article/CreateArticleMobile";

export default function WritterRoute() {
    const { isMobile } = useOutletContext<ContextType>();
    const [searchParams] = useSearchParams();
    const articleId = searchParams.get("id") || undefined;

    return isMobile ? <CreateArticleMobile articleId={articleId} /> : <CreateArticleDesktop articleId={articleId} />;
}
