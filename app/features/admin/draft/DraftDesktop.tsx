import { useNavigate } from "react-router";
import { useDraft } from "./UseDraft";
import StatusCard from "~/components/ui/StatusCard";
import { Toast } from "~/components/ui/toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaApi } from "~/api/mediaApi";

export default function DraftDesktop() {
    const navigate = useNavigate();
    const {
        drafts,
        loading,
        totalPages,
        currentPage,
        toastProps,
        hideToast,
        handleEdit,
        getTimeAgo,
        getDisplayData,
        handlePrevPage,
        handleNextPage,
        handlePageChange,
        getPageNumbers,
    } = useDraft({ itemsPerPage: 8 });

    const displayData = getDisplayData();

    // Filter out empty cards jika sudah ada draft yang asli
    const filteredData = displayData.filter((item) => {
        // Jika tidak ada draft yang asli sama sekali, tampilkan semua (termasuk empty cards)
        if (drafts.length === 0) {
            return true;
        }

        // Jika sudah ada draft yang asli, sembunyikan empty cards
        // Hanya tampilkan item yang ID-nya TIDAK dimulai dengan "empty-"
        return !item.id.startsWith("empty-");
    });

    return (
        <div className="w-full min-h-screen px-6 py-6 gap-2xl bg-white">
            {/* Header Section */}
            <div className="w-full h-fit flex flex-col gap-3 mb-6">
                <h1 className="w-full text-[1.875rem] font-semibold leading-[2.25rem] text-[#0A0A0A]">
                    Draft Articles
                </h1>
                <p className="w-full h-fit text-sm leading-5 text-[#0A0A0A]/60">
                    Your unpublished articles saved as drafts
                </p>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="w-full h-64 flex items-center justify-center text-sm text-gray-500">
                    Loading drafts...
                </div>
            ) : (
                <>
                    {/* Articles Grid - 4 columns */}
                    <div className="grid grid-cols-4 gap-6">
                        {filteredData.map((item) => {
                            // Sekarang semua item di filteredData adalah draft asli
                            // karena empty cards sudah difilter
                            return (
                                <div
                                    key={item.id}
                                    className="relative group h-full"
                                >
                                    <StatusCard
                                        title={item.title || "Untitled Article"}
                                        status="draft"
                                        views={`${item.views}`}
                                        timeText={getTimeAgo(item.createdAt)}
                                        imageSrc={
                                            item.image
                                                ? mediaApi.getFileUrl(
                                                      item.image,
                                                  )
                                                : "/images/Picture.svg"
                                        }
                                        onEdit={() => handleEdit(item)}
                                        lineClamp={2}
                                        className="h-full w-full"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Text jika tidak ada draft sama sekali */}
                    {drafts.length === 0 && (
                        <div className="text-center mt-8">
                            <p className="text-sm text-[#737373] mb-4">
                                No draft articles yet. Click on any empty card
                                to create your first draft!
                            </p>

                            {/* Grid untuk empty cards jika tidak ada draft sama sekali */}
                            <div className="grid grid-cols-4 gap-6 mt-6">
                                {displayData
                                    .filter((item) =>
                                        item.id.startsWith("empty-"),
                                    )
                                    .slice(0, 1) // Hanya tampilkan satu empty card
                                    .map((item) => (
                                        <div
                                            key={item.id}
                                            className="relative group h-fit"
                                        >
                                            <StatusCard
                                                title="Create New Article"
                                                status="no-image"
                                                views="0"
                                                timeText="No date"
                                                onEdit={() =>
                                                    navigate("/admin/upload")
                                                }
                                                lineClamp={2}
                                                className="h-full w-full"
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && drafts.length > 0 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-md border border-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white"
                            >
                                <ChevronLeft className="w-5 h-5 text-[#0A0A0A]" />
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-4 py-2 rounded-md border transition-colors ${
                                        currentPage === page
                                            ? "bg-[#D25026] text-white border-[#D25026]"
                                            : "border-[#E5E5E5] hover:bg-gray-50 bg-white text-[#0A0A0A]"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-md border border-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors bg-white"
                            >
                                <ChevronRight className="w-5 h-5 text-[#0A0A0A]" />
                            </button>
                        </div>
                    )}
                </>
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
