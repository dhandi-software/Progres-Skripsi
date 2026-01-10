// hooks/useProfile.ts
import { useState, useEffect, useCallback } from "react";
import { profileApi } from "~/api/profileApi";
import type { ProfileData } from "~/api/types";

interface ToastProps {
    title: string;
    variant: "success" | "destructive" | "default";
}

interface ProfileFormData {
    name: string;
    email: string;
    username: string;
    bio: string;
    photo: string;
    photoFile: File | null;
}

interface UseProfileReturn {
    profile: ProfileData | null;
    isLoading: boolean;
    formData: ProfileFormData;
    isEditing: boolean;
    isSaving: boolean;
    lastPasswordUpdate: string;
    toastProps: ToastProps | null;
    showToast: (title: string, variant?: ToastProps["variant"]) => void;
    handleInputChange: (
        field: keyof Omit<ProfileFormData, "photoFile">,
        value: string,
    ) => void;
    handlePhotoUpload: (file: File) => void;
    handleSaveProfile: () => Promise<void>;
    handleCancelEdit: () => void;
    updateLastPasswordTime: () => void;
    loadProfile: () => Promise<void>;
}

export function useProfile(userId?: string): UseProfileReturn {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        email: "",
        username: "",
        bio: "",
        photo: "/images/avatar.svg",
        photoFile: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastPasswordUpdate, setLastPasswordUpdate] = useState<string | null>(
        localStorage.getItem("lastPasswordUpdate") || null,
    );
    const [toastProps, setToastProps] = useState<ToastProps | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(
        userId || null,
    );

    const showToast = useCallback(
        (title: string, variant: ToastProps["variant"] = "success") => {
            setToastProps({ title, variant });
            setTimeout(() => {
                setToastProps(null);
            }, 3000);
        },
        [],
    );

    const getUserIdFromToken = useCallback(async (): Promise<string> => {
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                throw new Error("No JWT token found");
            }

            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                window
                    .atob(base64)
                    .split("")
                    .map(function (c) {
                        return (
                            "%" +
                            ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                        );
                    })
                    .join(""),
            );
            const payload = JSON.parse(jsonPayload);

            const userId = payload.sub || payload.id || payload.user_id;

            if (!userId) {
                throw new Error("User ID not found in token");
            }

            localStorage.setItem("userId", userId);
            return userId;
        } catch (error) {
            throw error;
        }
    }, []);

    const formatTimeAgo = useCallback((dateString: string): string => {
        if (!dateString) return "Never updated";

        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 120) return "1 minute ago";

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24)
            return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;

        const weeks = Math.floor(days / 7);
        if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

        const months = Math.floor(days / 30);
        if (months < 12)
            return months === 1 ? "1 month ago" : `${months} months ago`;

        const years = Math.floor(days / 365);
        return years === 1 ? "1 year ago" : `${years} years ago`;
    }, []);

    const getPasswordLastUpdated = useCallback((): string => {
        if (!lastPasswordUpdate) return "Never updated";
        return `Last updated ${formatTimeAgo(lastPasswordUpdate)}`;
    }, [lastPasswordUpdate, formatTimeAgo]);

    const updateLastPasswordTime = useCallback(() => {
        const now = new Date().toISOString();
        setLastPasswordUpdate(now);
        localStorage.setItem("lastPasswordUpdate", now);
        showToast("Password successfully changed", "success");
    }, [showToast]);

    const loadProfile = useCallback(async () => {
        try {
            setIsLoading(true);

            let targetUserId = currentUserId;
            if (!targetUserId) {
                targetUserId = await getUserIdFromToken();
                setCurrentUserId(targetUserId);
            }

            const response = await profileApi.getProfile(targetUserId!);

            if (response.data) {
                const profileData = response.data;

                let photoUrl = "/images/avatar.svg";
                if (
                    profileData.photo &&
                    profileData.photo !== "null" &&
                    profileData.photo !== "undefined"
                ) {
                    photoUrl = profileApi.getProfilePhotoUrl(profileData.photo);
                }

                setProfile(profileData);
                setFormData({
                    name: profileData.name || "",
                    email: profileData.email || "",
                    username: profileData.username || "",
                    bio: profileData.bio || "",
                    photo: photoUrl,
                    photoFile: null,
                });

                setIsEditing(false);

                // Simpan DI SEMUA bagian localStorage untuk konsistensi
                localStorage.setItem(
                    "userProfile",
                    JSON.stringify(profileData),
                );
                localStorage.setItem("userPhoto", photoUrl);
                localStorage.setItem("userBio", profileData.bio || "");
                localStorage.setItem(
                    "userUsername",
                    profileData.username || "",
                );

                console.log("✅ Profile loaded and cached:", {
                    username: profileData.username,
                    bio: profileData.bio,
                    photo: profileData.photo,
                });
            } else {
                throw new Error(response.message || "Failed to load profile");
            }
        } catch (error: any) {
            // Coba load dari cache jika ada
            const cachedProfile = localStorage.getItem("userProfile");
            if (cachedProfile) {
                try {
                    const profileData = JSON.parse(cachedProfile);
                    setProfile(profileData);

                    let photoUrl =
                        localStorage.getItem("userPhoto") ||
                        "/images/avatar.svg";
                    if (!photoUrl || photoUrl === "/images/avatar.svg") {
                        if (
                            profileData.photo &&
                            profileData.photo !== "null" &&
                            profileData.photo !== "undefined"
                        ) {
                            photoUrl = profileApi.getProfilePhotoUrl(
                                profileData.photo,
                            );
                        }
                    }

                    setFormData({
                        name: profileData.name || "",
                        email: profileData.email || "",
                        username:
                            localStorage.getItem("userUsername") ||
                            profileData.username ||
                            "",
                        bio:
                            localStorage.getItem("userBio") ||
                            profileData.bio ||
                            "",
                        photo: photoUrl,
                        photoFile: null,
                    });
                    showToast("Loaded profile from cache", "default");
                } catch (cacheError) {
                    showToast(
                        error.message || "Failed to load profile",
                        "destructive",
                    );
                }
            } else {
                showToast(
                    error.message || "Failed to load profile",
                    "destructive",
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, getUserIdFromToken, showToast]);

    const handleInputChange = useCallback(
        (field: keyof Omit<ProfileFormData, "photoFile">, value: string) => {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
            if (!isEditing) setIsEditing(true);
        },
        [isEditing],
    );

    const handlePhotoUpload = useCallback(
        (file: File) => {
            const validTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif",
            ];
            if (!validTypes.includes(file.type)) {
                showToast(
                    "Invalid image format. Use JPG, PNG, WebP, or GIF",
                    "destructive",
                );
                return;
            }

            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast("Image size should be less than 5MB", "destructive");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setFormData((prev) => ({
                        ...prev,
                        photo: e.target!.result as string,
                        photoFile: file,
                    }));
                    if (!isEditing) setIsEditing(true);
                }
            };
            reader.readAsDataURL(file);
        },
        [isEditing, showToast],
    );

    const handleSaveProfile = useCallback(async () => {
        if (!profile || !currentUserId) {
            showToast("No profile data available", "destructive");
            return;
        }

        if (!isEditing) {
            showToast("No changes to save", "default");
            return;
        }

        try {
            setIsSaving(true);

            // BAYARAN UTAMA: Pastikan semua data dikirim dengan benar
            const updateData: any = {
                username: formData.username.trim() || "", // Trim whitespace
                bio: formData.bio.trim() || "", // Trim whitespace
            };

            // Walaupun disabled, tetap kirim name dan email
            updateData.name = formData.name || "";
            updateData.email = formData.email || "";

            // Kirim photo jika ada file baru
            if (formData.photoFile) {
                updateData.photo = formData.photoFile;
            }

            console.log("📤 Sending update data:", {
                username: updateData.username,
                bio: updateData.bio,
                hasPhoto: !!updateData.photo,
            });

            const response = await profileApi.updateProfile(
                currentUserId,
                updateData,
            );

            if (response.data) {
                const updatedProfile = {
                    ...profile,
                    ...response.data,
                    updated_at: new Date().toISOString(),
                };

                setProfile(updatedProfile);

                // Update photo URL jika ada photo baru
                let photoUrl = "/images/avatar.svg";
                let photoPath = "";

                if (
                    response.data.photo &&
                    response.data.photo !== "null" &&
                    response.data.photo !== "undefined"
                ) {
                    photoPath = response.data.photo;
                    photoUrl = profileApi.getProfilePhotoUrl(photoPath);

                    // Simpan photo path dan URL di localStorage
                    localStorage.setItem("userPhoto", photoUrl);
                }

                setFormData((prev) => ({
                    ...prev,
                    name: updatedProfile.name || "",
                    email: updatedProfile.email || "",
                    username: updatedProfile.username || "",
                    bio: updatedProfile.bio || "",
                    photo: photoUrl,
                    photoFile: null,
                }));

                // Update cache di SEMUA bagian localStorage
                localStorage.setItem(
                    "userProfile",
                    JSON.stringify(updatedProfile),
                );
                localStorage.setItem("userPhoto", photoUrl);
                localStorage.setItem("userBio", updatedProfile.bio || "");
                localStorage.setItem(
                    "userUsername",
                    updatedProfile.username || "",
                );

                setIsEditing(false);
                showToast("Profile updated successfully", "success");

                // Force reload dari server setelah 1 detik
                setTimeout(() => {
                    loadProfile();
                }, 1000);
            } else {
                throw new Error(response.message || "Failed to update profile");
            }
        } catch (error: any) {
            console.error("❌ Update error:", error);
            showToast(error.message || "Failed to save profile", "destructive");
        } finally {
            setIsSaving(false);
        }
    }, [profile, isEditing, formData, currentUserId, showToast, loadProfile]);

    const handleCancelEdit = useCallback(() => {
        if (profile) {
            let photoUrl = "/images/avatar.svg";
            if (
                profile.photo &&
                profile.photo !== "null" &&
                profile.photo !== "undefined"
            ) {
                photoUrl = profileApi.getProfilePhotoUrl(profile.photo);
            }

            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                username: profile.username || "",
                bio: profile.bio || "",
                photo: photoUrl,
                photoFile: null,
            });
        }
        setIsEditing(false);
    }, [profile]);

    useEffect(() => {
        loadProfile();
    }, []);

    return {
        profile,
        isLoading,
        formData,
        isEditing,
        isSaving,
        lastPasswordUpdate: getPasswordLastUpdated(),
        toastProps,
        showToast,
        handleInputChange,
        handlePhotoUpload,
        handleSaveProfile,
        handleCancelEdit,
        updateLastPasswordTime,
        loadProfile,
    };
}
