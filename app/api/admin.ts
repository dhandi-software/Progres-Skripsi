import { client } from "./client";

// Base response wrapper type
interface ApiResponse<T> {
    code: number;
    status: string;
    message: string;
    data: T;
}

export interface CountResponse {
    object: string;
    type: string;
    count: number;
}

export const adminApi = {
    /**
     * Get count of users by role
     * GET /admin/users/count?role=admin|writer|editor
     */
    getUserCountByRole: async (role?: string): Promise<ApiResponse<CountResponse>> => {
        const params = role ? { role } : {};
        const response = await client.get<ApiResponse<CountResponse>>("/admin/users/count", { params });
        return response.data;
    },

    /**
     * Get users by role
     * GET /admin/users-role?role=...
     */
    getUsersByRole: async (role: string): Promise<ApiResponse<any[]>> => {
        const response = await client.get<ApiResponse<any[]>>(`/admin/users-role?role=${role}`);
        return response.data;
    },

    /**
     * Get monitoring data
     * GET /admin/monitoring
     */
    getMonitoringData: async (): Promise<ApiResponse<any[]>> => {
        const response = await client.get<ApiResponse<any[]>>("/admin/monitoring");
        return response.data;
    },

    /**
     * Update user
     * PUT /admin/users/:id
     */
    updateUser: async (id: string | number, data: any): Promise<ApiResponse<any>> => {
        const response = await client.put<ApiResponse<any>>(`/admin/users/${id}`, data);
        return response.data;
    },

    /**
     * Delete user
     * DELETE /admin/users/:id
     */
    deleteUser: async (id: string | number): Promise<ApiResponse<any>> => {
        const response = await client.delete<ApiResponse<any>>(`/admin/users/${id}`);
        return response.data;
    },

    /**
     * Get user by ID
     * GET /admin/users/:id
     */
    getUserById: async (id: string | number): Promise<ApiResponse<any>> => {
        const response = await client.get<ApiResponse<any>>(`/admin/users/${id}`);
        return response.data;
    },

    /**
     * Get dashboard stats
     * GET /admin/dashboard-stats
     */
     getDashboardStats: async (): Promise<ApiResponse<any>> => {
        const response = await client.get<ApiResponse<any>>("/admin/dashboard-stats");
        return response.data;
    },
};
