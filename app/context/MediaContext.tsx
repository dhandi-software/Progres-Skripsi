import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { mediaApi } from "~/api/mediaApi";
import type {
    MediaItem as ApiMediaItem,
    PaginatedMediaData,
    DeleteMediaRequest,
    MediaResponse,
} from "~/api/types";

export interface MediaContextItem {
    id: string;
    file: File | string;
    url: string;
    name: string;
    extension: string;
    isUploading?: boolean;
    apiId?: string;
    uploadProgress?: number;
    path?: string;
    localUrl?: string;
    serverUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type MediaItem = MediaContextItem;

interface MediaContextType {
    mediaItems: MediaContextItem[];
    isLoading: boolean;
    isUploading: boolean;
    pagination: {
        page: number;
        limit: number;
        totalRows: number;
        totalPages: number;
    } | null;
    addMediaItems: (files: File[]) => Promise<void>;
    deleteMediaItems: (ids: string[]) => Promise<void>;
    updateMediaItem: (itemId: string, newName: string) => Promise<void>;
    fetchMediaItems: (filter?: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<void>;
    getFileUrl: (path: string) => string;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

interface MediaProviderProps {
    children: React.ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
    const [mediaItems, setMediaItems] = useState<MediaContextItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pagination, setPagination] = useState<{
        page: number;
        limit: number;
        totalRows: number;
        totalPages: number;
    } | null>(null);

    // Helper untuk mendapatkan ekstensi file
    const getFileExtension = useCallback((fileName: string): string => {
        const dotIndex = fileName.lastIndexOf(".");
        if (dotIndex > -1) {
            return fileName.substring(dotIndex + 1).toLowerCase();
        }
        return "";
    }, []);

    // Helper untuk mendapatkan URL file dari API
    const getFileUrl = useCallback((path: string): string => {
        return mediaApi.getFileUrl(path);
    }, []);

    // Load data dari localStorage
    const loadFromLocalStorage = useCallback((): MediaContextItem[] => {
        try {
            const savedMedia = localStorage.getItem("mediaItems");
            if (savedMedia) {
                const parsedMedia: MediaContextItem[] = JSON.parse(savedMedia);
                return parsedMedia;
            }
        } catch (error) {
            console.error("❌ Error loading media from localStorage:", error);
        }
        return [];
    }, []);

    // Save data ke localStorage
    const saveToLocalStorage = useCallback((items: MediaContextItem[]) => {
        try {
            // Remove File objects and blob URLs before saving
            const itemsToSave = items.map((item) => ({
                ...item,
                file: typeof item.file === "string" ? item.file : "",
                localUrl: undefined,
            }));
            localStorage.setItem("mediaItems", JSON.stringify(itemsToSave));
        } catch (error) {
            console.error("❌ Error saving media to localStorage:", error);
        }
    }, []);

    // Fetch media dari API dengan localStorage fallback
    const fetchMediaItems = useCallback(
        async (filter?: { search?: string; page?: number; limit?: number }) => {
            setIsLoading(true);
            try {

                // Load from localStorage first for immediate display
                const localItems = loadFromLocalStorage();
                if (localItems.length > 0) {
                    setMediaItems(localItems);
                }

                // Fetch from API
                const response = await mediaApi.getAllMedia({
                    page: filter?.page || 1,
                    limit: filter?.limit || 16,
                    search: filter?.search,
                });

                if (response.code === 200) {
                    let apiItems: ApiMediaItem[] = [];
                    let paginationData = null;

                    if (Array.isArray(response.data)) {
                        apiItems = response.data;
                    } else if ("rows" in response.data) {
                        const paginatedData =
                            response.data as PaginatedMediaData;
                        apiItems = paginatedData.rows || [];
                        paginationData = {
                            page: paginatedData.page,
                            limit: paginatedData.limit,
                            totalRows: paginatedData.total_rows,
                            totalPages: paginatedData.total_pages,
                        };
                    } else if ("id" in response.data) {
                        apiItems = [response.data as ApiMediaItem];
                    }

                    setPagination(paginationData);

                    // Convert API items ke format MediaContextItem
                    const convertedItems: MediaContextItem[] = apiItems.map(
                        (apiItem) => {
                            let fileName = apiItem.name;
                            if (
                                !fileName ||
                                fileName === "null" ||
                                fileName === ""
                            ) {
                                const fileNameFromPath = apiItem.path
                                    ?.split("/")
                                    .pop();
                                fileName =
                                    fileNameFromPath || `file-${apiItem.id}`;
                            }

                            const extension =
                                getFileExtension(fileName) || "webp";
                            const serverUrl = mediaApi.getFileUrl(
                                apiItem.path || fileName,
                            );

                            return {
                                id: apiItem.id,
                                file: serverUrl,
                                url: serverUrl,
                                name: fileName,
                                extension,
                                path: apiItem.path,
                                apiId: apiItem.id,
                                isUploading: false,
                                serverUrl: serverUrl,
                                createdAt: apiItem.created_at,
                                updatedAt: apiItem.updated_at,
                            };
                        },
                    );

                    // Gabungkan dengan item yang sedang diupload dari localStorage
                    const uploadingItems = localItems.filter(
                        (item) => item.isUploading,
                    );
                    const allItems = [...uploadingItems, ...convertedItems];

                    setMediaItems(allItems);
                    saveToLocalStorage(allItems);
                } else {
                    console.warn(
                        "⚠️ API response with non-200 code:",
                        response,
                    );

                    // Fallback ke localStorage
                    const localItems = loadFromLocalStorage();
                    setMediaItems(localItems);
                }
            } catch (error) {
                console.error("❌ Failed to fetch media:", error);

                // Fallback ke localStorage
                const localItems = loadFromLocalStorage();
                setMediaItems(localItems);
            } finally {
                setIsLoading(false);
            }
        },
        [getFileExtension, loadFromLocalStorage, saveToLocalStorage],
    );

    const addMediaItems = useCallback(
        async (files: File[]) => {
            if (files.length === 0) return;

            setIsUploading(true);

            const newItems: MediaContextItem[] = files.map((file) => {
                const localUrl = URL.createObjectURL(file);
                const fileName = file.name;
                const extension = getFileExtension(fileName) || "webp";
                const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                return {
                    id: localId,
                    file,
                    url: localUrl,
                    name: fileName,
                    extension,
                    isUploading: true,
                    uploadProgress: 0,
                    localUrl: localUrl,
                };
            });

            // Tambahkan ke state untuk preview
            const updatedItems = [...mediaItems, ...newItems];
            setMediaItems(updatedItems);

            // Simpan ke localStorage segera
            saveToLocalStorage(updatedItems);

            const uploadPromises = newItems.map(async (item) => {
                try {
                    if (!(item.file instanceof File)) {
                        return null;
                    }

                    // Update progress di state
                    setMediaItems((prev) =>
                        prev.map((prevItem) =>
                            prevItem.id === item.id
                                ? { ...prevItem, uploadProgress: 50 }
                                : prevItem,
                        ),
                    );

                    // Upload file ke API
                    const fileNameWithoutExt = item.name.replace(
                        /\.[^/.]+$/,
                        "",
                    );
                    const response = await mediaApi.createMedia(
                        item.file,
                        fileNameWithoutExt,
                    );

                    if (response.code === 200 && response.data) {
                        let uploadedItem: ApiMediaItem;

                        if (Array.isArray(response.data)) {
                            uploadedItem = response.data[0];
                        } else if ("id" in response.data) {
                            uploadedItem = response.data as ApiMediaItem;
                        } else {
                            return null;
                        }

                        // Dapatkan nama file akhir
                        let finalFileName = uploadedItem.name;
                        if (!finalFileName || finalFileName === "null") {
                            finalFileName = item.name;
                        }

                        const serverUrl = mediaApi.getFileUrl(
                            uploadedItem.path || finalFileName,
                        );

                        // Update item di state
                        setMediaItems((prev) => {
                            const updated = prev.map((prevItem) => {
                                if (prevItem.id === item.id) {
                                    return {
                                        ...prevItem,
                                        id: uploadedItem.id,
                                        apiId: uploadedItem.id,
                                        name: finalFileName,
                                        extension:
                                            getFileExtension(finalFileName),
                                        url: serverUrl,
                                        path: uploadedItem.path,
                                        file: serverUrl,
                                        isUploading: false,
                                        uploadProgress: 100,
                                        serverUrl: serverUrl,
                                        createdAt: uploadedItem.created_at,
                                        updatedAt: uploadedItem.updated_at,
                                    };
                                }
                                return prevItem;
                            });

                            // Simpan ke localStorage setelah update
                            saveToLocalStorage(updated);
                            return updated;
                        });

                        if (item.localUrl) {
                            setTimeout(() => {
                                URL.revokeObjectURL(item.localUrl!);
                            }, 1000);
                        }

                        return uploadedItem;
                    } else {
                        throw new Error(`Upload failed: ${response.message}`);
                    }
                } catch (uploadError) {
                    console.error(
                        `❌ Upload failed for ${item.name}:`,
                        uploadError,
                    );

                    // Update item status menjadi gagal
                    setMediaItems((prev) => {
                        const updated = prev.map((prevItem) => {
                            if (prevItem.id === item.id) {
                                return {
                                    ...prevItem,
                                    isUploading: false,
                                    uploadProgress: 0,
                                    url: item.localUrl || "",
                                };
                            }
                            return prevItem;
                        });

                        // Simpan ke localStorage
                        saveToLocalStorage(updated);
                        return updated;
                    });

                    throw uploadError;
                }
            });

            try {
                await Promise.all(uploadPromises);

                // Refresh list dari API setelah semua upload selesai
                await fetchMediaItems();
            } catch (error) {
                console.error("❌ Upload process failed:", error);
                throw error;
            } finally {
                setIsUploading(false);
            }
        },
        [fetchMediaItems, getFileExtension, mediaItems, saveToLocalStorage],
    );

    const deleteMediaItems = useCallback(
        async (ids: string[]) => {

            // Pisahkan item lokal dan server
            const itemsToDelete = mediaItems.filter((item) =>
                ids.includes(item.id),
            );

            const apiIds = itemsToDelete
                .map((item) => item.apiId)
                .filter(Boolean) as string[];

            if (apiIds.length > 0) {
                try {
                    const deleteRequest: DeleteMediaRequest = { id: apiIds };
                    await mediaApi.deleteMedia(deleteRequest);
                } catch (error) {
                    // Tetap lanjutkan untuk menghapus dari state lokal
                }
            }

            itemsToDelete.forEach((item) => {
                if (item.localUrl && item.localUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(item.localUrl);
                }
            });

            // Hapus dari state lokal
            const newItems = mediaItems.filter(
                (item) => !ids.includes(item.id),
            );
            setMediaItems(newItems);

            // Simpan ke localStorage
            saveToLocalStorage(newItems);

            if (apiIds.length > 0) {
                try {
                    await fetchMediaItems();
                } catch (error) {}
            }

        },
        [fetchMediaItems, mediaItems, saveToLocalStorage],
    );

    const updateMediaItem = useCallback(
        async (itemId: string, newName: string) => {
            const item = mediaItems.find((item) => item.id === itemId);

            if (!item) {
                throw new Error("Item not found");
            }

            if (item.apiId) {
                try {
                    await mediaApi.updateMedia(item.apiId, { name: newName });
                } catch (error) {
                    console.error("❌ API update failed:", error);
                    throw error;
                }
            }

            // Update di state lokal
            const updatedItems = mediaItems.map((item) => {
                if (item.id === itemId) {
                    return {
                        ...item,
                        name: newName,
                    };
                }
                return item;
            });

            setMediaItems(updatedItems);

            // Simpan ke localStorage
            saveToLocalStorage(updatedItems);

            // Refresh data untuk sinkronisasi
            if (item.apiId) {
                await fetchMediaItems();
            }
        },
        [fetchMediaItems, mediaItems, saveToLocalStorage],
    );

    useEffect(() => {
        fetchMediaItems();
    }, [fetchMediaItems]);

    useEffect(() => {
        return () => {
            mediaItems.forEach((item) => {
                if (item.localUrl && item.localUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(item.localUrl);
                }
            });
        };
    }, [mediaItems]);

    const value: MediaContextType = {
        mediaItems,
        isLoading,
        isUploading,
        pagination,
        addMediaItems,
        deleteMediaItems,
        updateMediaItem,
        fetchMediaItems,
        getFileUrl,
    };

    return (
        <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
    );
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error("useMedia must be used within a MediaProvider");
    }
    return context;
};
