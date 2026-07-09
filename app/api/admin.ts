import { client } from "./client";

// Base response wrapper type
interface ApiResponse<T> {
    code: number;
    status: string;
    message: string;
    data: T;
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
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
    getUsersByRole: async (role: string, page: number = 1, limit: number = 10, search: string = ''): Promise<ApiResponse<any[]>> => {
        const response = await client.get<ApiResponse<any[]>>(`/admin/users-role`, {
            params: { role, page, limit, search }
        });
        return response.data;
    },

    /**
     * Get monitoring data
     * GET /admin/monitoring
     */
    getMonitoringData: async (search?: string, statusBimbingan?: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ data: any[], meta: { total: number, page: number, totalPages: number } }>> => {
        const response = await client.get<ApiResponse<{ data: any[], meta: { total: number, page: number, totalPages: number } }>>("/admin/monitoring", {
            params: { search, statusBimbingan, page, limit }
        });
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
    deleteUser: async (id: string | number, force: boolean = false): Promise<ApiResponse<any>> => {
        const url = force ? `/admin/users/${id}?force=true` : `/admin/users/${id}`;
        const response = await client.delete<ApiResponse<any>>(url);
        return response.data;
    },

    /**
     * Delete users in batch
     * POST /admin/users/batch-delete
     */
    deleteUsersBatch: async (ids: number[]): Promise<ApiResponse<any>> => {
        const response = await client.post<ApiResponse<any>>("/admin/users/batch-delete", { ids });
        return response.data;
    },

    /**
     * Clear all mahasiswa users
     * POST /admin/users/mahasiswa/clear-all
     */
    clearAllMahasiswa: async (forceAll: boolean = false): Promise<ApiResponse<any>> => {
        const response = await client.post<ApiResponse<any>>("/admin/users/mahasiswa/clear-all", { forceAll });
        return response.data;
    },

    /**
     * Clear all dosen users
     * POST /admin/users/dosen/clear-all
     */
    clearAllDosen: async (forceAll: boolean = false): Promise<ApiResponse<any>> => {
        const response = await client.post<ApiResponse<any>>("/admin/users/dosen/clear-all", { forceAll });
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

    /**
     * Get students without proposal
     * GET /admin/mahasiswa-tanpa-pengajuan
     */
    getMahasiswaTanpaPengajuan: async (search?: string): Promise<ApiResponse<any[]>> => {
        const params = search ? { search } : {};
        const response = await client.get<ApiResponse<any[]>>("/admin/mahasiswa-tanpa-pengajuan", { params });
        return response.data;
    },

    /**
     * Get students with proposal
     * GET /admin/mahasiswa-sudah-pengajuan
     */
    getMahasiswaSudahPengajuan: async (search?: string): Promise<ApiResponse<any[]>> => {
        const params = search ? { search } : {};
        const response = await client.get<ApiResponse<any[]>>("/admin/mahasiswa-sudah-pengajuan", { params });
        return response.data;
    },
};
