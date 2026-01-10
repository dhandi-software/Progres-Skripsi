import { useEffect } from "react";
import { adsApi } from "~/api/adsApi";
import { mediaApi } from "~/api/mediaApi";
import type { AdvertisementResponse } from "~/api/types";

interface AdvertisementMobileProps {
  ad?: AdvertisementResponse;
}

export function AdvertisementMobile({ ad }: AdvertisementMobileProps) {
  // Track ad view when component mounts
  useEffect(() => {
    const trackView = async () => {
      if (ad) {
        try {
          await adsApi.trackView(ad.id);
        } catch (error) {
          console.error("Failed to track ad view:", error);
        }
      }
    };

    trackView();
  }, [ad]);

  const handleAdClick = () => {
    if (ad) {
      window.open(ad.link_ads, "_blank", "noopener,noreferrer");
    }
  };

  // Fallback placeholder when no ad is provided
  if (!ad) {
    return (
      <section className="w-full h-[12.5rem] bg-destructive-foreground flex items-center justify-center">
        <h1 className="text-paragraph text-black/20">Advertisement</h1>
      </section>
    );
  }

  const imageUrl = ad.media_path
    ? mediaApi.getFileUrl(ad.media_path)
    : "";

  return (
    <section className="w-full h-[12.5rem] overflow-hidden">
      <button
        type="button"
        onClick={handleAdClick}
        className="w-full h-full cursor-pointer"
      >
        <img
          src={imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
          loading="lazy"
        />
      </button>
    </section>
  );
}
