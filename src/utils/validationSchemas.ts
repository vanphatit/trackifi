import { z } from "zod";

// Common validation rules
const emailSchema = z.string().email("Email không hợp lệ");
const passwordSchema = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số");

const phoneSchema = z
  .string()
  .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ");

const nameSchema = z
  .string()
  .min(2, "Tên phải có ít nhất 2 ký tự")
  .max(100, "Tên không được vượt quá 100 ký tự")
  .regex(/^[\p{L}\s]+$/u, "Tên chỉ được chứa chữ cái và khoảng trắng");

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    phone: phoneSchema.optional().or(z.literal("")),
    address: z
      .string()
      .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
      .max(500, "Địa chỉ không được vượt quá 500 ký tự")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  address: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Change Password Schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["newPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Checkout Schema
export const checkoutSchema = z.object({
  recipientName: nameSchema,
  recipientPhone: phoneSchema,
  shippingAddress: z
    .string()
    .min(10, "Địa chỉ phải có ít nhất 10 ký tự")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  note: z
    .string()
    .max(500, "Ghi chú không được vượt quá 500 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Review Schema
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "Vui lòng chọn số sao")
    .max(5, "Số sao không hợp lệ"),
  comment: z
    .string()
    .min(10, "Nhận xét phải có ít nhất 10 ký tự")
    .max(1000, "Nhận xét không được vượt quá 1000 ký tự"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
