import { client } from "./client";
import type {
    AdvertisementRequest,
    AdsListResponse,
    AdsCreateResponse,
} from "./types";

export const adsApi = {
    /**
     * Get all advertisements
     * GET /ads/
     */
    getAds: async (): Promise<AdsListResponse> => {
        const response = await client.get<AdsListResponse>("/ads/");
        return response.data;
    },

    /**
     * Get advertisements by type
     * GET /ads/?ads_type={adsType}
     * @param adsType - "Hero Banner" | "Spotlight"
     */
    getAdsByType: async (adsType: string): Promise<AdsListResponse> => {
        const response = await client.get<AdsListResponse>("/ads/", {
            params: { ads_type: adsType }
        });
        return response.data;
    },

    /**
     * Create a new advertisement
     * POST /ads/
     */
    createAds: async (data: AdvertisementRequest): Promise<AdsCreateResponse> => {
        const response = await client.post<AdsCreateResponse>("/ads/", data);
        return response.data;
    },

    /**
     * Track advertisement click event
     * GET /ads/:id/click
     */
    trackClick: async (id: string): Promise<void> => {
        await client.get(`/ads/${id}/click`);
    },

    /**
     * Track advertisement view event
     * GET /ads/:id/view
     */
    trackView: async (id: string): Promise<void> => {
        await client.get(`/ads/${id}/view`);
    },
};
