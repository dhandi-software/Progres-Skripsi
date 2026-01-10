import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { adsApi } from "~/api/adsApi";
import { mediaApi } from "~/api/mediaApi";
import type { AdvertisementResponse } from "~/api/types";

export function HeroSectionDesktop() {
    const [current, setCurrent] = useState(0);
    const [ads, setAds] = useState<AdvertisementResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await adsApi.getAdsByType("Hero Banner");
                if (response.data && response.data.length > 0) {
                    setAds(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch Hero Banner ads:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, []);

    const nextSlide = () => {
        if (ads.length === 0) return;
        setCurrent((prev) => (prev + 1) % ads.length);
    };

    const prevSlide = () => {
        if (ads.length === 0) return;
        setCurrent((prev) => (prev - 1 + ads.length) % ads.length);
    };

    // auto-slide every 6 seconds
    useEffect(() => {
        if (ads.length === 0) return;
        const interval = setInterval(nextSlide, 6000);
        return () => clearInterval(interval);
    }, [ads.length]);

    // Track ad view when slide changes
    useEffect(() => {
        const trackView = async () => {
            if (ads.length > 0 && ads[current]) {
                try {
                    await adsApi.trackView(ads[current].id);
                } catch (error) {
                    console.error("Failed to track ad view:", error);
                }
            }
        };

        trackView();
    }, [current, ads]);

    const handleAdClick = async (ad: AdvertisementResponse) => {
        try {
            // Open link in new tab
            window.open(ad.link_ads, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Failed to track ad click:", error);
        }
    };

    if (loading) {
        return (
            <div className="relative h-[21.938rem] max-w-[59rem] overflow-hidden bg-destructive-foreground flex items-center justify-center">
                <div className="animate-pulse w-full h-full bg-gray-200"></div>
            </div>
        );
    }

    if (ads.length === 0) {
        return (
            <div className="relative h-[21.938rem] max-w-[59rem] overflow-hidden bg-destructive-foreground flex items-center justify-center">
                <h1 className="text-paragraph text-black/20">Advertisement</h1>
            </div>
        );
    }

    const currentAd = ads[current];
    const imageUrl = currentAd.media_path
        ? mediaApi.getFileUrl(currentAd.media_path)
        : "/images/ic_hero_image.jpg";

    return (
        <div className="relative h-[21.938rem] max-w-[59rem] overflow-hidden">
            <button
                type="button"
                onClick={() => handleAdClick(currentAd)}
                className="w-full h-full cursor-pointer"
            >
                <img
                    src={imageUrl}
                    alt={currentAd.title}
                    className="w-full h-full object-cover absolute top-0 left-0 z-0 transition-all duration-700 ease-in-out hover:scale-105"
                    loading="lazy"
                />
            </button>

            <Button
                variant="outline"
                onClick={prevSlide}
                className="absolute top-1/2 left-4 -translate-y-1/2 z-20 p-2 rounded-md transition-all py-sm px-md border-secondary size-10 bg-white/40 shadow-xs"
            >
                <ArrowLeft className="size-4" />
            </Button>
            <Button
                onClick={nextSlide}
                variant="outline"
                className="absolute top-1/2 right-4 -translate-y-1/2 z-20  rounded-md transition-all py-sm px-md border-secondary size-10 bg-white/40 shadow-xs"
            >
                <ArrowRight className="size-4" />
            </Button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {ads.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`size-2 rounded-full transition-all duration-300 ${index === current
                            ? "bg-[#D94F24] scale-110"
                            : "bg-brand-secondary-pressed"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
