import { Camera, Loader2, Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { Toast } from "~/components/ui/toast";
import { useSidebar } from "~/components/ui/sidebar";
import { PasswordMobile } from "./components";
import { useEditProfile } from "./UseEditProfile";

export default function EditProfileMobile() {
    const { setOpenMobile } = useSidebar();

    const {
        states: {
            isLoadingUser,
            isLoadingProfile,
            userId,
            profile,
            formData,
            isSaving,
            isEditing,
            toastProps,
            lastPasswordUpdate,
            showChangePasswordPopup
        },
        setters: {
            setShowChangePasswordPopup,
            showToast
        },
        handlers: {
            handleInputChange,
            handleAvatarChange,
            handleSaveProfile,
            handleCancelEdit,
            handleChangePassword,
            handlePasswordChangeSuccess,
            handlePasswordError
        },
        refs: {
            fileInputRef
        }
    } = useEditProfile();

    const bioCharCount = formData.bio.length;

    if (isLoadingUser || isLoadingProfile) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#D94F24] animate-spin mb-4" />
                <p className="text-sm text-[#71717A] font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
                <h1 className="text-xl font-bold text-[#0D0D12] mb-2">Access Denied</h1>
                <p className="text-sm text-[#71717A] mb-6">Please login to access your profile settings.</p>
                <Button className="bg-[#D94F24] text-white rounded-xl px-8">Login</Button>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col font-geist">
            {/* Header Section */}
            <div className="px-6 mb-6 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setOpenMobile(true)}
                        className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-[#0D0D12]" />
                    </button>
                    <h1 className="text-[1.5rem] font-bold text-[#0D0D12]">
                        Editing Profile
                    </h1>
                </div>
                <p className="text-[0.875rem] text-[#71717A] font-medium pl-9 leading-relaxed">
                    Manage writer profile information.
                </p>
            </div>

            <div className="flex-1 overflow-auto px-6 flex flex-col gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 p-6 bg-[#FAFAFA] rounded-2xl border border-[#F4F4F5]">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-lg ring-1 ring-black/5">
                            <img
                                src={formData.photo || "/images/avatar.svg"}
                                alt="Profile avatar"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e: any) => {
                                    e.currentTarget.src = "/images/avatar.svg";
                                }}
                            />
                            {isSaving && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-[#D94F24] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-transform"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center gap-1">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                        />
                        <p className="text-xs font-semibold text-[#0D0D12]">Change Profile Photo</p>
                        <p className="text-[0.6875rem] text-[#71717A]">JPG, PNG or WebP • Max 5MB</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-5">
                    {/* Role Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[#71717A] uppercase tracking-wider">Role</label>
                        <div className="w-full h-12 px-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl flex items-center">
                            <span className="text-sm text-[#71717A] font-medium capitalize">
                                {profile?.role || "Writer"}
                            </span>
                        </div>
                    </div>

                    {/* Full Name Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[#71717A] uppercase tracking-wider">Full Name</label>
                        <div className="w-full h-12 px-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl flex items-center">
                            <span className="text-sm text-[#71717A] font-medium">
                                {formData.name || "Your full name"}
                            </span>
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[#0D0D12] uppercase tracking-wider">Email</label>
                        <TextField
                            variant="vertical"
                            placeholder="johndoe@gmail.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={isSaving}
                            inputClassName="rounded-xl h-12 border-[#E5E7EB] focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24]"
                        />
                    </div>

                    {/* Username Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-[#0D0D12] uppercase tracking-wider">Username</label>
                        <TextField
                            variant="vertical"
                            placeholder="username"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            disabled={isSaving}
                            inputClassName="rounded-xl h-12 border-[#E5E7EB] focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24]"
                        />
                    </div>

                    {/* Bio Field */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-[#0D0D12] uppercase tracking-wider">Bio</label>
                            <span className="text-[0.6875rem] font-medium text-[#71717A]">{bioCharCount}/100</span>
                        </div>
                        <TextField
                            variant="vertical"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={(e) => handleInputChange("bio", e.target.value)}
                            multiline={true}
                            disabled={isSaving}
                            inputClassName="rounded-xl h-32 border-[#E5E7EB] focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24] p-4 resize-none"
                        />
                    </div>

                    {/* Change Password Trigger */}
                    <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#F4F4F5] flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold text-[#0D0D12]">Security</p>
                            <p className="text-[0.6875rem] text-[#71717A] font-medium">{lastPasswordUpdate}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleChangePassword}
                            className="rounded-lg border-[#D94F24] text-[#D94F24] hover:bg-[#D94F24]/5 h-9 font-semibold text-xs px-4"
                        >
                            Change Password
                        </Button>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 mt-4 pb-6">
                    <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={!isEditing || isSaving}
                        className="w-20 h-9 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#0A0A0A] font-medium text-xs shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveProfile}
                        disabled={!isEditing || isSaving}
                        className="w-[100px] h-9 px-3 py-2 rounded-lg bg-[#FFB86A] text-white font-medium text-xs shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[#FFB86A]/90 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </div>
            </div>

            {/* Overlays */}
            {showChangePasswordPopup && (
                <PasswordMobile
                    onClose={() => setShowChangePasswordPopup(false)}
                    onPasswordChange={handlePasswordChangeSuccess}
                    onPasswordError={handlePasswordError}
                />
            )}

            {toastProps && (
                <div className="fixed bottom-8 left-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => showToast("")}
                        className="shadow-2xl border border-gray-100"
                    />
                </div>
            )}
        </div>
    );
}
