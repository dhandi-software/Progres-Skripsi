// api/profileApi.ts
import { client } from "./client";
import type { ProfileResponse, ProfileUpdateRequest } from "./types";

export const profileApi = {
    async getProfile(userId: string): Promise<ProfileResponse> {
        try {
            const response = await client.get<ProfileResponse>(
                `/profile/${userId}`,
            );

            if (response.data.code === 302 || response.data.code === 200) {
                return response.data;
            }

            throw new Error(response.data.message || "Failed to fetch profile");
        } catch (error: any) {
            if (error.response?.data?.code === 302) {
                return error.response.data;
            }

            throw {
                code: error.response?.status || error.code || 500,
                status: "error",
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to fetch profile",
                data: error.response?.data,
            };
        }
    },

    async getPublicProfile(userId: number) {
        try {
            const response = await client.get(`/pengajuan/profile/public/${userId}`);
            return response.data.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404 && !error.response.data?.message) {
                 throw new Error("Endpoint API belum tersedia. Harap restart server backend (Express).");
            }
            throw new Error(error.response?.data?.message || "Failed to fetch public profile");
        }
    },

    async updateProfile(
        userId: string,
        data: ProfileUpdateRequest,
    ): Promise<ProfileResponse> {
        const formData = new FormData();

        // SELALU kirim username dan bio - ini penting!
        formData.append("username", data.username || "");
        formData.append("bio", data.bio || "");

        // Kirim name jika ada (biasanya tidak bisa diubah, tapi kirim saja)
        if (data.name !== undefined && data.name !== null && data.name !== "") {
            formData.append("name", data.name);
        }

        // Kirim email jika ada (biasanya tidak bisa diubah, tapi kirim saja)
        if (
            data.email !== undefined &&
            data.email !== null &&
            data.email !== ""
        ) {
            formData.append("email", data.email);
        }

        // Handle photo upload
        if (data.photo instanceof File) {
            formData.append("photo", data.photo);
        } else if (
            typeof data.photo === "string" &&
            data.photo.startsWith("data:")
        ) {
            const blob = dataURLtoBlob(data.photo);
            if (blob) {
                formData.append("photo", blob, `profile_${Date.now()}.jpg`);
            }
        } else if (data.photo === null || data.photo === "") {
            // Jika ingin menghapus photo
            formData.append("photo", "");
        }

        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await client.put<ProfileResponse>(
                `/profile/${userId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.data.code === 302 || response.data.code === 200) {
                return response.data;
            }

            throw new Error(
                response.data.message || "Failed to update profile",
            );
        } catch (error: any) {
            throw {
                code: error.response?.status || 500,
                status: "error",
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update profile",
                data: error.response?.data,
            };
        }
    },

    async getProfilePhoto(filename: string): Promise<string> {
        if (!filename || filename === "null" || filename === "undefined") {
            return "/logo_up.webp";
        }

        try {
            let cleanFilename = filename;
            if (filename.includes("/")) {
                cleanFilename = filename.split("/").pop() || filename;
            }

            const response = await client.get(`/profile/${cleanFilename}`, {
                responseType: "blob",
            });

            const blob = response.data;
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            return "/logo_up.webp";
        }
    },

    getProfilePhotoUrl: (photoPath: string): string => {
        if (!photoPath || photoPath === "null" || photoPath === "undefined") {
            return "/logo_up.webp";
        }

        if (
            photoPath.startsWith("http://") ||
            photoPath.startsWith("https://") ||
            photoPath.startsWith("data:")
        ) {
            return photoPath;
        }

        const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";
        // Clean origin host by removing trailing slashes and /api suffix
        const originUrl = rawBaseUrl.replace(/\/$/, "").replace(/\/api$/, "");

        const filename = photoPath.includes("/") ? photoPath.split("/").pop() || photoPath : photoPath;

        return `${originUrl}/api/pengajuan/profile/${filename}`;
    },
};

function dataURLtoBlob(dataurl: string): Blob | null {
    try {
        const arr = dataurl.split(",");
        if (arr.length < 2) return null;

        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) return null;

        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    } catch (error) {
        return null;
    }
}
