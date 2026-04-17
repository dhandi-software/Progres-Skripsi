import { useParams, useOutletContext } from "react-router";
import { CreateArticleDesktop, CreateArticleMobile } from "~/features/admin/create-article";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();

  return isMobile ? (
    <CreateArticleMobile articleId={id} />
  ) : (
    <CreateArticleDesktop articleId={id} />
  );
}
