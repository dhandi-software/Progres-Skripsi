import type { ArticleDetail } from "~/api/types";

interface ArticleHeroSectionMobileProps {
  article: ArticleDetail;
}

export function ArticleHeroSectionMobile({
  article,
}: ArticleHeroSectionMobileProps) {
  return (
    <div className="w-full flex flex-col gap-2">
      <img
        src="/images/Picture.svg"
        alt={article.image_caption || article.title}
        className="w-full h-48 rounded-md object-cover"
      />
      {article.image_caption && (
        <p className="text-xs text-muted-foreground">
          {article.image_caption}
        </p>
      )}
    </div>
  );
}
