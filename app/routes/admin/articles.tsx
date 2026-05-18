import { useOutletContext } from "react-router";
import { ArticlesDesktop, ArticlesMobile } from "~/features/admin/articles";

export default function ArticlesPage() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();
  return isMobile ? <ArticlesMobile /> : <ArticlesDesktop />;
}
