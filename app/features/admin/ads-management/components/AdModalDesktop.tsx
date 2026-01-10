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
import MediaDesktop from "~/features/admin/media/MediaDesktop";
import { adsApi } from "~/api/adsApi";
import type { AdvertisementRequest } from "~/api/types";
import { Button } from "~/components/ui/button";

interface AdModalDesktopProps {
  type: "hero" | "sidebar";
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function AdModalDesktop({ type, isOpen, onClose, onUploadSuccess }: AdModalDesktopProps) {
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

  const MockupPage = () => (
    <div className="w-full flex gap-6 p-6 bg-white border border-gray-100 rounded-xl overflow-hidden pointer-events-none select-none">
      {/* Sidebar Mockup */}
      <div className="w-48 shrink-0 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gray-200" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full h-3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Mockup */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Navigation Mockup */}
        <div className="flex items-center gap-6 border-b border-gray-100 pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-16 h-3 bg-gray-200 rounded" />
          ))}
        </div>

        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-6">
            {/* Hero Slot */}
            <div className={cn(
              "w-full aspect-[944/351] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center relative border-2 transition-all",
              isHero ? "border-[#D25026] scale-[1.02] shadow-lg z-10" : "border-transparent opacity-60"
            )}>
              {isHero && selectedImage ? (
                <img src={selectedImage.url} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs font-medium uppercase tracking-wider">Hero Advertisement</span>
                </div>
              )}
            </div>

            {/* Content Cards Mockup */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-full aspect-video bg-gray-100 rounded-lg" />
                  <div className="w-full h-3 bg-gray-200 rounded" />
                  <div className="w-2/3 h-3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar Mockup */}
          <div className="w-64 shrink-0 flex flex-col gap-6">
            {/* Spotlight Slot */}
            <div className={cn(
              "w-full aspect-[352/420] rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center relative border-2 transition-all",
              !isHero ? "border-[#D25026] scale-[1.02] shadow-lg z-10" : "border-transparent opacity-60"
            )}>
              {!isHero && selectedImage ? (
                <img src={selectedImage.url} alt="Spotlight" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-xs font-medium uppercase tracking-wider">Spotlight</span>
                </div>
              )}
            </div>

            {/* Latest News Mockup */}
            <div className="flex flex-col gap-4">
              <div className="w-24 h-4 bg-gray-300 rounded mb-2" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-full h-2 bg-gray-200 rounded" />
                    <div className="w-1/2 h-2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e) => {
          if (showMediaPopup || isSubmitting) e.preventDefault();
        }}
        className={cn(
          "bg-white p-0 border-none gap-0 transition-all duration-300 w-[62rem] rounded-2xl overflow-auto max-h-[49rem] flex flex-col",
        )}>
        {showMediaPopup ? (
          <div className="animate-in fade-in zoom-in-95 duration-200 min-h-[37.5rem]">
            <MediaDesktop
              standalone={false}
              onClose={() => setShowMediaPopup(false)}
              onImageSelect={(img) => {
                setSelectedImage(img);
                setErrors((prev) => ({ ...prev, image: "" }));
                setShowMediaPopup(false);
              }}
            />
          </div>
        ) : isPreviewMode ? (
          <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300 bg-white">
            <DialogHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsPreviewMode(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-[#0D0D12]" />
                </button>
                <div>
                  <DialogTitle className="text-xl font-bold text-[#0D0D12]">Preview {title}</DialogTitle>
                  <p className="text-sm text-gray-500">How your advertisement will look on the live site.</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </DialogHeader>

            <div className="p-8 bg-[#F9FAFB] min-h-[31.25rem] overflow-y-auto max-h-[70vh]">
              <MockupPage />
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <DialogHeader className="p-6 border-b border-gray-50 flex items-center justify-center relative shrink-0">
              <div className="flex flex-col items-center gap-1 text-center">
                <DialogTitle className="text-xl font-bold text-[#0D0D12]">{title}</DialogTitle>
              </div>
              <button onClick={handleClose} className="absolute right-6 top-6 p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
              {/* Upload Section (Full Width) */}
              <div className="flex flex-col gap-2">
                <div className={cn(
                  "w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-6 transition-all bg-white min-h-[21.875rem]",
                  errors.image ? "border-red-200 bg-red-50/10" : "border-[#E5E7EB]",
                  selectedImage ? "border-solid border-[#D25026] p-4" : "p-12"
                )}>
                  {selectedImage ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img src={selectedImage.url} alt="Selected" className="max-w-full max-h-[18.75rem] rounded-lg shadow-lg object-contain" />
                      <button
                        className="absolute -top-3 -right-3 bg-white border border-gray-200 shadow-md text-gray-500 p-2 hover:text-red-500 rounded-full transition-all"
                        onClick={() => setSelectedImage(null)}
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#F4F4F5] rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-[#A1A1AA]" />
                      </div>
                      <div className="text-center flex flex-col gap-2">
                        <p className="text-sm text-[#71717A] font-medium leading-relaxed">
                          Make sure to upload image ratio in {isHero ? "horizontal (landscape)" : "vertical (portrait)"} orientation. Supported formats: JPG & JPEG.
                        </p>
                        <p className="text-[0.8125rem] text-[#A1A1AA] italic">
                          Recommended image size: {isHero ? "59rem (width) × 21.9375rem (height)" : "22rem (width) × 26.25rem (height)"}.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-white text-[#0D0D12] border-[#E2E8F0] font-bold h-fit py-2.5 px-8 rounded-lg shadow-xs hover:bg-gray-50 transition-all font-inter"
                        onClick={() => setShowMediaPopup(true)}
                        disabled={isSubmitting}
                      >
                        Upload Image
                      </Button>
                    </>
                  )}
                </div>
                {errors.image && !selectedImage && (
                  <div className="flex items-center gap-2 text-red-500 text-sm font-medium mt-1">
                    <CircleAlert className="w-4 h-4" />
                    <span>{errors.image}</span>
                  </div>
                )}
              </div>

              {/* Form Section (Vertical Stack) */}
              <div className="flex flex-col gap-6">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm">
                    <CircleAlert className="w-5 h-5 shrink-0" />
                    <p>{errors.submit}</p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-bold text-[#0D0D12]">Advertisement End Date</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="DD"
                      maxLength={2}
                      className={cn("w-[3.75rem] h-11 bg-white border-[#E4E4E7] rounded-lg text-center focus:ring-[#D25026]", errors.endDate && "border-red-500")}
                      value={formData.day}
                      onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <Input
                      placeholder="Month"
                      className={cn("flex-1 h-11 bg-white border-[#E4E4E7] rounded-lg focus:ring-[#D25026]", errors.endDate && "border-red-500")}
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <Input
                      placeholder="YYYY"
                      maxLength={4}
                      className={cn("w-[6.25rem] h-11 bg-white border-[#E4E4E7] rounded-lg text-center focus:ring-[#D25026]", errors.endDate && "border-red-500")}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      disabled={isSubmitting}
                    />
                    <div className="w-11 h-11 border border-[#E4E4E7] rounded-lg flex items-center justify-center bg-white">
                      <Calendar className="w-6 h-6 text-[#0D0D12]" />
                    </div>
                  </div>
                  {errors.endDate && <p className="text-xs font-medium text-red-500">{errors.endDate}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-bold text-[#0D0D12]">Title</Label>
                  <Input
                    placeholder="Insert advertisement title"
                    className={cn("h-11 bg-white border-[#E4E4E7] rounded-lg focus:ring-[#D25026] placeholder:text-[#A1A1AA]", errors.title && "border-red-500")}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-xs font-medium text-red-500">{errors.title}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-sm font-bold text-[#0D0D12]">Link</Label>
                  <Input
                    placeholder="Insert advertisement link"
                    className={cn("h-11 bg-white border-[#E4E4E7] rounded-lg focus:ring-[#D25026] placeholder:text-[#A1A1AA]", errors.link && "border-red-500")}
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    disabled={isSubmitting}
                  />
                  {errors.link && <p className="text-xs font-medium text-red-500">{errors.link}</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-3 justify-end items-center bg-white shrink-0">
              <Button
                type="button"
                variant="outline"
                className="px-8 py-3 h-12 bg-white border-[#E2E8F0] text-[#0D0D12] font-bold rounded-xl hover:bg-gray-50 transition-all shrink-0"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="px-8 py-3 h-12 !bg-[#D25026] text-white font-bold rounded-xl hover:bg-[#b54622] transition-all disabled:opacity-50 shrink-0"
                onClick={() => setIsPreviewMode(true)}
                disabled={isSubmitting || !selectedImage}
              >
                Preview ads
              </Button>
              <Button
                type="button"
                className="px-8 py-3 h-12 bg-[#FFB366] text-white font-bold rounded-xl hover:bg-[#ffa347] transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                onClick={handleUpload}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload advertisement
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog >
  );
}
