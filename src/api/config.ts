import axios from "axios";

// Sử dụng proxy trong development, absolute URL trong production
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8081");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor để thêm access token và credentials
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Chỉ gửi cookies cho các endpoint cần thiết
    const needCredentialsEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
      "/api/auth/logout",
      "/api/user/profile",
    ];

    const needsCredentials =
      needCredentialsEndpoints.some((endpoint) =>
        config.url?.includes(endpoint)
      ) || !!token; // Hoặc khi đã có token

    if (needsCredentials) {
      config.withCredentials = true;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true } // Refresh token luôn cần cookies
        );

        const newToken = refreshResponse.data.data.accessToken;
        localStorage.setItem("accessToken", newToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
