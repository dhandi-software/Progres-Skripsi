import { Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PreviewDesktop } from "./components/PreviewDesktop";
import { usePendingReview } from "./UsePendingReview";

export default function PendingReviewDesktop() {
    const {
        articles,
        isLoading,
        error,
        selectedArticle,
        view,
        selectArticle,
        goBackToList,
    } = usePendingReview();

    if (view === "preview" && selectedArticle) {
        return (
            <PreviewDesktop
                article={{
                    id: selectedArticle.id,
                    number: selectedArticle.number,
                    title: selectedArticle.title,
                    author: selectedArticle.author,
                    date: selectedArticle.date,
                    status: selectedArticle.status,
                    content: selectedArticle.body,
                    image: selectedArticle.image,
                    imageCaption: selectedArticle.imageCaption,
                    category: selectedArticle.categories,
                    subHeading: selectedArticle.subHeading,
                }}
                onBack={goBackToList}
            />
        );
    }

    return (
        <div className="w-full min-h-screen p-6 space-y-6">
            {/* Header Section */}
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-foreground">
                    Pending Reviews
                </h1>
                <p className="text-sm text-muted-foreground">
                    Review and approve article submissions.
                </p>
            </div>

            {/* Table Container */}
            <div className="w-full bg-background border border-border-subtle rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[80px_1fr_130px_160px_130px_130px] border-b border-border-subtle bg-background-card h-[52px]">
                    <div className="p-4 border-r border-border-subtle flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Number
                        </span>
                    </div>
                    <div className="p-4 border-r border-border-subtle flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Title
                        </span>
                    </div>
                    <div className="p-4 border-r border-border-subtle flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Author
                        </span>
                    </div>
                    <div className="p-4 border-r border-border-subtle flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Date
                        </span>
                    </div>
                    <div className="p-4 border-r border-border-subtle flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Status
                        </span>
                    </div>
                    <div className="p-4 flex items-center justify-center">
                        <span className="text-sm font-semibold text-foreground">
                            Action
                        </span>
                    </div>
                </div>

                {/* Table Rows or Loading/Empty State */}
                {isLoading ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#D94F24] animate-spin mb-4" />
                        <p className="text-muted-foreground text-sm">Loading articles...</p>
                    </div>
                ) : error ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <p className="text-muted-foreground text-sm">{error}</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                ) : articles.length > 0 ? (
                    articles.map((article) => (
                        <div
                            key={article.id}
                            className="grid grid-cols-[80px_1fr_130px_160px_130px_130px] border-b border-border-subtle last:border-b-0 hover:bg-muted/50 transition-colors"
                        >
                            {/* Number */}
                            <div className="px-md py-md flex items-center justify-center">
                                <span className="font-geist-mono text-md leading-6 text-foreground">
                                    {article.number}
                                </span>
                            </div>

                            {/* Title */}
                            <div className="px-md py-md flex items-center">
                                <p className="w-fit h-fit text-md leading-6 text-foreground line-clamp-2">
                                    {article.title}
                                </p>
                            </div>

                            {/* Author */}
                            <div className="px-md py-md flex items-center justify-center">
                                <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                    {article.author}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="px-md py-md flex items-center justify-center">
                                <span className="text-sm text-foreground text-center">
                                    {article.date}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="px-md flex items-center justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-[2.5rem] bg-background border-accent-info-foreground text-foreground hover:bg-accent-info-foreground/10"
                                >
                                    {article.status}
                                </Button>
                            </div>

                            {/* Action */}
                            <div className="p-4 flex items-center justify-center">
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
                                    onClick={() => selectArticle(article)}
                                >
                                    Review
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-32 h-32 opacity-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-5xl">📋</span>
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">
                            There is no news to review.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
