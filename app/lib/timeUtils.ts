import { formatDistanceToNowStrict } from "date-fns";
import { enUS } from "date-fns/locale";

/**
 * Parses a backend date string into a Date object.
 * Handles formats like "2025-12-05 08:00:45 +0700 WIB"
 * Now also handles "2025-12-23 13:00:00" format
 */
export function parseBackendDate(timestamp: string): Date | null {
    if (!timestamp) return null;

    try {
        // Remove timezone abbreviations that confuse Date parsing (WIB, WITA, WIT)
        const cleanTimestamp = timestamp
            .replace(/\s+(WIB|WITA|WIT)$/i, "")
            .trim();

        // Check if the format is "YYYY-MM-DD HH:mm:ss" without timezone
        // This handles format like "2025-12-23 13:00:00"
        const simpleFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

        if (simpleFormatRegex.test(cleanTimestamp)) {
            // Convert to ISO format by replacing space with 'T'
            // This ensures proper parsing in all browsers
            const isoFormatted = cleanTimestamp.replace(" ", "T") + "Z";
            const date = new Date(isoFormatted);

            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Original parsing logic for other formats
        const date = new Date(cleanTimestamp);

        if (isNaN(date.getTime())) {
            // Try fallback: sometimes spaces need to be replaced with 'T' for ISO strict parsers
            const isoTimestamp = cleanTimestamp.replace(" ", "T");
            const fallbackDate = new Date(isoTimestamp);
            if (!isNaN(fallbackDate.getTime())) return fallbackDate;
            return null;
        }

        return date;
    } catch (error) {
        console.error("Error parsing date:", timestamp, error);
        return null;
    }
}

/**
 * Convert a timestamp string to a relative time string (e.g., "2 hours ago")
 * @param timestamp - The timestamp string
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: string): string {
    const date = parseBackendDate(timestamp);
    if (!date) return timestamp || "";

    try {
        return formatDistanceToNowStrict(date, {
            addSuffix: true,
            locale: enUS,
        });
    } catch (error) {
        return timestamp;
    }
}

/**
 * Formats a timestamp into a display format (e.g., "7 Dec 2024")
 */
export function formatDisplayDate(timestamp: string): string {
    const date = parseBackendDate(timestamp);
    if (!date) return timestamp || "";

    try {
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch (error) {
        return timestamp;
    }
}
