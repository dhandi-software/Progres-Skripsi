import { Button } from "~/components/ui/button";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useNavigate } from "react-router";

interface Article {
  id: number | string;
  number: string;
  title: string;
  author: string;
  date: string;
  status: string;
  content?: string;
  image?: string;
  imageCaption?: string;
  category?: string[];
  location?: string;
  subHeading?: string;
}

interface PreviewMobileProps {
  article: Article;
  onBack: () => void;
}

export function PreviewMobile({ article, onBack }: PreviewMobileProps) {
  const navigate = useNavigate();

  const handleEditArticle = () => {
    navigate(`/editor/edit-article/${article.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/10 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-base font-semibold">Review Article</span>
        </button>
        <Button
          className="bg-[#FDA43C] hover:bg-[#FDA43C]/90 text-white min-w-0 px-3 py-1.5 h-auto text-sm"
          onClick={handleEditArticle}
        >
          <Edit3 className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Article Header Info */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">
            {article.location || "Location not specified"}
          </p>
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {article.title}
          </h1>
          {article.subHeading && (
            <p className="text-sm text-muted-foreground">
              {article.subHeading}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Created by {article.author}</span>
            <span>{article.date}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(article.category && article.category.length > 0) ? (
              article.category.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-0.5 bg-muted text-foreground text-[10px] font-medium rounded-full"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No categories</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {article.image && (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={article.image}
                  alt="Article thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1578319439584-104c94d37305?q=80&w=2070&auto=format&fit=crop";
                  }}
                />
              </div>
              {article.imageCaption && (
                <p className="text-[10px] text-muted-foreground italic">
                  {article.imageCaption}
                </p>
              )}
            </>
          )}

          {article.content && (
            <div
              className="prose prose-sm prose-p:text-foreground prose-p:leading-relaxed max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
