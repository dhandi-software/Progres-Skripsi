import { client } from "./client";
import type { NewsCategoriesResponse } from "./types";

interface CategoryListResponse {
    code: number;
    status: string;
    message: string;
    data: NewsCategoriesResponse[];
}

export const categoryApi = {
    /**
     * Get list of all categories
     * GET /category/
     */
    getCategories: async (): Promise<CategoryListResponse> => {
        const response = await client.get<CategoryListResponse>("/category/");
        return response.data;
    },
};
