import React from "react";
import { X, Calendar, ArrowLeft, CircleAlert, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { type MediaItem } from "~/features/admin/media/MediaContext";
import MediaMobile from "~/features/admin/media/MediaMobile";
import { adsApi } from "~/api/adsApi";
import type { AdvertisementRequest } from "~/api/types";
import { Button } from "~/components/ui/button";

interface AdModalMobileProps {
  type: "hero" | "sidebar";
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function AdModalMobile({ type, isOpen, onClose, onUploadSuccess }: AdModalMobileProps) {
  const [isPreviewMode, setIsPreviewMode] = React.useState(false);
  const [showMediaPopup, setShowMediaPopup] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<MediaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    day: "",
    month: "",
    year: "",
    title: "",
    link: ""
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isHero = type === "hero";
  const title = isHero ? "Hero Advertisement" : "Spotlight Advertisement";

  const imageInstructions = {
    ratio: isHero ? "horizontal (landscape)" : "vertical (portrait)",
    size: isHero ? "59rem (width) × 21.9375rem (height)" : "22rem (width) × 26.25rem (height)"
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsPreviewMode(false);
    setErrors({});
    setSelectedImage(null);
    setFormData({ day: "", month: "", year: "", title: "", link: "" });
    onClose();
  };

  const handleUpload = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.day || !formData.month || !formData.year) {
      newErrors.endDate = "Set the end date for the advertisement";
    }
    if (!formData.title) {
      newErrors.title = "Advertisement title cannot be empty.";
    }
    if (!formData.link) {
      newErrors.link = "Advertisement links cannot be empty.";
    }
    if (!selectedImage) {
      newErrors.image = "Advertisement image cannot be empty.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDay = formData.day.padStart(2, '0');
      const formattedMonth = formData.month.padStart(2, '0');
      const period = `${formattedDay}-${formattedMonth}-${formData.year}`;

      const payload: AdvertisementRequest = {
        media_id: selectedImage!.id,
        title: formData.title,
        ads_type: isHero ? "Hero Banner" : "Spotlight",
        link_ads: formData.link,
        period: period,
      };

      await adsApi.createAds(payload);
      onUploadSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      setErrors({ submit: err?.response?.data?.message || "Failed to upload advertisement." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (image: MediaItem) => {
    setSelectedImage(image);
    setErrors((prev) => ({ ...prev, image: "" }));
    setShowMediaPopup(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          if (showMediaPopup || isSubmitting) e.preventDefault();
        }}
        className="bg-white h-auto p-0 border-none gap-0 overflow-hidden w-[95vw] max-md:rounded-2xl flex flex-col max-h-[90vh]">
        {showMediaPopup ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 h-[80vh] overflow-hidden">
            <MediaMobile
              standalone={false}
              onClose={() => setShowMediaPopup(false)}
              onImageSelect={handleImageSelect}
            />
          </div>
        ) : isPreviewMode ? (
          <div className="flex-1 flex flex-col w-full animate-in fade-in zoom-in-95 duration-300 overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 shrink-0">
              <button onClick={() => setIsPreviewMode(false)} className="p-1 -ml-1 text-[#0D0D12]" disabled={isSubmitting}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center text-center">
                <span className="text-[1rem] font-bold text-[#0D0D12]">Preview {title}</span>
              </div>
              <button onClick={handleClose} className="p-1 -mr-1 text-[#0D0D12]" disabled={isSubmitting}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-4 py-2 text-center border-b border-[#F4F4F5]">
              <p className="text-[0.75rem] text-[#71717A]">
                {isHero ? "Advertisement appear at the top of the news homepage." : "Ads appear between news content."}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {isHero ? (
                  <>
                    <div className="w-16 h-2 bg-[#0D0D12] rounded-full mb-2"></div>
                    <div className="w-24 h-2 bg-[#71717A] rounded-full"></div>
                    <div className="w-full rounded-lg border border-[#D25026] overflow-hidden bg-[#F4F4F5] relative aspect-[352/200]">
                      {selectedImage ? <img src={selectedImage.url} alt="Ad Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><ImageIcon className="w-12 h-12 text-[#E4E4E7]" /></div>}
                    </div>
                    <div className="w-24 h-3 bg-[#71717A] rounded-full mt-2"></div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="aspect-square bg-[#E4E4E7] rounded-xl"></div>
                          <div className="flex flex-col gap-1.5">
                            <div className="w-full h-2 bg-[#0D0D12] rounded-full"></div>
                            <div className="w-2/3 h-2 bg-[#0D0D12] rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 overflow-hidden">
                      {[1, 2].map((i) => (
                        <div key={i} className="w-[8.75rem] shrink-0 flex flex-col gap-2">
                          <div className="w-full aspect-video bg-[#E4E4E7] rounded-lg"></div>
                          <div className="w-3/4 h-2 bg-[#0D0D12] rounded-full"></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2].map((i) => <div key={i} className="aspect-square bg-[#E4E4E7] rounded-xl"></div>)}
                    </div>
                    <div className="w-full rounded-lg border border-[#D25026] overflow-hidden bg-[#F4F4F5] relative aspect-[352/200]">
                      {selectedImage ? <img src={selectedImage.url} alt="Ad Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center gap-2"><ImageIcon className="w-12 h-12 text-[#E4E4E7]" /></div>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="p-6 border-b border-gray-100 relative shrink-0">
              <div className="flex items-center justify-center w-full">
                <DialogTitle className="text-[1.125rem] font-bold text-[#0D0D12]">{title}</DialogTitle>
              </div>
              <button onClick={handleClose} className="absolute right-6 top-6 p-1 text-[#4B5563]" disabled={isSubmitting}>
                <X className="w-6 h-6" />
              </button>
            </DialogHeader>

            <div className="p-6 flex flex-col gap-8 overflow-y-auto">
              {errors.submit && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm italic">
                  <CircleAlert className="w-4 h-4" />
                  {errors.submit}
                </div>
              )}
              {/* Upload Area */}
              <div className="flex flex-col gap-2">
                <div className={cn(
                  "w-full border border-[#E4E4E7] rounded-xl p-8 flex flex-col items-center justify-center gap-6 transition-colors relative bg-white",
                  errors.image ? "border-red-500 bg-red-50/10" : "",
                  selectedImage ? "p-4" : ""
                )}>
                  {selectedImage ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                      <img src={selectedImage.url} alt="Selected" className="w-full h-full object-cover rounded-lg" />
                      <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors" onClick={() => setSelectedImage(null)} disabled={isSubmitting}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-[#F4F4F5] rounded-xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#A1A1AA]" />
                      </div>
                      <div className="text-center flex flex-col gap-4">
                        <p className="text-[0.875rem] text-[#71717A] px-4 font-medium leading-normal">
                          Make sure to upload image in {imageInstructions.ratio} orientation. Supported formats: JPG & JPEG.
                        </p>
                        <p className="text-[0.8125rem] text-[#A1A1AA] font-normal italic">
                          Recommended image ratio: {imageInstructions.size}.
                        </p>
                      </div>
                      <button className="bg-white text-[#0D0D12] border border-[#E2E8F0] font-semibold h-fit py-2.5 px-6 rounded-lg shadow-xs hover:bg-gray-50 transition-all text-sm" onClick={() => setShowMediaPopup(true)} disabled={isSubmitting}>
                        Upload Image
                      </button>
                    </>
                  )}
                </div>
                {errors.image && !selectedImage && (
                  <div className="flex items-center gap-1 text-red-500 mt-1">
                    <CircleAlert className="w-4 h-4" />
                    <span className="text-xs font-medium">{errors.image}</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label className="text-[0.875rem] font-bold text-[#0D0D12]">Advertisement End Date</Label>
                  <div className="flex gap-2">
                    <Input placeholder="DD" maxLength={2} className={cn("w-[3.75rem] h-11 bg-white border-[#E4E4E7] rounded-lg text-center", errors.endDate && "border-red-500")} value={formData.day} onChange={(e) => setFormData({ ...formData, day: e.target.value })} disabled={isSubmitting} />
                    <div className="flex-1">
                      <Input placeholder="Month" className={cn("h-11 bg-white border-[#E4E4E7] rounded-lg", errors.endDate && "border-red-500")} value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <Input placeholder="YYYY" maxLength={4} className={cn("w-[5rem] h-11 bg-white border-[#E4E4E7] rounded-lg text-center", errors.endDate && "border-red-500")} value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} disabled={isSubmitting} />
                    <div className="w-11 h-11 border border-[#E4E4E7] rounded-lg flex items-center justify-center bg-white"><Calendar className="w-6 h-6 text-[#0D0D12]" /></div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-[0.875rem] font-bold text-[#0D0D12]">Title</Label>
                  <Input placeholder="insert title" className={cn("h-11 bg-white border-[#E4E4E7] rounded-lg placeholder:text-[#A1A1AA]", errors.title && "border-red-500")} value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} disabled={isSubmitting} />
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-[0.875rem] font-bold text-[#0D0D12]">Link</Label>
                  <Input placeholder="insert link" className={cn("h-11 bg-white border-[#E4E4E7] rounded-lg placeholder:text-[#A1A1AA]", errors.link && "border-red-500")} value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} disabled={isSubmitting} />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4 bg-white shrink-0">
              <Button type="button" className="flex-1 bg-[#D25026] text-white py-3 px-4 rounded-lg font-bold text-[0.875rem] hover:bg-[#b54622] transition-colors shadow-sm disabled:opacity-50" onClick={() => setIsPreviewMode(true)} disabled={isSubmitting}>
                Preview Ads
              </Button>
              <Button type="button" className="flex-1 bg-[#FFB366] text-white py-3 px-4 rounded-lg font-bold text-[0.875rem] hover:bg-[#ffa347] transition-colors shadow-sm flex items-center justify-center gap-2" onClick={handleUpload} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Insert Image
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
