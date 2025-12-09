import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  UserRound,
  Phone,
  Mail,
  CalendarClock,
  AlertCircle,
  Shield,
  Lock,
  Ban,
  Shield as ShieldIcon,
  Heart,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import AppLayout from "../components/AppLayout";
import {
  WishlistService,
  type WishlistItem,
} from "../services/wishlistService";
import { useCart } from "../context/CartContext";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData,
} from "../utils/validationSchemas";

function formatCurrency(value: string | number | undefined) {
  if (value === undefined) return "Liên hệ";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function MyProfile() {
  const { user, logout, updateProfile, changePassword, deactivateAccount } =
    useAuth();
  const { addToCart } = useCart();
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "deactivate" | "wishlist"
  >("profile");
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deactivateStatus, setDeactivateStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({
    type: "",
    message: "",
  });
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
    }
  };

  useEffect(() => {
    if (user) {
      setProfileValue(
        "name",
        `${user.firstName || ""} ${user.lastName || ""}`.trim()
      );
      setProfileValue("email", user.email);
      setProfileValue("phone", user.phoneNumber || "");
      setProfileValue("address", user.address || "");
    }
  }, [user, setProfileValue]);

  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab]);

  const fetchWishlist = async () => {
    setIsLoadingWishlist(true);
    try {
      const response = await WishlistService.getWishlist();
      if (response.success) {
        setWishlistItems(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: number) => {
    if (!window.confirm("Xoá sản phẩm này khỏi danh sách yêu thích?")) return;
    try {
      await WishlistService.removeFromWishlist(productId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } catch (error) {
      alert("Không thể xoá sản phẩm.");
    }
  };

  const fullName = useMemo(() => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  }, [user]);

  const handleGenderChange = (value: boolean) => {
    // Gender is not in form, we'll handle separately if needed
    if (status.type) {
      setStatus({ type: "", message: "" });
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    setPasswordStatus({ type: "", message: "" });
    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword
      );
      setPasswordStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) {
        resetPasswordForm();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    } catch {
      setPasswordStatus({
        type: "error",
        message: "Không thể đổi mật khẩu, vui lòng thử lại.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm("Bạn chắc chắn muốn vô hiệu hoá tài khoản?")) return;
    setIsDeactivating(true);
    setDeactivateStatus({ type: "", message: "" });
    try {
      const result = await deactivateAccount(
        deactivateReason.trim() || undefined
      );
      setDeactivateStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
      if (result.success) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    } catch {
      setDeactivateStatus({
        type: "error",
        message: "Không thể vô hiệu hoá, vui lòng thử lại.",
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const onSubmitProfile = async (data: UpdateProfileFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Split name into firstName and lastName
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const result = await updateProfile({
        firstName,
        lastName,
        phoneNumber: data.phone || undefined,
        address: data.address || undefined,
        gender: user.gender, // Keep existing gender
      });

      setStatus({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Không thể lưu thay đổi, vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppLayout contentClassName="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-blue-200 opacity-50 blur-3xl"></div>
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-sky-100 opacity-60 blur-3xl"></div>
      </div>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Hồ sơ
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Thông tin tài khoản
        </h1>
        <p className="mt-2 text-slate-600">
          Quản lý thông tin cá nhân, cập nhật liên hệ và bảo vệ tài khoản của
          bạn.
        </p>
      </div>

      <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-2xl backdrop-blur lg:grid-cols-[320px_1fr] lg:p-6">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white/95 shadow-lg">
          <div className="flex items-center gap-4 border-b border-slate-200 px-5 py-6">
            <Avatar name={fullName || "User"} size="w-20 h-20" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {fullName || "Người dùng"}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <ShieldCheck className="h-4 w-4" />
                Tài khoản an toàn
              </div>
            </div>
          </div>

          <nav className="px-3 py-4">
            {[
              {
                label: "Thông tin tài khoản",
                icon: UserRound,
                key: "profile" as const,
              },
              {
                label: "Sản phẩm yêu thích",
                icon: Heart,
                key: "wishlist" as const,
              },
              { label: "Đổi mật khẩu", icon: Lock, key: "password" as const },
              {
                label: "Vô hiệu hoá tài khoản",
                icon: Shield,
                key: "deactivate" as const,
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  activeTab === item.key
                    ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
            <a
              href="/orders"
              className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left text-slate-600 transition hover:bg-slate-100"
            >
              <Package className="h-5 w-5" />
              <span className="text-sm font-medium">Quản lý đơn hàng</span>
            </a>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white/95 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                {activeTab === "profile"
                  ? "Cập nhật"
                  : activeTab === "wishlist"
                  ? "Yêu thích"
                  : activeTab === "password"
                  ? "Bảo mật"
                  : activeTab === "deactivate"
                  ? "Rủi ro"
                  : "Đơn hàng"}
              </p>
              <h2 className="text-xl font-semibold text-slate-900">
                {activeTab === "profile"
                  ? "Chi tiết tài khoản"
                  : activeTab === "wishlist"
                  ? "Sản phẩm đã lưu"
                  : activeTab === "password"
                  ? "Đổi mật khẩu"
                  : activeTab === "deactivate"
                  ? "Vô hiệu hoá tài khoản"
                  : "Quản lý đơn hàng"}
              </h2>
              <p className="text-sm text-slate-500">
                {activeTab === "profile"
                  ? "Điều chỉnh thông tin của bạn để nhận hỗ trợ nhanh hơn."
                  : activeTab === "wishlist"
                  ? "Danh sách các sản phẩm bạn quan tâm và muốn mua sau."
                  : activeTab === "password"
                  ? "Thiết lập mật khẩu mạnh và đăng nhập lại sau khi đổi."
                  : activeTab === "deactivate"
                  ? "Đăng xuất trên tất cả thiết bị và yêu cầu hỗ trợ khi cần."
                  : "Xem và theo dõi các đơn hàng của bạn."}
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 sm:inline-flex">
              <CalendarClock className="h-4 w-4" />
              Cập nhật lần cuối{" "}
              {user.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString("vi-VN")
                : new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </div>
          </div>

          {activeTab === "profile" && (
            <div className="p-6">
              {status.message && (
                <div
                  className={`mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {status.type === "success" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <form
                className="space-y-6"
                onSubmit={handleSubmitProfile(onSubmitProfile)}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Họ và tên
                  </label>
                  <input
                    id="name"
                    {...registerProfile("name")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Nhập họ và tên"
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      {...registerProfile("email")}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 shadow-inner cursor-not-allowed"
                    />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-slate-700"
                    >
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                      <input
                        id="phone"
                        {...registerProfile("phone")}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="0912345678"
                      />
                    </div>
                    {profileErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium text-slate-700"
                  >
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                    <input
                      id="address"
                      {...registerProfile("address")}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Nhập địa chỉ nhận hàng"
                    />
                  </div>
                  {profileErrors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileErrors.address.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    Thông tin của bạn được mã hóa và bảo vệ.
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (user) {
                          setProfileValue(
                            "name",
                            `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim()
                          );
                          setProfileValue("phone", user.phoneNumber || "");
                          setProfileValue("address", user.address || "");
                        }
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      Đặt lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                          Đang lưu
                        </>
                      ) : (
                        <>
                          <ShieldIcon className="h-4 w-4" />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="p-6">
              {isLoadingWishlist ? (
                <div className="py-10 text-center">
                  <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                      Loading...
                    </span>
                  </div>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                  <Heart className="h-16 w-16 text-slate-200" />
                  <p className="mt-4 text-lg font-semibold">
                    Chưa có sản phẩm yêu thích
                  </p>
                  <p className="text-sm">
                    Hãy "thả tim" các sản phẩm bạn quan tâm nhé.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Khám phá ngay
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-red-200 hover:shadow-lg"
                    >
                      <div className="h-40 overflow-hidden rounded-xl bg-slate-50">
                        {item.product.images &&
                        item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <Link
                          to={`/products/${item.product.id}`}
                          className="block text-sm font-semibold text-slate-900 transition hover:text-red-600 line-clamp-2 min-h-[40px]"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(item.product.price)}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => addToCart(item.product.id, 1)}
                            className="flex-1 rounded-lg bg-blue-50 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 flex items-center justify-center gap-1"
                          >
                            <ShoppingCart className="h-3 w-3" /> Thêm vào giỏ
                          </button>
                          <button
                            onClick={() =>
                              handleRemoveFromWishlist(item.product.id)
                            }
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                            title="Xoá"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "password" && (
            <div className="p-6">
              {passwordStatus.message && (
                <div
                  className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                    passwordStatus.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {passwordStatus.message}
                </div>
              )}
              <form
                className="space-y-4"
                onSubmit={handleSubmitPassword(onSubmitPassword)}
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    {...registerPassword("currentPassword")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    {...registerPassword("newPassword")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Tối thiểu 8 ký tự"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    {...registerPassword("confirmPassword")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => resetPasswordForm()}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                  >
                    Xoá nội dung
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isChangingPassword && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                    )}
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "deactivate" && (
            <div className="p-6">
              <p className="text-sm text-slate-600">
                Tài khoản bị vô hiệu hoá sẽ đăng xuất trên tất cả thiết bị. Bạn
                có thể kích hoạt lại bằng cách liên hệ hỗ trợ hoặc đăng nhập
                (nếu hệ thống cho phép).
              </p>

              {deactivateStatus.message && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                    deactivateStatus.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {deactivateStatus.message}
                </div>
              )}

              <form className="mt-4 space-y-3" onSubmit={handleDeactivate}>
                <label className="text-sm font-medium text-slate-700">
                  Lý do (tuỳ chọn)
                </label>
                <textarea
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  rows={3}
                  placeholder="Ví dụ: Tôi không còn sử dụng dịch vụ."
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="inline-flex items-center gap-2 text-xs text-rose-600">
                    <Ban className="h-4 w-4" />
                    Hành động này sẽ đăng xuất bạn ngay lập tức.
                  </div>
                  <button
                    type="submit"
                    disabled={isDeactivating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeactivating && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                    )}
                    Vô hiệu hoá
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

export default MyProfile;
