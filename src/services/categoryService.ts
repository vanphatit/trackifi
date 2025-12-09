import apiClient from "../api/config";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data?: Category;
}

export const CategoryService = {
  // Public APIs
  getCategories: async (): Promise<CategoryListResponse> => {
    try {
      const response = await apiClient.get("/api/categories");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // Admin/Supporter APIs
  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.post("/api/categories", data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateCategory: async (id: number, data: UpdateCategoryData): Promise<CategoryResponse> => {
    try {
      const response = await apiClient.put(`/api/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/api/categories/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
