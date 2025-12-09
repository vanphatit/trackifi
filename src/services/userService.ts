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

  // Đổi mật khẩu
  static async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await apiClient.patch("/api/user/profile/password", {
        currentPassword,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message || "Đổi mật khẩu thành công",
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Đổi mật khẩu thất bại",
      };
    }
  }

  // Vô hiệu hoá tài khoản
  static async deactivateAccount(reason?: string) {
    try {
      const response = await apiClient.delete("/api/user/profile", {
        data: reason ? { reason } : undefined,
      });
      return {
        success: true,
        message: response.data.message || "Tài khoản đã được vô hiệu hoá",
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Vô hiệu hoá thất bại",
      };
    }
  }
}
