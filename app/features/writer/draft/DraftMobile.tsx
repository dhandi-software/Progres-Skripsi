import { useNavigate } from "react-router";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebar } from "~/components/ui/sidebar";
import { useDraft } from "./UseDraft";
import StatusCard from "~/components/ui/StatusCard";
import { Toast } from "~/components/ui/toast";
import { mediaApi } from "~/api/mediaApi";

export default function DraftMobile() {
    const navigate = useNavigate();
    const { setOpenMobile } = useSidebar();
    const {
        states: { drafts, loading, totalPages, currentPage, toastProps },
        setters: { hideToast },
        handlers: {
            handleEdit,
            getTimeAgo,
            handlePrevPage,
            handleNextPage,
            handlePageChange,
            getPageNumbers
        },
    } = useDraft({ itemsPerPage: 4 });

    return (
        <div className="w-full min-h-screen bg-white">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-[1rem] py-[1rem]">
                <div className="flex items-center gap-[0.75rem]">
                    <button onClick={() => setOpenMobile(true)} className="p-[0.25rem] -ml-[0.25rem]">
                        <Menu className="w-[1.5rem] h-[1.5rem] text-gray-900" />
                    </button>
                    <h1 className="text-[1.125rem] font-bold text-gray-900">Draft Articles</h1>
                </div>
            </div>

            <div className="p-[1rem] flex flex-col gap-[1rem]">
                {loading ? (
                    <div className="w-full h-[8rem] flex items-center justify-center text-[0.875rem] text-gray-500">
                        Loading drafts...
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="w-full h-[8rem] flex items-center justify-center text-[0.875rem] text-gray-500 text-center">
                        No draft articles yet.<br />
                        <button
                            onClick={() => navigate("/writer/upload")}
                            className="text-primary font-bold mt-[0.5rem]"
                        >
                            Create One
                        </button>
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

            {!loading && drafts.length > 0 && totalPages > 1 && (
                <div className="mt-[2rem] flex items-center justify-center gap-[0.5rem] pb-[2.5rem] px-[1rem]">
                    <button
                        onClick={() => handlePrevPage()}
                        disabled={currentPage === 1}
                        className="px-[0.75rem] py-[0.5rem] rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-[1.25rem] h-[1.25rem] text-gray-900" />
                    </button>

                    {getPageNumbers().map((page) => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-[1rem] py-[0.5rem] rounded-md border transition-colors ${currentPage === page
                                ? "bg-primary text-white border-primary"
                                : "border-gray-300 hover:bg-gray-50 bg-white text-gray-900"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => handleNextPage()}
                        disabled={currentPage === totalPages}
                        className="px-[0.75rem] py-[0.5rem] rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                        <ChevronRight className="w-[1.25rem] h-[1.25rem] text-gray-900" />
                    </button>
                </div>
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
