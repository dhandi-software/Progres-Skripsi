import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { PeninjauanDesktop, PeninjauanMobile } from "~/features/dosen/pengajuan";
import { usePeninjauan } from "~/features/dosen/pengajuan/usePeninjauan";
import { useAuth } from "~/hooks/useAuth";

export default function PeninjauanRoute() {
    const { user } = useAuth();
    const { isMobile } = useOutletContext<ContextType>();
    
    const {
        filteredList,
        paginatedList,
        loading,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortOrder,
        setSortOrder,
        currentPage,
        totalPages,
        handlePageChange,
        handleDownloadPDF,
        itemsPerPage
    } = usePeninjauan(user as any);

    if (loading) return <div className="p-8 font-['Noto_Sans'] flex justify-center text-gray-500">Loading...</div>;

    const props = {
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortOrder,
        setSortOrder,
        paginatedList,
        handleDownloadPDF,
        loading,
        currentPage,
        totalPages,
        itemsPerPage,
        handlePageChange,
        filteredListLength: filteredList.length
    };

    return (
        <div className="p-6 relative w-full mx-auto font-sans min-h-screen pb-16">
            {!isMobile ? (
                <PeninjauanDesktop {...props} />
            ) : (
                <PeninjauanMobile {...props} />
            )}
        </div>
    );
}
