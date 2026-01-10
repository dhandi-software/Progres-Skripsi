import { AdvertisementMobile } from "~/components/ui/AdvertisementMobile";
import type { ArticleDetail } from "~/api/types";

interface ArticleBodySectionMobileProps {
  article: ArticleDetail;
}

export function ArticleBodySectionMobile({
  article,
}: ArticleBodySectionMobileProps) {
  return (
    <>
      {/* Sub Heading */}
      {article.sub_heading && (
        <p className="text-sm text-muted-foreground italic">
          {article.sub_heading}
        </p>
      )}

      <article
        className="w-full text-sm text-foreground space-y-4"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </>
  );
}
