import { useState, useRef, useEffect } from "react";
import { Plus, Search, X, Check, Loader2, Menu, Pencil, Trash2, ClipboardPen } from "lucide-react";
import { useMedia, type MediaItem } from "./MediaContext";
import { useSidebar } from "~/components/ui/sidebar";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { Toast } from "~/components/ui/toast";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";

interface MediaMobileProps {
    standalone?: boolean;
    onClose?: () => void;
    onImageSelect?: (image: MediaItem) => void;
}

export default function MediaMobile({
    standalone = true,
    onClose,
    onImageSelect,
}: MediaMobileProps) {
    const { setOpenMobile } = useSidebar();
    const {
        mediaItems,
        addMediaItems,
        deleteMediaItems,
        updateMediaItem,
        refreshMedia,
        pagination,
        isLoading: isContextLoading
    } = useMedia();

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [renameInput, setRenameInput] = useState("");
    const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
    const [toastProps, setToastProps] = useState<{
        title: string;
        variant: "success" | "destructive" | "default";
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const itemsPerPage = 4;

    // Client-side search filtering
    const filteredItems = searchQuery.trim()
        ? mediaItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : mediaItems;

    // Use totalItems from filtered list when doing client-side filtering
    const totalItems = pagination?.totalRows || filteredItems.length;
    const totalPages = pagination?.totalPages || Math.ceil(totalItems / itemsPerPage);

    // If server returned all items (no server pagination), do client-side pagination
    const paginatedItems = pagination?.totalPages
        ? mediaItems
        : filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const showEditButton = selectedItems.size === 1;
    const showDeleteButton = selectedItems.size > 0;

    // Trigger fetch on page/search change
    useEffect(() => {
        refreshMedia({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery
        });
    }, [currentPage, searchQuery]);

    // Sync selectAll with selection state
    useEffect(() => {
        if (selectedItems.size === paginatedItems.length && paginatedItems.length > 0) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedItems, paginatedItems]);

    const showToast = (
        title: string,
        variant: "success" | "destructive" | "default" = "success"
    ) => {
        setToastProps({ title, variant });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            await addMediaItems(Array.from(files));
            showToast("Image uploaded successfully");
            await refreshMedia({
                page: 1,
                limit: itemsPerPage,
                search: searchQuery
            });
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to upload image:", error);
            showToast("Failed to upload image", "destructive");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    const toggleSelect = (itemId: string) => {
        if (!standalone) {
            setSelectedItems(new Set([itemId]));
            return;
        }
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(paginatedItems.map((item) => item.id));
            setSelectedItems(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleEditSelected = () => {
        if (!showEditButton) return;
        const selectedId = Array.from(selectedItems)[0];
        const selectedItem = mediaItems.find((item) => item.id === selectedId);
        if (selectedItem) {
            setEditingItem(selectedItem);
            const currentName = selectedItem.name.replace(/\.[^/.]+$/, "");
            setRenameInput(currentName);
            setShowRenameModal(true);
        }
    };

    const handleRename = async () => {
        if (!editingItem || !renameInput.trim()) return;
        try {
            const newName = `${renameInput.trim()}.${editingItem.extension}`;
            await updateMediaItem(editingItem.id, newName);
            setShowRenameModal(false);
            setRenameInput("");
            setEditingItem(null);
            showToast("File name successfully changed");
            refreshMedia({
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery,
            });
        } catch (error) {
            console.error("Error in handleRename:", error);
            showToast("Failed to rename file", "destructive");
        }
    };

    const cancelRename = () => {
        setShowRenameModal(false);
        setRenameInput("");
        setEditingItem(null);
    };

    const handleDeleteSelected = () => {
        if (!showDeleteButton) return;
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        await deleteMediaItems(Array.from(selectedItems));
        setSelectedItems(new Set());
        setSelectAll(false);
        setShowDeleteModal(false);
        showToast("Image successfully deleted");
        refreshMedia({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleImport = () => {
        if (onImageSelect && selectedItems.size === 1) {
            const selectedId = Array.from(selectedItems)[0];
            const selectedItem = mediaItems.find((item) => item.id === selectedId);
            if (selectedItem) {
                onImageSelect(selectedItem);
            }
        }
    };

    return (
        <>
            <div className={cn(
                "w-full bg-white flex flex-col rounded-xl",
                standalone ? "min-h-screen" : "max-h-[70vh] overflow-hidden"
            )}>
                {/* Header Section */}
                {standalone ? (
                    <div className="px-6 pt-4 pb-6 flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setOpenMobile(true)}
                                className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <Menu className="w-6 h-6 text-[#0D0D12]" />
                            </button>
                            <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
                                Media
                            </h1>
                        </div>
                        <p className="text-[0.875rem] text-[#71717A] font-medium pl-9 leading-relaxed">
                            Manage editorial media content.
                        </p>
                    </div>
                ) : (
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                        <h1 className="text-lg font-bold text-[#0D0D12]">Media Library</h1>
                        <button className="p-1 -mr-1" onClick={onClose}>
                            <X className="w-6 h-6 text-[#0D0D12]" />
                        </button>
                    </div>
                )}

                <div className="flex-1 min-h-0 overflow-auto px-6 py-4 flex flex-col gap-6">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-sm border border-gray-200 bg-white text-[#0D0D12] font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Image
                                </>
                            )}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search image"
                            className="w-full h-12 pl-11 pr-11 bg-white border border-gray-200 rounded-sm text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24] transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {/* Selection Controls */}
                    {standalone && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 cursor-pointer" onClick={handleSelectAll}>
                                <div className={cn(
                                    "w-5 h-5 rounded shadow-sm border flex items-center justify-center transition-colors",
                                    selectAll ? "bg-[#D25026] border-[#D25026]" : "bg-white border-gray-300"
                                )}>
                                    {selectAll && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm font-medium text-[#0D0D12]">Select all</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleEditSelected}
                                    disabled={!showEditButton}
                                    className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors border",
                                        showEditButton
                                            ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                                            : "bg-gray-50 border-gray-100 text-gray-300"
                                    )}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={!showDeleteButton}
                                    className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors border",
                                        showDeleteButton
                                            ? "bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 shadow-sm"
                                            : "bg-gray-50 border-gray-100 text-gray-300"
                                    )}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                        {paginatedItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-2 cursor-pointer group"
                                onClick={() => toggleSelect(item.id)}
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 shadow-xs">
                                    {item.isLoading && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                            <Loader2 className="w-6 h-6 text-[#D94F24] animate-spin" />
                                        </div>
                                    )}
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className={cn(
                                            "w-full h-full object-cover transition-transform group-hover:scale-105",
                                            item.isLoading && "blur-[0.125rem]"
                                        )}
                                    />
                                    {/* Selection Indicator */}
                                    <div
                                        className={cn(
                                            "absolute bottom-3 right-3 w-6 h-6 rounded-lg border flex items-center justify-center transition-all shadow-sm",
                                            selectedItems.has(item.id)
                                                ? "bg-[#D94F24] border-[#D94F24]"
                                                : "bg-white border-white"
                                        )}
                                    >
                                        {selectedItems.has(item.id) && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-[0.75rem] font-medium text-gray-500 truncate px-1">
                                    {item.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {!isContextLoading && paginatedItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-sm">No images found</p>
                        </div>
                    )}

                    {/* Description and Photo Count */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-xs text-gray-500">Description about this media.</p>
                        <span className="text-xs font-medium text-[#0D0D12]">
                            {paginatedItems.length} of {totalItems}
                        </span>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="py-4">
                            <Pagination>
                                <PaginationContent className="flex items-center gap-2">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className={cn(
                                                "w-10 h-10 p-0 flex items-center justify-center rounded-xl border-none transition-colors",
                                                currentPage === 1 ? "opacity-30 pointer-events-none" : "text-gray-400"
                                            )}
                                        />
                                    </PaginationItem>
                                    <div className="flex items-center gap-2">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    isActive={currentPage === page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={cn(
                                                        "w-10 h-10 rounded-xl text-sm font-semibold border-none transition-all shadow-none",
                                                        currentPage === page
                                                            ? "bg-[#D25026] text-white hover:bg-[#D25026]"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    )}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    </div>
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            className={cn(
                                                "w-10 h-10 p-0 flex items-center justify-center rounded-xl border-none transition-colors",
                                                currentPage === totalPages ? "opacity-30 pointer-events-none" : "text-gray-400"
                                            )}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>

                {/* Footer for non-standalone */}
                {!standalone && (
                    <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
                        <button
                            onClick={handleImport}
                            className="px-6 py-3 bg-[#D94F24] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#c14620] transition-colors disabled:opacity-50"
                            disabled={selectedItems.size !== 1}
                        >
                            Insert
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-6 flex flex-col gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center self-center text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">Delete Image</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete {selectedItems.size} image(s)? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" className="flex-1" onClick={cancelDelete}>Cancel</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename Modal */}
            {showRenameModal && editingItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
                        <div className="w-12 h-12 bg-[#D25026]/10 rounded-full flex items-center justify-center self-center text-[#D25026]">
                            <ClipboardPen className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">Rename Image</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Current name: <span className="text-gray-900">{editingItem.name}</span>
                            </p>
                        </div>
                        <TextField
                            variant="vertical"
                            label="New file name"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            placeholder="Enter new file name..."
                        />
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={cancelRename}>Cancel</Button>
                            <Button
                                className="flex-1 bg-[#D25026] hover:bg-[#b54622] text-white"
                                onClick={handleRename}
                                disabled={!renameInput.trim()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toastProps && (
                <div className="fixed bottom-6 right-6 left-6 z-[70]">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => setToastProps(null)}
                    />
                </div>
            )}
        </>
    );
}
