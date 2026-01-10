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

interface PreviewDesktopProps {
  article: Article;
  onBack: () => void;
}

export function PreviewDesktop({ article, onBack }: PreviewDesktopProps) {
  const navigate = useNavigate();

  const handleEditArticle = () => {
    navigate(`/editor/edit-article/${article.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-background p-6 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg font-medium">Review Article</span>
        </button>
        <Button
          className="bg-[#FDA43C] hover:bg-[#FDA43C]/90 text-white flex items-center gap-2 px-4 py-2 rounded-md"
          onClick={handleEditArticle}
        >
          <Edit3 className="w-4 h-4" />
          Edit Article
        </Button>
      </div>

      <div className="w-full">
        {/* Article Header Info */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-medium">
            {article.location || "Location not specified"}
          </p>
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {article.title}
          </h1>
          {article.subHeading && (
            <p className="text-lg text-muted-foreground">
              {article.subHeading}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
          </div>
          <div className="flex gap-2">
            {(article.category && article.category.length > 0) ? (
              article.category.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-muted text-foreground text-xs rounded-full"
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
        <div className="space-y-6 mt-8">
          {article.image && (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-xl">
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
                <p className="text-sm text-muted-foreground italic">
                  {article.imageCaption}
                </p>
              )}
            </>
          )}

          {article.content && (
            <div
              className="prose prose-p:text-foreground prose-p:leading-relaxed max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
