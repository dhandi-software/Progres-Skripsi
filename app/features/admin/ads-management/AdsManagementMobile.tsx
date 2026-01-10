import { Plus, Menu, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import { mediaApi } from "~/api/mediaApi";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { useAdsManagement } from "./UseAdsManagement";
import AdModalMobile from "./components/AdModalMobile";

export function AdsManagementMobile() {
  const { setOpenMobile } = useSidebar();
  const {
    ads,
    isLoading,
    error,
    activeModal,
    openModal,
    closeModal,
    handleUploadSuccess,
    fetchAds,
  } = useAdsManagement();

  return (
    <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col">
      {/* Header Section */}
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-[#0D0D12]" />
          </button>
          <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
            Advertisement Management
          </h1>
        </div>
        <p className="text-[0.875rem] text-[#71717A] font-medium pl-9 leading-relaxed">
          Manage ads and track audience metrics on the MNI news portal.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="px-6 flex gap-4 mb-8">
        <button
          onClick={() => openModal("Hero Banner")}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[#0D0D12] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Hero Ads
        </button>
        <button
          onClick={() => openModal("Spotlight Article")}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[#0D0D12] font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Spotlight Ads
        </button>
      </div>

      {/* Table Section */}
      <div className="px-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-xs relative min-h-[18.75rem] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-[#D25026] animate-spin" />
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 p-4 text-center">
              <p>{error}</p>
              <Button onClick={fetchAds} variant="outline" size="sm">Retry</Button>
            </div>
          ) : ads.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              No advertisements found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[21.4375rem]">
                <thead className="bg-[#FAFAFA] border-b border-[#F4F4F5]">
                  <tr>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">Number</th>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">Image</th>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">Ads Type</th>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">Title</th>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">Link</th>
                    <th className="px-4 py-4 text-sm font-bold text-[#0D0D12]">End Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F4F5]">
                  {ads.map((ad, index) => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-6 text-sm text-[#0D0D12] font-medium">{index + 1}</td>
                      <td className="px-4 py-4">
                        <div className="w-[7.5rem] h-20 bg-[#F4F4F5] rounded-lg overflow-hidden flex items-center justify-center border border-[#F4F4F5]">
                          <img
                            src={mediaApi.getFileUrl(ad.media_path)}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6 text-sm text-[#0D0D12] font-medium">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[0.625rem] font-bold",
                          ad.news_id ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                        )}>
                          {ad.news_id ? "Article" : ad.id.includes("hero") || ad.media_path.includes("hero") ? "Hero" : "Spotlight"}
                        </span>
                      </td>
                      <td className="px-4 py-6 text-sm text-[#0D0D12] font-medium max-w-[9.375rem] truncate">{ad.title}</td>
                      <td className="px-4 py-6 text-sm text-[#2563EB]">
                        <a href={ad.link_ads} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline max-w-[9.375rem] truncate">
                          {ad.link_ads}
                        </a>
                      </td>
                      <td className="px-4 py-6 text-sm text-[#0D0D12] font-medium whitespace-nowrap">
                        {format(new Date(ad.period * 1000), "dd MMM yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AdModalMobile
        type={activeModal === "Hero Banner" ? "hero" : "sidebar"}
        isOpen={!!activeModal}
        onClose={closeModal}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}

