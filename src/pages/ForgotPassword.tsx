import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "../services/authService";
import AppLayout from "../components/AppLayout";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../utils/validationSchemas";

function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError("");
    setMessage("");

    try {
      const result = await AuthService.forgotPassword(data.email);
      if (result.success) {
        setMessage(result.message);
        setIsSuccess(true);
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
            Quên mật khẩu
          </h1>
          <p className="text-gray-600">
            Nhập email để nhận link khôi phục mật khẩu
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-600">
            {message}
          </div>
        )}

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {apiError}
          </div>
        )}

        {!isSuccess ? (
          <>
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập email của bạn"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition duration-200 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Đang gửi...
                  </div>
                ) : (
                  "Gửi link khôi phục"
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition duration-200 hover:text-blue-800"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-6">
                Vui lòng kiểm tra email và làm theo hướng dẫn để đặt lại mật
                khẩu.
              </p>
            </div>

            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ForgotPassword;
