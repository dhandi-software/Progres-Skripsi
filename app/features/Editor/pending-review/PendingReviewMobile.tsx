import { useState, useEffect } from "react";
import { Menu, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import { PreviewMobile } from "./components/PreviewMobile";
import { usePendingReview } from "./UsePendingReview";
import { newsApi } from "~/api/news";

export default function PendingReviewMobile() {
    const { setOpenMobile } = useSidebar();
    const [hasPendingNotifications, setHasPendingNotifications] = useState(false);

    const {
        articles,
        isLoading,
        error,
        selectedArticle,
        view,
        selectArticle,
        goBackToList,
    } = usePendingReview();

    // Check for pending notifications
    useEffect(() => {
        const checkPendingNotifications = async () => {
            try {
                const response = await newsApi.getNewsCountByStatus("draft");
                const count = response.data?.count || 0;
                setHasPendingNotifications(count > 0);
            } catch (error) {
                console.error("Error checking pending notifications:", error);
                setHasPendingNotifications(true);
            }
        };
        checkPendingNotifications();
    }, []);

    if (view === "preview" && selectedArticle) {
        return (
            <PreviewMobile
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
        <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col">
            {/* Header Section */}
            <div className="px-6 mb-6 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenMobile(true)}
                        className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors relative"
                    >
                        <Menu className="w-6 h-6 text-[#0D0D12]" />
                        {/* Orange notification dot */}
                        {hasPendingNotifications && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#D94F24] rounded-full" />
                        )}
                    </button>
                    <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
                        Pending Reviews
                    </h1>
                </div>
                <p className="text-[0.875rem] text-[#71717A] font-medium pl-9 leading-relaxed">
                    Review and approve article submissions.
                </p>
            </div>

            {/* Content */}
            <div className="px-6 flex-1">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-[#D94F24] animate-spin mb-4" />
                        <p className="text-sm text-[#71717A]">Loading articles...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <p className="text-[#71717A] text-sm">{error}</p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </div>
                ) : articles.length > 0 ? (
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                className="p-4 rounded-xl border border-[#E5E7EB] bg-white shadow-sm space-y-4"
                            >
                                {/* Article Title */}
                                <div className="flex gap-3 items-start">
                                    <p className="text-base font-semibold text-[#0A0A0A] leading-6 flex-1">
                                        {article.title}
                                    </p>
                                </div>

                                {/* Author & Status Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {/* Avatar placeholder */}
                                        <div className="w-6 h-6 rounded-full bg-[#F4F4F5] flex items-center justify-center overflow-hidden">
                                            {article.authorAvatar ? (
                                                <img
                                                    src={article.authorAvatar}
                                                    alt={article.author}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-[0.625rem] font-medium text-[#71717A]">
                                                    {article.author.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-[#0D0D12]">
                                            {article.author}
                                        </span>
                                    </div>
                                    <span className="text-xs font-medium text-[#71717A] bg-[#F4F4F5] px-2 py-1 rounded-full">
                                        {article.status}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-[#E5E7EB]" />

                                {/* Date & Action Row */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-[#71717A]">
                                        {article.date}
                                    </span>
                                    <Button
                                        className="bg-[#D25026] hover:bg-[#B8421F] text-white h-8 px-4 text-xs font-medium rounded-lg"
                                        onClick={() => selectArticle(article)}
                                    >
                                        Review
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-24 h-24 opacity-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-4xl">📋</span>
                        </div>
                        <p className="text-[#71717A] text-xs font-medium">
                            There is no news to review.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
