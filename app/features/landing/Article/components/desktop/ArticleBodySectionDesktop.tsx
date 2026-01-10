import Topics from "~/components/ui/Topics";
import type { ArticleDetail } from "~/api/types";

interface ArticleBodySectionDesktopProps {
  article: ArticleDetail;
}

export function ArticleBodySectionDesktop({
  article,
}: ArticleBodySectionDesktopProps) {
  return (
    <>
      {/* Hero Picture */}
      <div className="w-full flex flex-col gap-2">
        <img
          src="/images/Picture.svg"
          alt={article.image_caption || article.title}
          className="w-full h-[25rem] rounded-md object-cover"
        />
        {article.image_caption && (
          <p className="w-full text-paragraph-sm text-foreground">
            {article.image_caption}
          </p>
        )}
      </div>

      {/* Sub Heading */}
      {article.sub_heading && (
        <div className="w-full">
          <p className="text-paragraph text-muted-foreground italic">
            {article.sub_heading}
          </p>
        </div>
      )}

      {/* Article Body */}
      <article
        className="w-full text-paragraph-sm text-foreground space-y-4"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {/* Topics */}
      {article.topics && article.topics.length > 0 && (
        <Topics
          title="Topics"
          topics={article.topics
            .map((t) => t.topic?.name)
            .filter(Boolean)}
        />
      )}
    </>
  );
}
