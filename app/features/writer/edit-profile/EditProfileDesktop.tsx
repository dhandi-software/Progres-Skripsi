import { Camera, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { Toast } from "~/components/ui/toast";
import { PasswordDesktop } from "./components";
import { useEditProfile } from "./UseEditProfile";

export default function EditProfileDesktop() {
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
            <div className="w-full h-fit flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#D94F24] animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="w-full h-fit flex flex-col items-center justify-center py-20">
                <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
                <p className="text-sm text-muted-foreground mb-6">Please login to access your profile settings.</p>
                <Button className="bg-[#D94F24] text-white rounded-md px-8">Login</Button>
            </div>
        );
    }

    return (
        <div className="w-full h-fit flex flex-col gap-8 px-6 pt-6 pb-15">
            {/* Header Section */}
            <div className="w-full h-fit flex flex-col gap-3">
                <h1 className="w-full h-fit text-subheading-h2 text-foreground">
                    Editing profile
                </h1>
                <p className="w-full h-fit text-label text-black/60">
                    Manage writer profile information.
                </p>
            </div>

            {/* Profile Avatar Section */}
            <div className="w-fit h-fit flex items-center gap-6">
                {/* Avatar Container */}
                <div className="w-17 h-17 rounded-full overflow-hidden border-2 border-border-subtle relative">
                    <img
                        src={formData.photo || "/images/avatar.svg"}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                            e.currentTarget.src = "/images/avatar.svg";
                        }}
                    />
                    {isSaving && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                    )}
                </div>

                {/* Change Photo Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit h-8 px-4 py-2 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSaving}
                >
                    <Camera className="w-4 h-4" />
                    Change photo
                </Button>
            </div>

            {/* Role Field */}
            <div className="w-full h-fit flex flex-col gap-1">
                <div className="w-62 h-fit flex flex-col gap-2">
                    <label className="w-full h-fit text-label-lg text-foreground">
                        Role
                    </label>
                    <div className="w-full h-fit flex flex-col gap-2">
                        <div className="w-full h-9 px-4.5 py-2 bg-[#F4F4F5] border border-border-subtle rounded-md shadow-xs flex items-center">
                            <span className="w-full h-fit text-label text-muted-foreground capitalize">
                                {profile?.role || "Writer"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Name Field - DISABLED */}
            <div className="w-full h-fit flex flex-col gap-2">
                <label className="w-full h-fit text-label-lg text-foreground">
                    Name
                </label>
                <TextField
                    variant="vertical"
                    size="sm"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={true}
                    className="w-full bg-brand-secondary-muted border-border-subtle shadow-xs rounded-md"
                />
            </div>

            {/* Email Field */}
            <div className="w-full h-fit flex flex-col gap-2">
                <label className="w-full h-fit text-label-lg text-foreground">
                    Email
                </label>
                <TextField
                    variant="vertical"
                    size="sm"
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isSaving}
                    className="w-full"
                />
            </div>

            {/* Username Field */}
            <div className="w-full h-fit flex flex-col gap-2">
                <label className="w-full h-fit text-label-lg text-foreground">
                    Username
                </label>
                <TextField
                    variant="vertical"
                    size="sm"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isSaving}
                    className="w-full"
                />
            </div>

            {/* Bio Field dengan TextField */}
            <div className="w-full h-fit flex flex-col gap-2">
                <TextField
                    variant="vertical"
                    label="Bio"
                    size="sm"
                    placeholder="Add your bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={isSaving}
                    className="w-full"
                    inputClassName="h-37 resize-none"
                    multiline={true}
                />
                <div className="w-fit h-fit text-paragraph text-muted-foreground ml-auto">
                    {bioCharCount}/100
                </div>
            </div>

            {/* Password Section */}
            <div className="w-full h-fit gap-3 px-6 py-6 rounded-md border border-border-subtle">
                {/* Container form & button */}
                <div className="w-full h-fit flex items-center justify-between">
                    {/* Container field info */}
                    <div className="w-full h-fit">
                        {/* Field container */}
                        <div className="w-full h-fit gap-0.5">
                            {/* Password label */}
                            <div className="w-full h-6 text-label-lg text-foreground">
                                Password
                            </div>
                            {/* Last updated info */}
                            <div className="w-full h-6 text-paragraph-sm text-muted-foreground">
                                {lastPasswordUpdate}
                            </div>
                        </div>
                    </div>

                    {/* Change Password Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangePassword}
                        className="w-fit h-10 px-4 py-2 rounded-md border-border-subtle"
                    >
                        Change password
                    </Button>
                </div>
            </div>

            {/* Action Buttons - Di kanan */}
            <div className="w-full h-fit flex justify-end gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={!isEditing || isSaving}
                    className="w-20 h-10 px-4 py-2 bg-background shadow-xs rounded-md"
                >
                    Cancel
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={!isEditing || isSaving}
                    className="w-50 h-10 px-4 py-2 bg-[#FFB86A] text-background border-[#FFB86A] shadow-xs rounded-md hover:bg-[#FFB86A]/90 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </div>
                    ) : (
                        "Confirm"
                    )}
                </Button>
            </div>

            {/* Popup Change Password */}
            {showChangePasswordPopup && (
                <PasswordDesktop
                    onClose={() => setShowChangePasswordPopup(false)}
                    onPasswordChange={handlePasswordChangeSuccess}
                    onPasswordError={handlePasswordError}
                />
            )}

            {/* Toast Notification */}
            {toastProps && (
                <div className="fixed top-6 right-6 z-50">
                    <Toast
                        title={toastProps.title}
                        variant={toastProps.variant}
                        onClose={() => showToast("")}
                    />
                </div>
            )}
        </div>
    );
}
