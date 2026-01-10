// features/writer/edit-profile/Password/PasswordDesktop.tsx
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TextField } from "~/components/ui/TextField";

interface PasswordDesktopProps {
    onClose: () => void;
    onPasswordChange: () => void;
    onPasswordError: (message: string) => void;
}

export default function PasswordEditorDesktop({
    onClose,
    onPasswordChange,
    onPasswordError,
}: PasswordDesktopProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const popupRef = useRef<HTMLDivElement>(null);

    // Requirements checklist
    const passwordRequirements = [
        {
            id: 1,
            text: "Consists of at least 8 characters.",
            validator: (pwd: string) => pwd.length >= 8,
        },
        {
            id: 2,
            text: "Contains uppercase letters (A-Z) and one lowercase letter (a-z).",
            validator: (pwd: string) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
        },
        {
            id: 3,
            text: "Contains at least one number (0-9).",
            validator: (pwd: string) => /\d/.test(pwd),
        },
        {
            id: 4,
            text: "Contains at least one symbol (e.g., !, @, #, $, %, &, *).",
            validator: (pwd: string) => /[!@#$%&*]/.test(pwd),
        },
    ];

    // Handle click outside to close popup
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleConfirmChangePassword = () => {
        // Validasi semua requirement terpenuhi
        const allRequirementsMet = passwordRequirements.every((req) =>
            req.validator(newPassword),
        );

        if (!allRequirementsMet) {
            const errorMessage = "Please fulfill all password requirements";
            setPasswordError(errorMessage);
            onPasswordError(errorMessage);
            return;
        }

        // Validasi konfirmasi password
        if (newPassword !== confirmPassword) {
            const errorMessage = "The password entered does not match";
            setPasswordError(errorMessage);
            onPasswordError(errorMessage);
            return;
        }

        // Validasi current password tidak kosong
        if (!currentPassword) {
            const errorMessage = "Please enter your current password";
            setPasswordError(errorMessage);
            onPasswordError(errorMessage);
            return;
        }

        // Jika semua validasi berhasil, panggil callback success
        onPasswordChange();
        onClose();
    };

    const handleCancelChangePassword = () => {
        onClose();
    };

    // Check jika semua field sudah diisi (tidak perlu validasi ketat untuk enable button)
    const isAllFieldsFilled =
        currentPassword.length > 0 &&
        newPassword.length > 0 &&
        confirmPassword.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            {/* Popup Container */}
            <div
                ref={popupRef}
                className="w-fit h-fit gap-md px-6 py-6 rounded-md bg-background border border-border-subtle"
            >
                {/* Container Change password */}
                <div className="w-full h-fit flex flex-col gap-lg">
                    {/* Container Text & Button */}
                    <div className="w-full h-fit flex justify-center items-start ">
                        <h2 className="w-fit h-fit text-subheading-h5 text-foreground">
                            Change Password
                        </h2>
                    </div>

                    {/* Current Password */}
                    <TextField
                        variant="vertical"
                        size="sm"
                        label="Current Password"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {showCurrentPassword ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                        }
                        className="w-[32.188rem]"
                    />

                    {/* New Password */}
                    <TextField
                        variant="vertical"
                        size="sm"
                        label="New Password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {showNewPassword ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                        }
                        className="w-[32.188rem]"
                    />

                    {/* Requirements */}
                    <div className="w-full h-fit flex flex-col gap-2">
                        <h3 className="text-label text-foreground">
                            Requirements
                        </h3>
                        {passwordRequirements.map((requirement) => {
                            const isMet = requirement.validator(newPassword);
                            return (
                                <div
                                    key={requirement.id}
                                    className="w-fit h-fit flex items-center gap-2"
                                >
                                    <div
                                        className={`
                                            w-4 h-4    flex items-center justify-center flex-shrink-0 
                                        `}
                                    >
                                        {isMet ? (
                                            <Check className="w-fit h-fit text-accent-success-foreground" />
                                        ) : (
                                            <X className="w-fit h-fit text-destructive" />
                                        )}
                                    </div>
                                    <span
                                        className={`
                                            text-caption-sm w-fit h-fit
                                            ${isMet ? "text-foreground" : "text-black/60"}
                                        `}
                                    >
                                        {requirement.text}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Confirm Password */}
                    <TextField
                        variant="vertical"
                        size="sm"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                        }}
                        error={!!passwordError}
                        errorMessage={passwordError}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                {showConfirmPassword ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                        }
                        className="w-[32.188rem]"
                    />

                    {/* Container Button */}
                    <div className="w-full h-fit gap-4 flex justify-end items-start">
                        {/* Button Cancel */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelChangePassword}
                            className="w-fit h-10 px-3 py-2 flex-shrink-0"
                        >
                            Cancel
                        </Button>

                        {/* Button Confirm Password - Selalu enabled */}
                        <Button
                            variant={isAllFieldsFilled ? "default" : "outline"}
                            size="sm"
                            onClick={handleConfirmChangePassword}
                            className={`w-fit h-10 gap-2 px-3 py-2 rounded-md shadow-xs flex-shrink-0 ${!isAllFieldsFilled
                                    ? "bg-[#F4F4F5] text-muted-foreground border-border-subtle"
                                    : ""
                                }`}
                        >
                            Confirm new password
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
