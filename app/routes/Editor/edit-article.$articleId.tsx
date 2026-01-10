import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";

import EditArticleDesktop from "~/features/Editor/edit-article/EditArticleDesktop";
import EditArticleMobile from "~/features/Editor/edit-article/EditArticleMobile";

export default function EditorEditArticle() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <EditArticleMobile /> : <EditArticleDesktop />;
}
