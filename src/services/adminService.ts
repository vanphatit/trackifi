import apiClient from "../api/config";
import type { User } from "./authService";

export interface DashboardStats {
  revenue: number;
  orders: {
    total: number;
    pending: number;
  };
  users: {
    total: number;
  };
  products: {
    lowStock: number;
  };
}

export interface DashboardStatsResponse {
  success: boolean; // Assuming wrapper
  data: DashboardStats;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const AdminService = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    try {
      const response = await apiClient.get("/api/admin/stats/dashboard");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getUsers: async (params?: UserQueryParams): Promise<UserListResponse> => {
    try {
      const response = await apiClient.get("/api/admin/users", { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateUserRole: async (userId: number, roleId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.patch(`/api/admin/users/${userId}/role`, { roleId });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
