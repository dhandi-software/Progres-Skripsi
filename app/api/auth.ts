import { client } from "./client";
import type { LoginRequest, LoginResponse, User } from "./types";

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await client.post<LoginResponse>("/auth/login", data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await client.post("/auth/logout");
    },

    me: async (): Promise<User> => {
        if (typeof window === "undefined" || typeof document === "undefined") {
            throw new Error("Cannot fetch user on server side");
        }

        const token = localStorage.getItem("jwt");
        if (!token) throw new Error("No token found");

        try {
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

            const user: User = {
                id: payload.sub || payload.id || payload.user_id,
                email: payload.email,
                role: payload.role,
                token: token,
            };

            if (!user.id) throw new Error("User ID not found in token");

            return user;
        } catch (e) {
            console.error("Failed to decode token or fetch user", e);
            throw e;
        }
    },

    refreshToken: async (token: string): Promise<{ token: string }> => {
        const response = await client.post("/refresh-token", { token });
        return response.data;
    },

    changePassword: async (data: { oldPassword: string, newPassword: string }) => {
        const response = await client.put("/auth/change-password", data);
        return response.data;
    }
};
