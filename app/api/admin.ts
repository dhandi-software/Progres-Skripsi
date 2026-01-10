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
};
