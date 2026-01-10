import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface ImageCheckProps {
    image: File | string;
    isSelected?: boolean;
    onSelect?: () => void;
    onDeselect?: () => void;
    showDeselectButton?: boolean;
    fileName?: string;
    fileExtension?: string;
    isLoading?: boolean;
}

export default function ImageCheck({
    image,
    isSelected = false,
    onSelect,
    onDeselect,
    showDeselectButton = true,
    fileName,
    fileExtension,
    isLoading = false,
}: ImageCheckProps) {
    const [imageError, setImageError] = useState(false);

    // Get image info
    const getImageInfo = () => {
        if (fileName && fileExtension) {
            const url =
                typeof image === "string" ? image : URL.createObjectURL(image);
            return {
                name: fileName,
                extension: fileExtension,
                url,
            };
        }

        if (typeof image === "string") {
            const urlParts = image.split("/").pop() || "";
            const name = urlParts.split(".")[0] || "image";
            const extension = urlParts.split(".").pop()?.toLowerCase() || "jpg";
            return { name, extension, url: image };
        } else {
            const name = image.name.split(".")[0];
            const extension =
                image.name.split(".").pop()?.toLowerCase() || "jpg";
            const url = URL.createObjectURL(image);
            return { name, extension, url };
        }
    };

    const { name, extension, url } = getImageInfo();

    // PERUBAHAN: Handle click untuk toggle selection
    const handleImageClick = () => {
        if (isLoading) return; // Jangan biarkan klik jika sedang loading

        if (isSelected) {
            // Jika sudah terpilih, panggil onDeselect
            onDeselect?.();
        } else {
            // Jika belum terpilih, panggil onSelect
            onSelect?.();
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // PERUBAHAN: Handle deselect button click
    const handleDeselectButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeselect?.();
    };

    return (
        <div
            className={cn(
                "w-full h-fit gap-[0.25rem] cursor-pointer transition-all duration-200 relative",
                isSelected && "rounded-[0.5rem] p-[0.125rem]",
                isLoading && "opacity-70 cursor-not-allowed",
            )}
            onClick={handleImageClick} // Tetap menggunakan handleImageClick
        >
            {/* Image Container */}
            <div className="w-full h-[8.875rem] relative rounded-[0.375rem] border border-border-subtle overflow-hidden group">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <span className="text-desc-sm text-foreground">
                                Uploading...
                            </span>
                        </div>
                    </div>
                )}

                <img
                    src={imageError ? "/images/Picture.svg" : url}
                    alt={name}
                    className={cn(
                        "w-full h-full object-cover",
                        isLoading && "filter blur-sm",
                    )}
                    onError={handleImageError}
                />

                {/* Check Icon - Positioned bottom right */}
                <div
                    className={cn(
                        "absolute bottom-[0.25rem] right-[0.219rem] w-[1rem] h-[1rem] rounded-[0.25rem] shadow-xs transition-all duration-200 flex items-center justify-center z-20",
                        isSelected
                            ? "bg-destructive-focus"
                            : "bg-background border border-border-subtle",
                        isLoading && "opacity-50",
                    )}
                >
                    {isSelected && !isLoading && (
                        <Check className="w-[0.75rem] h-[0.75rem] text-background" />
                    )}
                </div>

                {/* Overlay effect on hover */}
                <div
                    className={cn(
                        "absolute inset-0 transition-all duration-200",
                        isSelected ? "bg-primary/10" : "group-hover:bg-black/5",
                        isLoading && "hidden",
                    )}
                />
            </div>

            {/* File Name and Extension */}
            <div className="w-[7.906rem] h-fit flex items-center justify-between px-[0.125rem] mt-1">
                <div className="flex items-center gap-1 min-w-0">
                    <span
                        className={cn(
                            "text-desc-sm truncate transition-colors duration-200",
                            isSelected
                                ? "text-primary"
                                : "text-muted-foreground",
                            isLoading && "opacity-70",
                        )}
                        title={`${name}.${extension}`}
                    >
                        {name}.{extension}
                    </span>
                    {isLoading && (
                        <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                    )}
                </div>

                {/* Deselect Button - Only shows when selected and enabled */}
                {isSelected && showDeselectButton && !isLoading && (
                    <button
                        onClick={handleDeselectButtonClick} // Menggunakan fungsi baru
                        className="w-fit h-fit p-[0.125rem] rounded-[0.25rem] bg-destructive-focus outline outline-1 outline-black/20 shadow-xs flex items-center justify-center hover:bg-destructive-focus/80 transition-colors flex-shrink-0"
                        title="Deselect image"
                    >
                        <X className="w-[0.75rem] h-[0.75rem] text-background" />
                    </button>
                )}
            </div>
        </div>
    );
}
