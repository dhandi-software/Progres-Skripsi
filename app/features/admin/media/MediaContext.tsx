import React, { createContext, useContext, useState, useEffect } from "react";
import { mediaApi } from "~/api/mediaApi";
import type { MediaItem as ApiMediaItem } from "~/api/types";

export interface MediaItem {
    id: string;
    url: string;
    name: string;
    extension: string;
    file?: File; // For temporary local items
    isLoading?: boolean;
}

interface MediaContextType {
    mediaItems: MediaItem[];
    setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
    addMediaItems: (files: File[]) => Promise<void>;
    deleteMediaItems: (ids: string[]) => Promise<void>;
    updateMediaItem: (itemId: string, newName: string) => Promise<void>;
    refreshMedia: (filter?: {
        search?: string;
        page?: number;
        limit?: number;
        type?: string;
    }) => Promise<void>;
    pagination: {
        page: number;
        limit: number;
        totalRows: number;
        totalPages: number;
    } | null;
    isLoading: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

interface MediaProviderProps {
    children: React.ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState<{
        page: number;
        limit: number;
        totalRows: number;
        totalPages: number;
    } | null>(null);

    const mapApiToLocal = (item: ApiMediaItem): MediaItem => {
        const url = mediaApi.getFileUrl(item.path);
        const extension = item.name.split(".").pop()?.toLowerCase() || "jpg";
        return {
            id: item.id,
            url: url,
            name: item.name,
            extension: extension,
        };
    };

    const refreshMedia = async (filter?: {
        search?: string;
        page?: number;
        limit?: number;
        type?: string;
    }) => {
        setIsLoading(true);
        try {
            const params = {
                page: filter?.page || 1,
                limit: filter?.limit || 8,
                search: filter?.search,
                type: filter?.type && filter.type !== "all" ? filter.type : undefined,
            };

            const response = await mediaApi.getAllMedia(params);

            if (response.code === 200) {
                if (Array.isArray(response.data)) {
                    setMediaItems(response.data.map(mapApiToLocal));
                    setPagination(null);
                } else if (response.data && 'rows' in response.data) {
                    const paginatedData = response.data;
                    const rows = paginatedData.rows || [];
                    setMediaItems(rows.map(mapApiToLocal));
                    setPagination({
                        page: paginatedData.page,
                        limit: paginatedData.limit,
                        totalRows: paginatedData.total_rows,
                        totalPages: paginatedData.total_pages,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch media:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Note: Initial fetch is handled by the consumer components (MediaDesktop/MediaMobile)
    // to allow proper limit configuration

    const addMediaItems = async (files: File[]) => {
        // Create temporary items for loading state
        const tempItems: MediaItem[] = files.map((file) => ({
            id: `temp-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file), // Local preview
            name: file.name,
            extension: file.name.split(".").pop()?.toLowerCase() || "jpg",
            file: file,
            isLoading: true,
        }));

        setMediaItems((prev) => [...tempItems, ...prev]);

        for (const item of tempItems) {
            try {
                const response = await mediaApi.createMedia(item.file!);
                const newItem = mapApiToLocal(response.data as ApiMediaItem);

                // Replace temp item with real one
                setMediaItems((prev) =>
                    prev.map((p) => p.id === item.id ? newItem : p)
                );
            } catch (error) {
                console.error("Failed to upload media:", error);
                // Remove temp item on failure
                setMediaItems((prev) => prev.filter((p) => p.id !== item.id));
            }
        }
    };

    const deleteMediaItems = async (ids: string[]) => {
        try {
            await mediaApi.deleteMedia({ id: ids });
            setMediaItems((prev) => prev.filter((item) => !ids.includes(item.id)));
        } catch (error) {
            console.error("Failed to delete media:", error);
        }
    };

    const updateMediaItem = async (id: string, newName: string) => {
        try {
            const response = await mediaApi.updateMedia(id, { name: newName });
            const updatedItem = mapApiToLocal(response.data as ApiMediaItem);

            setMediaItems((prev) =>
                prev.map((item) => (item.id === id ? updatedItem : item))
            );
        } catch (error) {
            console.error("Failed to update media:", error);
        }
    };

    return (
        <MediaContext.Provider
            value={{
                mediaItems,
                setMediaItems,
                addMediaItems,
                deleteMediaItems,
                updateMediaItem,
                refreshMedia,
                pagination,
                isLoading,
            }}
        >
            {children}
        </MediaContext.Provider>
    );
};

export const useMedia = () => {
    const context = useContext(MediaContext);
    if (context === undefined) {
        throw new Error("useMedia must be used within a MediaProvider");
    }
    return context;
};
