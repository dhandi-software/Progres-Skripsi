import { useParams, useOutletContext } from "react-router";
import CreateArticleDesktop from "../../features/admin/create-article/CreateArticleDesktop";
import CreateArticleMobile from "../../features/admin/create-article/CreateArticleMobile";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();

  return isMobile ? (
    <CreateArticleMobile articleId={id} />
  ) : (
    <CreateArticleDesktop articleId={id} />
  );
}
