import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import {
  registerSchema,
  type RegisterFormData,
} from "../utils/validationSchemas";

function Register() {
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError("");

    try {
      // Split name into firstName and lastName
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const result = await registerUser({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        phoneNumber: data.phone || "",
        address: data.address || "",
        gender: true, // Default value
      });

      if (result.success) {
        navigate("/profile");
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
      <div className="w-[560px] max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:max-w-lg sm:p-8 md:max-w-xl lg:max-w-2xl xl:max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
            Đăng ký
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Tạo tài khoản mới
          </p>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 sm:space-y-5"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Họ và tên
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm transition duration-200 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:py-3 sm:text-base"
              placeholder="Nhập họ và tên"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mật khẩu
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ít nhất 8 ký tự"
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register("confirmPassword")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số điện thoại (tuỳ chọn)
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0912345678"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Địa chỉ (tuỳ chọn)
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 transition duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa chỉ"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                Đang đăng ký...
              </div>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 transition duration-200 hover:text-blue-800"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

export default Register;
