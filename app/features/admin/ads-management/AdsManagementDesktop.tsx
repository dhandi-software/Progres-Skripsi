import React from "react";
import { Plus, ArrowUpRight, CircleCheck, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { mediaApi } from "~/api/mediaApi";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { useAdsManagement } from "./UseAdsManagement";
import AdModalDesktop from "./components/AdModalDesktop";

export function AdsManagementDesktop() {
  const {
    ads,
    isLoading,
    error,
    activeModal,
    openModal,
    closeModal,
    handleUploadSuccess: baseHandleUploadSuccess,
    fetchAds,
  } = useAdsManagement();

  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  const handleUploadSuccess = () => {
    setShowSuccessToast(true);
    baseHandleUploadSuccess();
  };

  React.useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  return (
    <div className="flex flex-col gap-8 p-10 bg-[#F9FAFB] min-h-screen relative">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-10 right-10 z-[100] flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-lg p-4 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#DCFCE7] p-1.5 rounded-full">
            <CircleCheck className="w-5 h-5 text-[#16A34A]" />
          </div>
          <span className="text-sm font-medium text-[#374151]">Ads have been successfully uploaded.</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-[#9CA3AF]" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#1F2937]">Advertisement Management</h1>
          <p className="text-gray-500">Manage ads and track audience metrics on the MNI news portal.</p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-white !text-gray-700 border border-gray-200 hover:bg-gray-50 flex gap-2"
            onClick={() => openModal("Hero Banner")}
          >
            <Plus className="w-4 h-4" />
            Add Hero Ads
          </Button>
          <Button
            className="bg-white !text-gray-700 border border-gray-200 hover:bg-gray-50 flex gap-2"
            onClick={() => openModal("Spotlight Article")}
          >
            <Plus className="w-4 h-4" />
            Add Spotlight Ads
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm min-h-[25rem] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#D25026] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-500">
              <p>{error}</p>
              <Button onClick={fetchAds} variant="outline" size="sm">Retry</Button>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No advertisements found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Number</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Image</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Ads Type</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">Link</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#374151]">End Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {ads.map((ad, index) => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-[#374151] font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <img
                          src={mediaApi.getFileUrl(ad.media_path)}
                          alt={ad.title}
                          className="w-[7.5rem] h-[4.1875rem] object-cover rounded border border-[#E5E7EB]"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          ad.news_id ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-orange-50 text-orange-700 border border-orange-100"
                        )}>
                          {ad.ads_type === "Hero Banner" ? "Hero" : ad.ads_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        <div className="max-w-[12.5rem] leading-relaxed font-medium">
                          {ad.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#2563EB]">
                        <a href={ad.link_ads} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline max-w-[9.375rem]">
                          {ad.link_ads}
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#374151]">
                        {format(new Date(ad.period * 1000), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Scrollbar imitation as seen in design */}
          {!isLoading && ads.length > 0 && (
            <div className="px-6 py-2 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <div className="w-[9.375rem] h-2 bg-[#D1D5DB] rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      <AdModalDesktop
        type={activeModal === "Hero Banner" ? "hero" : "sidebar"}
        isOpen={!!activeModal}
        onClose={closeModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

