import { useNavigate } from "react-router";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";
import { useDraft } from "./UseDraft";
import StatusCard from "~/components/ui/StatusCard";
import { Toast } from "~/components/ui/toast";
import { mediaApi } from "~/api/mediaApi";

export function DraftMobile() {
    const navigate = useNavigate();
    const { setOpenMobile } = useSidebar();
    const {
        drafts,
        loading,
        totalPages,
        currentPage,
        toastProps,
        hideToast,
        handleEdit,
        getTimeAgo,
        handlePrevPage,
        handleNextPage,
        handlePageChange,
        getPageNumbers,
    } = useDraft({ itemsPerPage: 8 });

    return (
        <div className="w-full min-h-screen bg-white">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setOpenMobile(true)} className="p-1 -ml-1">
                        <Menu className="w-6 h-6 text-gray-900" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Draft Articles</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4">
                {loading ? (
                    <div className="w-full h-32 flex items-center justify-center text-sm text-gray-500">
                        Loading drafts...
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="w-full h-32 flex items-center justify-center text-sm text-gray-500">
                        No draft articles yet.
                    </div>
                ) : (
                    drafts.map((draft) => (
                        <StatusCard
                            key={draft.id}
                            title={draft.title || "Untitled Article"}
                            status="draft"
                            views={`${draft.views}`}
                            timeText={getTimeAgo(draft.createdAt)}
                            imageSrc={
                                draft.image
                                    ? mediaApi.getFileUrl(draft.image)
                                    : "/images/Picture.svg"
                            }
                            onEdit={() => handleEdit(draft)}
                            className="w-full bg-white border border-[#E5E5E5] shadow-sm"
                            lineClamp={2}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && drafts.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 pb-10 px-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-md border transition-colors ${currentPage === page
                                    ? "bg-[#D25026] text-white border-[#D25026]"
                                    : "border-gray-300 hover:bg-gray-50 bg-white"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {toastProps && (
                <div className="fixed top-6 right-6 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={hideToast}
                    />
                </div>
            )}
        </div>
    );
}
