const webp = require("webp-converter");

export interface ConversionResult {
    success: boolean;
    buffer?: Buffer;
    error?: string;
    originalSize: number;
    convertedSize?: number;
    quality: number;
}

/**
 * Konversi image buffer ke WebP dengan kualitas optimal
 */
export async function convertToWebP(
    imageBuffer: Buffer,
    originalFormat: string,
    quality: number = 80,
): Promise<ConversionResult> {
    try {
        const originalSize = imageBuffer.length;

        // Validasi ukuran file (max 1MB)
        if (originalSize > 1024 * 1024) {
            return {
                success: false,
                error: "File size exceeds 1MB limit",
                originalSize,
                quality,
            };
        }

        // Format yang didukung
        const supportedFormats = ["jpg", "jpeg", "png", "tiff", "bmp"];
        const format = originalFormat.toLowerCase().replace("jpeg", "jpg");

        if (!supportedFormats.includes(format)) {
            return {
                success: false,
                error: `Unsupported image format: ${originalFormat}`,
                originalSize,
                quality,
            };
        }

        // Optimasi kualitas berdasarkan ukuran file
        let optimizedQuality = quality;
        if (originalSize > 500 * 1024) {
            // > 500KB
            optimizedQuality = 75;
        } else if (originalSize > 200 * 1024) {
            // > 200KB
            optimizedQuality = 80;
        } else {
            optimizedQuality = 85; // < 200KB, gunakan kualitas tinggi
        }

        // Konversi ke WebP dengan parameter optimasi
        const webpBuffer = await webp.buffer2webpbuffer(
            imageBuffer,
            format,
            `-q ${optimizedQuality} -m 6`,
        );

        const convertedSize = webpBuffer.length;

        return {
            success: true,
            buffer: webpBuffer,
            originalSize,
            convertedSize,
            quality: optimizedQuality,
        };
    } catch (error) {
        console.error("Conversion error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Conversion failed",
            originalSize: imageBuffer.length,
            quality,
        };
    }
}

/**
 * Validasi ukuran file (max 1MB)
 */
export function validateFileSize(file: File): boolean {
    return file.size <= 1024 * 1024; // 1MB
}

/**
 * Dapatkan format file dari nama file
 */
export function getFileFormat(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    return extension === "jpg" ? "jpeg" : extension;
}

/**
 * Hitung kompresi ratio
 */
export function getCompressionRatio(
    originalSize: number,
    convertedSize: number,
): number {
    return ((originalSize - convertedSize) / originalSize) * 100;
}

/**
 * Format bytes ke readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
