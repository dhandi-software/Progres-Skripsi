import axios from "axios";

const getEnvUrl = () => {
    if (typeof window === "undefined" && typeof process !== "undefined" && process?.env?.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL;
    }
    const envBase = import.meta.env.VITE_API_BASE_URL || "";
    if (envBase.includes("141.11.190.106")) {
        return "/api";
    }
    return envBase;
};

const envUrl = getEnvUrl();
const baseUrl = envUrl.replace(/\/$/, "");

// Use '/api' prefix as requested ("tetep yang saya punya")
export const API_URL = !baseUrl || baseUrl === "/api" || baseUrl.endsWith("/api") ? (baseUrl || "/api") : `${baseUrl}/api`;

// We also export the static uploads URL for static file links (strip /api suffix for static files)
const rawUploads = baseUrl.replace(/\/api\/?$/, "");
export const UPLOADS_URL = rawUploads;

export const getFileUrl = (fileUrl?: string | null): string => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return fileUrl;
    }
    const cleanPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
    const normalized = cleanPath.startsWith("/api/uploads") ? cleanPath.replace("/api/uploads", "/uploads") : cleanPath;
    return UPLOADS_URL ? `${UPLOADS_URL}${normalized}` : normalized;
};

export const client = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Enable sending cookies with requests
    withCredentials: true,
});

// Response interceptor to handle errors
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            console.warn("Unauthorized request - JWT might be expired");
        }
        if (status === 502 || status === 503 || status === 504 || !error.response) {
            if (typeof window !== "undefined" && window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);
