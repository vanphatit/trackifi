import apiClient from "../api/config";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: boolean;
  address?: string;
  roleId: string;
  isEmailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  gender: boolean;
  address?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  errorCode?: string;
}

export class AuthService {
  // Đăng ký
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/register", userData);

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        return {
          success: true,
          user: response.data.data.user,
          message: response.data.message,
        };
      }
      return { success: false, message: "Đăng ký thất bại" };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errorCode?: string } };
      };
      return {
        success: false,
        message: err.response?.data?.message || "Đăng ký thất bại",
        errorCode: err.response?.data?.errorCode,
      };
    }
  }

  // Đăng nhập
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        return {
          success: true,
          user: response.data.data.user,
          message: response.data.message,
        };
      }
      return { success: false, message: "Đăng nhập thất bại" };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errorCode?: string } };
      };
      return {
        success: false,
        message: err.response?.data?.message || "Đăng nhập thất bại",
        errorCode: err.response?.data?.errorCode,
      };
    }
  }

  // Đăng xuất
  static async logout(): Promise<{ success: boolean }> {
    try {
      await apiClient.post("/api/auth/logout");
      localStorage.removeItem("accessToken");
      return { success: true };
    } catch {
      localStorage.removeItem("accessToken");
      return { success: false };
    }
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/forgot-password", {
        email,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Yêu cầu thất bại",
      };
    }
  }

  // Reset password
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: err.response?.data?.message || "Reset password thất bại",
      };
    }
  }

  // Kiểm tra authentication status
  static isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }
}

export default AuthService;
