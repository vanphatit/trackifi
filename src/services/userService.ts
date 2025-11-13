import apiClient from "../api/config";
import type { User } from "./authService";

export interface UserResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export class UserService {
  // Lấy profile
  static async getProfile(): Promise<UserResponse> {
    try {
      const response = await apiClient.get("/api/user/profile");
      return {
        success: true,
        user: response.data.data.user,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Lấy thông tin thất bại",
      };
    }
  }

  // Cập nhật profile
  static async updateProfile(userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await apiClient.put("/api/user/profile", userData);
      return {
        success: true,
        user: response.data.data.user,
        message: response.data.message,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Cập nhật thất bại",
      };
    }
  }
}
