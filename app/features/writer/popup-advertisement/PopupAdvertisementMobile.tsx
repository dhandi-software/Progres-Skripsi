import { useState, useRef } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface MediaItem {
    id: string;
    file: File;
    url: string;
    name: string;
    extension: string;
}

interface PopupAdvertisementMobileProps {
    onClose: () => void;
    onImageSelect: (mediaItem: MediaItem) => void;
}

export default function PopupAdvertisementMobile({
    onClose,
    onImageSelect,
}: PopupAdvertisementMobileProps) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errors, setErrors] = useState({
        image: false,
        title: false,
        link: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, image: false }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            image: !selectedFile,
            title: !title.trim(),
            link: !link.trim(),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(Boolean);
    };

    const handleInsertImage = () => {
        if (!validateForm()) {
            return;
        }

        if (selectedFile) {
            const mediaItem: MediaItem = {
                id: Date.now().toString(),
                file: selectedFile,
                url: previewUrl || URL.createObjectURL(selectedFile),
                name: selectedFile.name,
                extension: selectedFile.name.split(".").pop() || "",
            };
            onImageSelect(mediaItem);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
            <div className="w-full max-h-[85vh] bg-white rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h3 className="text-base font-semibold text-gray-900">
                        Advertisement
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 -mr-1 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    {/* Image Upload Area */}
                    <div className="flex flex-col gap-1">
                        <div className={cn(
                            "w-full aspect-[16/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden",
                            errors.image
                                ? "border-[#E11D48] ring-[0.1875rem] ring-[#FFC9C999]"
                                : "border-gray-200"
                        )}>
                            {previewUrl ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                                    >
                                        <X className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 px-6 py-8">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 text-center">
                                        Make sure to upload image in landscape orientation.
                                        Supported formats: JPG, JPEG & PNG.
                                    </p>
                                    <p className="text-xs text-gray-400 text-center">
                                        Recommended ratio: 59rem × 18.625rem
                                    </p>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/jpg,image/jpeg,image/png"
                                        className="hidden"
                                    />

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddImage}
                                        className="mt-2"
                                    >
                                        Add Image
                                    </Button>
                                </div>
                            )}
                        </div>
                        {errors.image && (
                            <p className="text-xs text-[#E11D48] mt-1">Please upload an image</p>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-900">Title</label>
                            <input
                                type="text"
                                placeholder="Insert title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, title: false }));
                                    }
                                }}
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all",
                                    errors.title
                                        ? "border-[#E11D48] ring-[0.1875rem] ring-[#FFC9C999]"
                                        : "border-gray-200 focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
                                )}
                            />
                            {errors.title && (
                                <p className="text-xs text-[#E11D48]">Please add a title</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-900">Link</label>
                            <input
                                type="text"
                                placeholder="Insert link"
                                value={link}
                                onChange={(e) => {
                                    setLink(e.target.value);
                                    if (e.target.value.trim()) {
                                        setErrors(prev => ({ ...prev, link: false }));
                                    }
                                }}
                                className={cn(
                                    "w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-all",
                                    errors.link
                                        ? "border-[#E11D48] ring-[0.1875rem] ring-[#FFC9C999]"
                                        : "border-gray-200 focus:ring-2 focus:ring-[#D94F24]/20 focus:border-[#D94F24]"
                                )}
                            />
                            {errors.link && (
                                <p className="text-xs text-[#E11D48]">Please add a link</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                    <Button
                        onClick={handleInsertImage}
                        className="w-full bg-[#D94F24] hover:bg-[#c14620] text-white"
                    >
                        Insert Image
                    </Button>
                </div>
            </div>
        </div>
    );
}
