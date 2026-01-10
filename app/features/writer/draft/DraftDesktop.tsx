import { useNavigate } from "react-router";
import { useDraft } from "./UseDraft";
import StatusCard from "~/components/ui/StatusCard";
import { Toast } from "~/components/ui/toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaApi } from "~/api/mediaApi";

export default function DraftDesktop() {
    const navigate = useNavigate();
    const {
        states: { drafts, loading, totalPages, currentPage, toastProps },
        setters: { hideToast },
        handlers: {
            handleEdit,
            getTimeAgo,
            getDisplayData,
            handlePageChange,
            handlePrevPage,
            handleNextPage,
            getPageNumbers
        },
    } = useDraft({ itemsPerPage: 8 });

    // Wait, I messed up the setters/handlers in useDraft return. Let me check UseDraft.tsx again.
    // UseDraft return:
    // setters: { setCurrentPage, setToastProps, hideToast }
    // handlers: { handleEdit, getTimeAgo, getDisplayData, handlePageChange, handlePrevPage, handleNextPage, getPageNumbers }

    // I'll fix the destructuring.

    return (
        <div className="w-full min-h-screen px-[1.5rem] py-[1.5rem] bg-white">
            <div className="w-full h-fit flex flex-col gap-[0.75rem] mb-[2rem]">
                <h1 className="w-full text-subheading-h2 text-foreground">
                    Draft Articles
                </h1>
                <p className="w-full h-fit text-[0.875rem] leading-[1.25rem] text-[#0A0A0A]/60">
                    Your unpublished articles saved as drafts
                </p>
            </div>

            {loading ? (
                <div className="w-full h-[16rem] flex items-center justify-center text-[0.875rem] text-gray-500">
                    Loading drafts...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-4 gap-[1.5rem]">
                        {getDisplayData().map((item) => {
                            const isEmpty = item.id.startsWith("empty-");

                            return (
                                <div key={item.id} className="relative group h-fit">
                                    <StatusCard
                                        title={isEmpty ? "Create New Article" : item.title || "Untitled Article"}
                                        status={isEmpty ? "no-image" : "draft"}
                                        views={isEmpty ? "0" : `${item.views}`}
                                        timeText={isEmpty ? "No date" : getTimeAgo(item.createdAt)}
                                        imageSrc={
                                            isEmpty
                                                ? undefined
                                                : item.image
                                                    ? mediaApi.getFileUrl(item.image)
                                                    : "/images/Picture.svg"
                                        }
                                        onEdit={
                                            isEmpty
                                                ? () => navigate("/writer/upload")
                                                : () => handleEdit(item)
                                        }
                                        lineClamp={2}
                                        className="h-full w-full"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {drafts.length === 0 && currentPage === 1 && (
                        <div className="text-center mt-[2rem]">
                            <p className="text-[0.875rem] text-[#737373] mb-[1rem]">
                                No draft articles yet. Click on any empty card to create your first draft!
                            </p>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-[2rem] flex items-center justify-center gap-[0.5rem]">
                            <button
                                onClick={() => handlePrevPage()}
                                disabled={currentPage === 1}
                                className="px-[0.75rem] py-[0.5rem] rounded-md border border-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white"
                            >
                                <ChevronLeft className="w-[1.25rem] h-[1.25rem] text-[#0A0A0A]" />
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-[1rem] py-[0.5rem] rounded-md border transition-colors ${currentPage === page
                                        ? "bg-primary text-white border-primary"
                                        : "border-[#E5E5E5] hover:bg-gray-50 bg-white text-[#0A0A0A]"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handleNextPage()}
                                disabled={currentPage === totalPages}
                                className="px-[0.75rem] py-[0.5rem] rounded-md border border-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white"
                            >
                                <ChevronRight className="w-[1.25rem] h-[1.25rem] text-[#0A0A0A]" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {toastProps && (
                <div className="fixed top-[1.5rem] right-[1.5rem] z-50">
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

// Fixed destructuring and function calls.
