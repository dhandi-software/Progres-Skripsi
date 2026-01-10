import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { cn } from "~/lib/utils";

interface MediaItem {
    id: string;
    file: File;
    url: string;
    name: string;
    extension: string;
}

interface PopupAdvertisementDesktopProps {
    onClose: () => void;
    onImageSelect: (mediaItem: MediaItem) => void;
}

export default function PopupAdvertisementDesktop({
    onClose,
    onImageSelect,
}: PopupAdvertisementDesktopProps) {
    const [title, setTitle] = useState("");
    const [link, setLink] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [errors, setErrors] = useState({
        image: false,
        title: false,
        link: false,
    });
    const popupRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Center popup on mount
    useEffect(() => {
        if (popupRef.current) {
            const popupWidth = popupRef.current.offsetWidth;
            const popupHeight = popupRef.current.offsetHeight;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            setPosition({
                x: (windowWidth - popupWidth) / 2,
                y: (windowHeight - popupHeight) / 2,
            });
        }
    }, []);

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

    // Drag and drop handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (popupRef.current) {
            setIsDragging(true);
            const rect = popupRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    return (
        <div
            ref={popupRef}
            className="fixed w-fit h-fit px-[1.5rem] py-[1.5rem] gap-[1.5rem] rounded-lg bg-background border border-border-subtle shadow-lg cursor-move"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: "none",
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Header */}
            <div className="w-full h-fit flex items-center justify-between mb-4">
                <h3 className="w-full h-fit text-label-lg font-semibold text-center">
                    Advertisement
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="w-[1.125rem] h-[1.125rem] hover:bg-transparent absolute right-4 top-4"
                >
                    <X className="w-[1.125rem] h-[1.125rem] text-foreground" />
                </Button>
            </div>

            {/* Image Upload Area */}
            <div className="flex flex-col gap-1 mb-4">
                <div className={cn(
                    "w-[59rem] h-[18.625rem] gap-6 px-sm py-sm rounded-md border border-dashed flex flex-col items-center justify-center overflow-hidden",
                    errors.image
                        ? "border-[#E11D48] ring-[0.1875rem] ring-[#FFC9C999]"
                        : "border-border-subtle"
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
                                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-[2.5rem] h-[2.5rem] text-muted-foreground" />
                            <p className="w-full h-fit text-paragraph-sm text-muted-foreground text-center">
                                Make sure to upload image in vertical (portrait)
                                orientation. Supported formats: JPG & JPEG.
                            </p>
                            <p className="text-[0.75rem] leading-xs text-muted-foreground text-center">
                                Recommended image ratio: 59rem (width) × 18.625rem (height).
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
                                className="w-fit h-[2rem] gap-sm px-md py-sm rounded-md bg-background border-border-subtle shadow-xs mt-2"
                            >
                                Add Image
                            </Button>
                        </>
                    )}
                </div>
                {errors.image && (
                    <p className="text-[0.75rem] text-[#E11D48] mt-1">Please upload an image</p>
                )}
            </div>

            {/* Form Fields */}
            <div className="w-full h-fit flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <TextField
                        variant="vertical"
                        label="Title"
                        placeholder="Insert title"
                        size="sm"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (e.target.value.trim()) {
                                setErrors(prev => ({ ...prev, title: false }));
                            }
                        }}
                        className={cn(
                            "w-full",
                            errors.title && "[&_input]:border-[#E11D48] [&_input]:ring-[0.1875rem] [&_input]:ring-[#FFC9C999]"
                        )}
                    />
                    {errors.title && (
                        <p className="text-[0.75rem] text-[#E11D48]">Please add a title</p>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <TextField
                        variant="vertical"
                        label="Link"
                        placeholder="Insert link"
                        size="sm"
                        value={link}
                        onChange={(e) => {
                            setLink(e.target.value);
                            if (e.target.value.trim()) {
                                setErrors(prev => ({ ...prev, link: false }));
                            }
                        }}
                        className={cn(
                            "w-full",
                            errors.link && "[&_input]:border-[#E11D48] [&_input]:ring-[0.1875rem] [&_input]:ring-[#FFC9C999]"
                        )}
                    />
                    {errors.link && (
                        <p className="text-[0.75rem] text-[#E11D48]">Please add a link</p>
                    )}
                </div>
            </div>

            {/* Action Button */}
            <div className="w-full h-fit flex justify-center gap-sm mt-4">
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleInsertImage}
                    className="w-fit h-[2rem] gap-sm px-md py-sm rounded-md bg-brand-primary-muted-foreground border-border-subtle shadow-xs"
                >
                    Insert Image
                </Button>
            </div>
        </div>
    );
}

