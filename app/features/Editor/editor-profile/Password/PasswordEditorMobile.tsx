import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";
import { usePassword } from "~/context/PasswordContext";
import { cn } from "~/lib/utils";

interface PasswordEditorMobileProps {
    onClose: () => void;
    onPasswordChange?: () => void;
    onPasswordError?: (message: string) => void;
}

export default function PasswordEditorMobile({
    onClose,
    onPasswordChange,
    onPasswordError,
}: PasswordEditorMobileProps) {
    const {
        isChangingPassword,
        changePassword,
        resetPasswordState,
    } = usePassword();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const passwordRequirements = [
        {
            id: 1,
            text: "Consists of at least 8 characters.",
            validator: (pwd: string) => pwd.length >= 8,
        },
        {
            id: 2,
            text: "First uppercase letters (A-Z) and one lowercase (a-z).",
            validator: (pwd: string) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
        },
        {
            id: 3,
            text: "Contains at least one number (0-9).",
            validator: (pwd: string) => /\d/.test(pwd),
        },
        {
            id: 4,
            text: "Contains at least one symbol (!, @, #, etc).",
            validator: (pwd: string) => /[!@#$%&*]/.test(pwd),
        },
    ];

    const handleConfirmChangePassword = async () => {
        setPasswordError("");

        const allRequirementsMet = passwordRequirements.every((req) =>
            req.validator(newPassword),
        );

        if (!allRequirementsMet) {
            const errorMessage = "Please fulfill all password requirements";
            setPasswordError(errorMessage);
            return;
        }

        if (newPassword !== confirmPassword) {
            const errorMessage = "The password entered does not match";
            setPasswordError(errorMessage);
            return;
        }

        if (!currentPassword) {
            const errorMessage = "Please enter your current password";
            setPasswordError(errorMessage);
            return;
        }

        try {
            const response = await changePassword({
                old_password: currentPassword,
                new_password: newPassword,
            });

            if (response.code === 200) {
                // Close modal immediately and show toast via callback
                onClose();
                resetPasswordState();
                if (onPasswordChange) onPasswordChange();
            } else {
                const errorMessage = response.message || "Failed to change password";
                setPasswordError(errorMessage);
                if (onPasswordError) onPasswordError(errorMessage);
            }
        } catch (error: any) {
            const errorMessage = error.message || "Failed to change password";
            setPasswordError(errorMessage);
            if (onPasswordError) onPasswordError(errorMessage);
        }
    };

    const isAllFieldsFilled =
        currentPassword.length > 0 &&
        newPassword.length > 0 &&
        confirmPassword.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative bg-white rounded-2xl w-[calc(100%-48px)] max-w-[400px] max-h-[90vh] overflow-hidden shadow-xl mx-6">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#F4F4F5]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#0D0D12]">Change Password</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-[#71717A]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Current Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#0D0D12]">Current Password</label>
                        <div className="relative">
                            <TextField
                                variant="vertical"
                                type={showCurrentPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                inputClassName="rounded-lg h-10 border-[#E5E7EB] focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24] pr-10"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="text-[#71717A] hover:text-[#0D0D12]"
                                    >
                                        {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#0D0D12]">New Password</label>
                        <div className="relative">
                            <TextField
                                variant="vertical"
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                inputClassName="rounded-lg h-10 border-[#E5E7EB] focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24] pr-10"
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="text-[#71717A] hover:text-[#0D0D12]"
                                    >
                                        {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="flex flex-col gap-2 bg-[#FAFAFA] rounded-lg p-3">
                        <p className="text-xs font-medium text-[#71717A] uppercase tracking-wider">Requirements</p>
                        <div className="flex flex-col gap-1.5">
                            {passwordRequirements.map((req) => {
                                const isMet = req.validator(newPassword);
                                return (
                                    <div key={req.id} className="flex items-center gap-2">
                                        {isMet ? (
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <X className="w-3.5 h-3.5 text-[#A1A1A1]" />
                                        )}
                                        <span className={cn(
                                            "text-xs",
                                            isMet ? "text-[#0D0D12]" : "text-[#71717A]"
                                        )}>{req.text}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#0D0D12]">Confirm Password</label>
                        <div className="relative">
                            <TextField
                                variant="vertical"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setPasswordError("");
                                }}
                                error={!!passwordError}
                                inputClassName={`rounded-lg h-10 pr-10 ${passwordError ? 'border-[#E0533D] ring-[3px] ring-[#FFC9C9]/60' : 'border-[#E5E7EB]'} focus:border-[#D94F24] focus:ring-1 focus:ring-[#D94F24]`}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="text-[#71717A] hover:text-[#0D0D12]"
                                    >
                                        {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                }
                            />
                        </div>
                        {passwordError && (
                            <p className="text-xs text-[#E0533D] font-medium">{passwordError}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#F4F4F5] flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="w-20 h-9 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-white text-[#0A0A0A] font-medium text-xs shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmChangePassword}
                        disabled={!isAllFieldsFilled || isChangingPassword}
                        className="w-[100px] h-9 px-3 py-2 rounded-lg bg-[#FFB86A] text-white font-medium text-xs shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-[#FFB86A]/90 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {isChangingPassword ? "Saving..." : "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
