import Topics from "~/components/ui/Topics";
import type { ArticleDetail } from "~/api/types";

interface ArticleTopicsSectionMobileProps {
  article: ArticleDetail;
}

export function ArticleTopicsSectionMobile({
  article,
}: ArticleTopicsSectionMobileProps) {
  if (!article.topics || article.topics.length === 0) {
    return null;
  }

  return (
    <Topics
      title="Topics"
      topics={article.topics.map((t) => t.topic?.name).filter(Boolean)}
    />
  );
}
