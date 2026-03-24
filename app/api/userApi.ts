// api/userApi.ts (tambahkan method getCurrentProfile)
import { client } from "./client";
import type {
    ChangePasswordRequest,
    ChangePasswordResponse,
    ProfileResponse,
} from "./types";

export const userApi = {
    // Change password
    changePassword: async (
        data: ChangePasswordRequest,
    ): Promise<ChangePasswordResponse> => {
        try {
            const response = await client.put<ChangePasswordResponse>(
                "/user/change-password",
                data,
            );

            return response.data;
        } catch (error: any) {
            console.error("❌ Change password error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });

            throw {
                code: error.response?.status || 500,
                status: "error",
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Change password failed",
                data: error.response?.data,
            };
        }
    },

    /**
     * Get current user profile
     * GET /api/v1/user/profile
     */
    getCurrentProfile: async (): Promise<ProfileResponse> => {
        try {
            const response = await client.get<ProfileResponse>("/user/profile");

            return response.data;
        } catch (error: any) {
            console.error("❌ Get current profile error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });

            throw {
                code: error.response?.status || 500,
                status: "error",
                message:
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to fetch profile",
                data: error.response?.data,
            };
        }
    },

    /**
     * Create new user
     * POST /api/v1/admin/register
     */
    /**
     * Create Mahasiswa
     * POST /api/admin/create-mahasiswa
     */
    createMahasiswa: async (data: any): Promise<any> => {
        try {
            const response = await client.post("/admin/create-mahasiswa", data);
            return response.data;
        } catch (error: any) {
            console.error("❌ Create Mahasiswa error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Create Dosen
     * POST /api/admin/create-dosen
     */
    createDosen: async (data: any): Promise<any> => {
        try {
            const response = await client.post("/admin/create-dosen", data);
            return response.data;
        } catch (error: any) {
            console.error("❌ Create Dosen error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Get all users
     * GET /api/v1/admin/users
     */
    getAllUsers: async (): Promise<any> => {
        try {
            const response = await client.get("/admin/users");
            return response.data;
        } catch (error: any) {
             console.error("❌ Get all users error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Get users by role
     * GET /api/v1/admin/users-role?role=...
     */
    getUsersByRole: async (role: string): Promise<any> => {
        try {
            const response = await client.get(`/admin/users-role?role=${role}`);
            return response.data;
        } catch (error: any) {
             console.error("❌ Get users by role error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Get user by ID
     * GET /api/v1/admin/:id
     */
    getUserById: async (id: string): Promise<any> => {
        try {
            const response = await client.get(`/admin/${id}`);
            return response.data;
        } catch (error: any) {
             console.error("❌ Get user by ID error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Update user role
     * PUT /api/v1/admin/:id
     */
    updateUserRole: async (id: string, role: string): Promise<any> => {
        try {
            const response = await client.put(`/admin/${id}`, { role });
            return response.data;
        } catch (error: any) {
             console.error("❌ Update user role error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },

    /**
     * Delete user
     * DELETE /api/v1/admin/:id
     */
    deleteUser: async (id: string): Promise<any> => {
        try {
            const response = await client.delete(`/admin/${id}`);
            return response.data;
        } catch (error: any) {
             console.error("❌ Delete user error:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
            throw error;
        }
    },
};
