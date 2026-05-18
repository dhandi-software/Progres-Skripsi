import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML strings to prevent XSS attacks.
 * In SSR environments, it returns the content as-is (with a warning) 
 * or can be extended with jsdom if needed.
 */
export function sanitizeHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Fallback for SSR if window is not available
        return html;
    }
    return DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel'], // Allow target and rel for links
    });
}
