import { useOutletContext } from "react-router";
import { ArticlesDesktop } from "../../features/admin/articles/ArticlesDesktop";
import { ArticlesMobile } from "../../features/admin/articles/ArticlesMobile";

export default function ArticlesPage() {
  const { isMobile } = useOutletContext<{ isMobile: boolean }>();
  return isMobile ? <ArticlesMobile /> : <ArticlesDesktop />;
}
