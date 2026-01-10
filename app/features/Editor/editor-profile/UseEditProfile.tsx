import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useProfile } from "~/hooks/useProfile";
import { authApi } from "~/api/auth";

export function useEditProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoadingUser(true);
        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          setIsLoadingUser(false);
          return;
        }

        const user = await authApi.me();
        if (user && user.id) {
          setUserId(user.id);
          localStorage.setItem("userId", user.id);
        } else {
          throw new Error("Failed to get user ID");
        }
      } catch (error) {
        const token = localStorage.getItem("jwt");
        if (token) {
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
              window.atob(base64).split("").map((c) => {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              }).join("")
            );
            const payload = JSON.parse(jsonPayload);
            const userIdFromToken = payload.sub || payload.id || payload.user_id;

            if (userIdFromToken) {
              setUserId(userIdFromToken);
              localStorage.setItem("userId", userIdFromToken);
            }
          } catch (tokenError) {
            console.error("Failed to decode token");
          }
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const profileHook = useProfile(userId || undefined);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      profileHook.handlePhotoUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangePassword = () => {
    setShowChangePasswordPopup(true);
  };

  const handlePasswordChangeSuccess = () => {
    profileHook.updateLastPasswordTime();
    setShowChangePasswordPopup(false);
    profileHook.showToast("Password successfully changed.", "success");
  };

  const handlePasswordError = (errorMessage: string) => {
    profileHook.showToast(errorMessage, "destructive");
  };

  return {
    states: {
      userId,
      isLoadingUser,
      showChangePasswordPopup,
      profile: profileHook.profile,
      isLoadingProfile: profileHook.isLoading,
      formData: profileHook.formData,
      isEditing: profileHook.isEditing,
      isSaving: profileHook.isSaving,
      toastProps: profileHook.toastProps,
      lastPasswordUpdate: profileHook.lastPasswordUpdate,
    },
    setters: {
      setShowChangePasswordPopup,
      showToast: profileHook.showToast,
    },
    handlers: {
      handleInputChange: profileHook.handleInputChange,
      handlePhotoUpload: profileHook.handlePhotoUpload,
      handleAvatarChange,
      handleSaveProfile: profileHook.handleSaveProfile,
      handleCancelEdit: profileHook.handleCancelEdit,
      handleChangePassword,
      handlePasswordChangeSuccess,
      handlePasswordError,
    },
    refs: {
      fileInputRef,
    }
  };
}
