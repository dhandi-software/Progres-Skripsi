import type { LoginCredentials, LoginResponse } from "~/types/auth";
import { client } from "~/api/client";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await client.post("/auth/login", credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await client.post("/auth/logout").catch(err => console.error("Logout request failed:", err));
  },
  
  async checkEmail(email: string): Promise<{ userId: number, role: string, message: string }> {
      const response = await client.post("/auth/check-email", { email });
      return response.data;
  },

  async resetPassword(userId: number, newPassword: string): Promise<{ message: string }> {
      const response = await client.post("/auth/reset-password", { userId, newPassword });
      return response.data;
  },
};
