// context/PasswordContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { userApi } from "~/api/userApi";
import type {
    ChangePasswordRequest,
    ChangePasswordResponse,
} from "~/api/types";

export interface PasswordValidation {
    isLengthValid: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
    isAllValid: boolean;
}

export interface PasswordContextType {
    isChangingPassword: boolean;
    changePassword: (
        data: ChangePasswordRequest,
    ) => Promise<ChangePasswordResponse>;
    validatePassword: (password: string) => PasswordValidation;
    resetPasswordState: () => void;
}

const defaultContextValue: PasswordContextType = {
    isChangingPassword: false,
    changePassword: async (data) => {
        console.warn("PasswordProvider not found, using default");
        return userApi.changePassword(data);
    },
    validatePassword: (password: string): PasswordValidation => {
        const validation = {
            isLengthValid: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSymbol: /[!@#$%&*]/.test(password),
        };

        return {
            ...validation,
            isAllValid: Object.values(validation).every(Boolean),
        };
    },
    resetPasswordState: () => {},
};

const PasswordContext = createContext<PasswordContextType>(defaultContextValue);

interface PasswordProviderProps {
    children: React.ReactNode;
}

export const PasswordProvider: React.FC<PasswordProviderProps> = ({
    children,
}) => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Function untuk validasi password
    const validatePassword = useCallback(
        (password: string): PasswordValidation => {
            const validation = {
                isLengthValid: password.length >= 8,
                hasUpperCase: /[A-Z]/.test(password),
                hasLowerCase: /[a-z]/.test(password),
                hasNumber: /\d/.test(password),
                hasSymbol: /[!@#$%&*]/.test(password),
            };

            return {
                ...validation,
                isAllValid: Object.values(validation).every(Boolean),
            };
        },
        [],
    );

    // Function untuk change password
    const changePassword = async (
        data: ChangePasswordRequest,
    ): Promise<ChangePasswordResponse> => {
        setIsChangingPassword(true);

        try {
            // Validasi password baru
            const validation = validatePassword(data.new_password);
            if (!validation.isAllValid) {
                throw {
                    code: 400,
                    status: "error",
                    message: "New password does not meet requirements",
                };
            }

            // Kirim request ke API
            const response = await userApi.changePassword(data);

            setIsChangingPassword(false);
            return response;
        } catch (error: any) {
            setIsChangingPassword(false);

            // Format error yang konsisten
            const formattedError: ChangePasswordResponse = {
                code: error.code || 500,
                status: error.status || "error",
                message: error.message || "Change password failed",
                data: error.data,
            };

            throw formattedError;
        }
    };

    // Reset state
    const resetPasswordState = () => {
        setIsChangingPassword(false);
    };

    const value: PasswordContextType = {
        isChangingPassword,
        changePassword,
        validatePassword,
        resetPasswordState,
    };

    return (
        <PasswordContext.Provider value={value}>
            {children}
        </PasswordContext.Provider>
    );
};

export const usePassword = () => {
    const context = useContext(PasswordContext);

    if (context === defaultContextValue) {
        console.warn(
            "⚠️ PasswordProvider not found in tree. Using default context. " +
                "Make sure to wrap your app with <PasswordProvider>",
        );
    }

    return context;
};
