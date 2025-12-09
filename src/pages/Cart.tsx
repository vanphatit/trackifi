import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Tag,
  Truck,
  Info,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import { useCart, type CartItem } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, toggleSelection, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    subtotal,
    discount,
    total,
    freeShippingProgress,
    selectedCount,
    allSelected,
  } = useMemo(() => {
    if (!cart || !cart.items)
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
        freeShippingProgress: { progress: 0, remaining: 0 },
        selectedCount: 0,
        allSelected: false,
      };

    const selectedItems = cart.items.filter((item) => item.isSelected);
    const subtotal = selectedItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const discount = 0; // Placeholder
    const total = subtotal - discount;

    const FREE_SHIPPING_THRESHOLD = 5000000;
    const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

    const selectedCount = selectedItems.length;
    const allSelected =
      cart.items.length > 0 && selectedCount === cart.items.length;

    return {
      subtotal,
      discount,
      total,
      freeShippingProgress: { progress, remaining },
      selectedCount,
      allSelected,
    };
  }, [cart]);

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = (item: CartItem) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xoá "${item.product.name}" khỏi giỏ hàng?`
      )
    ) {
      removeFromCart(item.id);
    }
  };

  const handleToggleItem = (itemId: number, currentSelection: boolean) => {
    toggleSelection([itemId], !currentSelection);
  };

  const handleToggleAll = () => {
    const itemIds = cart?.items.map((item) => item.id) || [];
    toggleSelection(itemIds, !allSelected);
  };

  if (isLoading) {
    return (
      <AppLayout contentClassName="mx-auto max-w-7xl px-4 py-20 lg:px-8 text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-600" />
        <p className="mt-4 text-slate-500">Đang tải giỏ hàng...</p>
      </AppLayout>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <AppLayout contentClassName="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 text-red-500 shadow-inner">
            <ShoppingBag className="h-14 w-14 opacity-80" />
          </div>
          <h2 className="mt-8 text-3xl font-bold text-slate-900">
            Giỏ hàng trống trơn
          </h2>
          <p className="mt-3 max-w-md text-slate-500 text-lg">
            Có vẻ như bạn chưa chọn được món nào. Đừng bỏ lỡ các deal hời hôm
            nay nhé!
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại mua sắm
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout contentClassName="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center gap-3 text-sm text-slate-600">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:border-red-300 hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" /> Tiếp tục mua hàng
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-900">Giỏ hàng của bạn</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px] items-start">
        {/* Cart Items List */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleAll}
                className="flex items-center justify-center text-red-600 hover:text-red-700 transition"
                title={allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
              >
                {allSelected ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                Giỏ hàng ({cart.items.length} sản phẩm
                {selectedCount > 0 && `, ${selectedCount} đã chọn`})
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <Truck className="h-4 w-4" />
              {freeShippingProgress.remaining > 0
                ? `Mua thêm ${formatCurrency(
                    freeShippingProgress.remaining
                  )} để được Freeship`
                : "Đơn hàng được miễn phí vận chuyển!"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress.progress}%` }}
            />
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md sm:flex-row sm:items-center"
              >
                {/* Selection Checkbox */}
                <button
                  onClick={() => handleToggleItem(item.id, item.isSelected)}
                  className="absolute left-3 top-3 sm:relative sm:left-0 sm:top-0 flex-shrink-0 text-red-600 hover:text-red-700 transition z-10"
                  title={item.isSelected ? "Bỏ chọn" : "Chọn sản phẩm"}
                >
                  {item.isSelected ? (
                    <CheckSquare className="h-5 w-5" />
                  ) : (
                    <Square className="h-5 w-5" />
                  )}
                </button>

                {/* Image */}
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2 ml-8 sm:ml-0">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-contain mix-blend-multiply transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="transition hover:text-red-600"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(item.product.price)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        <Tag className="h-3 w-3" /> Chính hãng
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-end gap-4 sm:gap-6">
                    <div className="flex items-center rounded-full border border-slate-200 bg-white shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                        aria-label="Giảm số lượng"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                        aria-label="Tăng số lượng"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="mb-1 text-sm font-bold text-slate-900">
                        Tổng:{" "}
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => handleRemove(item)}
                        className="group/del flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3 transition group-hover/del:scale-110" />{" "}
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <CreditCard className="h-5 w-5 text-red-600" />
              Thanh toán
            </h2>

            <div className="mt-6 space-y-3 border-b border-slate-100 pb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Giảm giá</span>
                <span className="font-medium text-emerald-600">
                  -{formatCurrency(discount)}
                </span>
              </div>
              <div className="mt-2 flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                <span className="font-semibold text-slate-900">Tổng cộng</span>
                <div className="text-right">
                  <span className="block text-xl font-black text-red-600">
                    {formatCurrency(total)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Mã ưu đãi
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-20 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 transition"
                />
                <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <button className="absolute right-1.5 top-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800">
                  Áp dụng
                </button>
              </div>
            </div>

            <button
              className="mt-6 w-full rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-200 transition hover:bg-red-700 hover:shadow-red-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedCount === 0}
              onClick={() => {
                if (isAuthenticated) {
                  navigate("/checkout");
                } else {
                  navigate("/login?redirect=/checkout");
                }
              }}
            >
              {selectedCount === 0
                ? "Chọn sản phẩm để thanh toán"
                : `Tiến hành đặt hàng (${selectedCount} sản phẩm)`}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-blue-50 p-4 text-blue-800 shadow-sm">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 flex-shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase opacity-80 mb-1">
                  Yên tâm mua sắm
                </p>
                <ul className="space-y-1 text-sm font-medium opacity-90">
                  <li>• Freeship đơn từ 5.000.000₫</li>
                  <li>• Hoàn tiền 111% nếu giả</li>
                  <li>• 30 ngày đổi trả miễn phí</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
