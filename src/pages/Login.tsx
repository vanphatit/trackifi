import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectUrl = queryParams.get("redirect") || location.state?.from?.pathname || "/profile";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors) setErrors("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors("");

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(redirectUrl, { replace: true });
      } else {
        setErrors(result.message);
      }
    } catch (error) {
      setErrors("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout contentClassName="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10">
      {/* Card: responsive max-width + min-width to prevent being too narrow */}
      <div className="w-[500px] max-w-sm min-w-[320px] rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:max-w-md sm:p-8 md:max-w-lg lg:max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
            Đăng nhập
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Chào mừng bạn trở lại!
          </p>
        </div>

        {/* Error Message */}
        {errors && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {errors}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-4 sm:text-base"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm transition duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-4 sm:text-base"
              placeholder="Nhập mật khẩu"
            />
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 transition duration-200 hover:text-blue-800"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                Đang đăng nhập...
              </div>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 transition duration-200 hover:text-blue-800"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default Login;
