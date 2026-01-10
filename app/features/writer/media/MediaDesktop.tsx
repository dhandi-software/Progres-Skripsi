import { useState, useRef, useEffect } from "react";
import { TextField } from "~/components/ui/TextField";
import {
    Plus,
    Search,
    X,
    Check,
    Pencil,
    Trash2,
    ChevronsUpDown,
    ClipboardPen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import ImageCheck from "~/components/ui/imaged-check";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "~/components/ui/pagination";
import { useMedia, type MediaItem } from "./MediaContext";
import { Toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";

interface MediaDesktopProps {
    standalone?: boolean;
    onClose?: () => void;
    onImageSelect?: (image: MediaItem) => void;
}

export default function MediaDesktop({
    standalone = true,
    onClose,
    onImageSelect,
}: MediaDesktopProps) {
    const {
        mediaItems,
        addMediaItems,
        deleteMediaItems,
        updateMediaItem,
        refreshMedia,
        pagination,
        isLoading: isContextLoading,
    } = useMedia();

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [imageType, setImageType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showImageTypeDropdown, setShowImageTypeDropdown] = useState(false);
    const [renameInput, setRenameInput] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [toastProps, setToastProps] = useState<{
        title: string;
        variant: "success" | "destructive" | "default";
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isUploading, setIsUploading] = useState(false);


    const itemsPerPage = 8;

    const showEditButton = selectedItems.size === 1;
    const showDeleteButton = selectedItems.size > 0;

    // Trigger fetch on page/search/type change
    useEffect(() => {
        refreshMedia({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            type: imageType === "all" ? undefined : `.${imageType}`,
        });
    }, [currentPage, searchQuery, imageType]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            await addMediaItems(Array.from(files));
            showToast("You have successfully uploaded image");
            // Refresh to get updated list from server
            await refreshMedia({
                page: 1, // Go back to first page to see new uploads
                limit: itemsPerPage,
                search: searchQuery,
                type: imageType === "all" ? undefined : `.${imageType}`,
            });
            setCurrentPage(1);
        } catch (error) {
            console.error("Failed to upload image:", error);
            showToast("Failed to upload image. Please try again.", "destructive");
        } finally {
            setIsUploading(false);
            event.target.value = ""; // Reset input after everything
        }
    };

    const handleSelect = (itemId: string) => {
        if (!standalone) {
            setSelectedItems(new Set([itemId]));
            return;
        }
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.add(itemId);
            return newSet;
        });
    };

    const handleDeselect = (itemId: string) => {
        setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(mediaItems.map((item) => item.id));
            setSelectedItems(allIds);
        }
        setSelectAll(!selectAll);
    };

    const showToast = (
        title: string,
        variant: "success" | "destructive" | "default" = "success",
    ) => {
        setToastProps({ title, variant });
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
        showToast("Image successfully deleted from media");
        refreshMedia({
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            type: imageType === "all" ? undefined : `.${imageType}`,
        });
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
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
                type: imageType === "all" ? undefined : `.${imageType}`,
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

    const handleImageTypeSelect = (type: string) => {
        setImageType(type);
        setShowImageTypeDropdown(false);
        setCurrentPage(1);
    };

    const handleInsert = () => {
        if (onImageSelect && selectedItems.size === 1) {
            const selectedId = Array.from(selectedItems)[0];
            const selectedItem = mediaItems.find((item) => item.id === selectedId);
            if (selectedItem) {
                onImageSelect(selectedItem);
            }
        }
    };

    useEffect(() => {
        if (selectedItems.size === mediaItems.length && mediaItems.length > 0) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedItems, mediaItems]);

    // Client-side search filtering (fallback when backend doesn't filter)
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

    const rows = [];
    for (let i = 0; i < paginatedItems.length; i += 4) {
        rows.push(paginatedItems.slice(i, i + 4));
    }

    return (
        <>
            <div className={cn(
                "w-full flex flex-col gap-8 bg-white transition-all",
                standalone ? "min-h-screen px-6 pt-6 pb-16" : "h-fit p-6"
            )}>
                {/* Header Section */}
                {standalone ? (
                    <div className="w-full flex flex-col gap-3">
                        <h1 className="text-2xl font-bold text-foreground">Media</h1>
                        <p className="text-sm text-black/60">Manage editorial media content.</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Media Library</h2>
                        <Button variant="ghost" size="icon" onClick={onClose} className="-mr-2">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                )}

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
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 h-10 px-4"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                Add Image
                            </>
                        )}
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search Image"
                                className="w-full h-10 pl-10 pr-10 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                            />
                            {searchQuery && (
                                <X
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
                                    onClick={() => setSearchQuery("")}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Selection State */}
                <div className="flex items-center justify-between">
                    {standalone && (
                        <div className="flex items-center gap-2 cursor-pointer" onClick={handleSelectAll}>
                            <div className={cn(
                                "w-5 h-5 rounded shadow-sm border flex items-center justify-center transition-colors",
                                selectAll ? "bg-[#D25026] border-[#D25026]" : "bg-white border-gray-300"
                            )}>
                                {selectAll && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-foreground">Select all image</span>
                        </div>
                    )}
                    {!standalone && <div className="text-xs text-muted-foreground">Select an image to import</div>}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEditSelected}
                            disabled={!showEditButton}
                            className={cn(
                                "w-8 h-8 rounded-md flex items-center justify-center transition-colors border",
                                showEditButton
                                    ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer shadow-sm"
                                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                            )}
                            title="Edit selected image"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDeleteSelected}
                            disabled={!showDeleteButton}
                            className={cn(
                                "w-8 h-8 rounded-md flex items-center justify-center transition-colors border",
                                showDeleteButton
                                    ? "bg-white border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer shadow-sm"
                                    : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                            )}
                            title="Delete selected image(s)"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Media Grid */}
                <div className="flex flex-col gap-2 min-h-[25rem]">
                    {rows.map((row, idx) => (
                        <div key={idx} className="flex gap-2">
                            {row.map((item) => (
                                <div key={item.id} className="flex-1">
                                    <ImageCheck
                                        image={item.file || item.url}
                                        fileName={item.name.replace(/\.[^/.]+$/, "")}
                                        fileExtension={item.extension}
                                        isSelected={selectedItems.has(item.id)}
                                        onSelect={() => handleSelect(item.id)}
                                        onDeselect={() => handleDeselect(item.id)}
                                        showDeselectButton={false}
                                    />
                                </div>
                            ))}
                            {Array.from({ length: 4 - row.length }).map((_, i) => (
                                <div key={i} className="flex-1" />
                            ))}
                        </div>
                    ))}
                    {mediaItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                            <p className="text-sm">No images found</p>
                        </div>
                    )}
                </div>

                {/* Description and Photo Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Description about this media.</p>
                    <span className="text-sm font-medium text-foreground">
                        {paginatedItems.length} of {totalItems}
                    </span>
                </div>

                {/* Pagination & Footer */}
                <div className="mt-auto flex flex-col gap-6">
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            className={cn("cursor-pointer", currentPage === 1 && "opacity-50 pointer-events-none")}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <PaginationItem key={p}>
                                            <PaginationLink
                                                isActive={currentPage === p}
                                                onClick={() => setCurrentPage(p)}
                                                className="cursor-pointer"
                                            >
                                                {p}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            className={cn("cursor-pointer", currentPage === totalPages && "opacity-50 pointer-events-none")}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}

                    {!standalone && (
                        <div className="flex justify-end pt-6 border-t border-gray-100">
                            <Button
                                className="bg-[#D25026] hover:bg-[#b54622] text-white px-10 h-11 rounded-lg font-bold"
                                disabled={selectedItems.size !== 1}
                                onClick={handleInsert}
                            >
                                Insert
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlays */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-6 flex flex-col gap-4">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center self-center text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">Delete Image</h3>
                            <p className="text-sm text-gray-500">Are you sure you want to delete {selectedItems.size} image(s)? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                            <Button variant="outline" className="flex-1" onClick={cancelDelete}>Cancel</Button>
                            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {showRenameModal && editingItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl p-6 flex flex-col gap-6">
                        <div className="w-12 h-12 bg-[#D25026]/10 rounded-full flex items-center justify-center self-center text-[#D25026]">
                            <ClipboardPen className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">Rename Image</h3>
                            <p className="text-xs text-gray-400 mt-1">Current name: <span className="text-gray-900">{editingItem.name}</span></p>
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

            {toastProps && (
                <div className="fixed bottom-6 right-6 z-[70]">
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
