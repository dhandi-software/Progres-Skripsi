import { useState, useEffect } from "react";
import { AdvertisementDesktop } from "~/components/ui/AdvertisementDesktop";
import { adsApi } from "~/api/adsApi";
import type { AdvertisementResponse } from "~/api/types";

export function SidebarAdsSection() {
    const [ads, setAds] = useState<AdvertisementResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await adsApi.getAdsByType("Spotlight");
                if (response.data && response.data.length > 0) {
                    setAds(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch Spotlight ads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    // Show placeholders while loading or if no ads
    if (loading) {
        return (
            <section className="flex flex-col gap-4">
                <AdvertisementDesktop />
                <AdvertisementDesktop />
                <AdvertisementDesktop />
            </section>
        );
    }

    // Show at least 3 slots, fill with placeholders if not enough ads
    const displayAds = [...ads];
    while (displayAds.length < 3) {
        displayAds.push(undefined as unknown as AdvertisementResponse);
    }

    return (
        <section className="flex flex-col gap-4">
            {displayAds.slice(0, 3).map((ad, index) => (
                <AdvertisementDesktop key={ad?.id || `placeholder-${index}`} ad={ad} />
            ))}
        </section>
    );
}
