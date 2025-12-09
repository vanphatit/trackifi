import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "../services/authService";
import AppLayout from "../components/AppLayout";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../utils/validationSchemas";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setApiError("Token không hợp lệ");
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError("Token không hợp lệ");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const result = await AuthService.resetPassword(token, data.password);
      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setApiError(result.message);
      }
    } catch (error) {
      setApiError("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout contentClassName="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Đặt lại mật khẩu
          </h1>
          <p className="text-gray-600">Nhập mật khẩu mới của bạn</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-600">
            {message}
            <p className="text-sm mt-2">
              Bạn sẽ được chuyển hướng đến trang đăng nhập...
            </p>
          </div>
        )}

        {/* Error Message */}
        {/* Error Message */}
        {apiError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {apiError}
          </div>
        )}

        {!isSuccess && (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lại mật khẩu mới"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Đang đặt lại...
                  </div>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </form>
          </>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="font-semibold text-blue-600 transition duration-200 hover:text-blue-800"
          >
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default ResetPassword;
