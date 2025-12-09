import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { OrderService } from "../services/orderService";
import AppLayout from "../components/AppLayout";
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  User as UserIcon, 
  FileText, 
  Loader2, 
  CheckCircle
} from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Checkout() {
  const { cart, totalItems, refreshCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Order Form Data
  const [formData, setFormData] = useState({
    recipientName: "",
    contactPhone: "",
    shippingAddress: "",
    notes: "",
    paymentMethod: "COD",
  });

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [successTotalAmount, setSuccessTotalAmount] = useState<number | null>(null);

  // Redirect logic
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
    } else if ((!cart || cart.items.length === 0) && !successOrderId) {
      // If cart is empty and we haven't just placed an order successfully
       navigate("/cart");
    }
  }, [isAuthenticated, cart, navigate, successOrderId]);

  // Pre-fill forms from user profile
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        recipientName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        contactPhone: user.phoneNumber || "",
        shippingAddress: user.address || ""
      }));
    }
  }, [user]);

  const subtotal = cart?.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
  const total = cart?.total || subtotal; // Use API total if available, else calculated

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Client-side validation
      if (!formData.recipientName.trim() || formData.recipientName.trim().length < 2) {
        throw new Error("Tên người nhận phải có ít nhất 2 ký tự.");
      }
      if (!formData.contactPhone.trim() || formData.contactPhone.trim().length < 8) {
        throw new Error("Số điện thoại liên hệ phải có ít nhất 8 ký tự.");
      }
      if (!formData.shippingAddress.trim() || formData.shippingAddress.trim().length < 10) {
        throw new Error("Địa chỉ giao hàng phải có ít nhất 10 ký tự.");
      }

      if (!cart || cart.items.length === 0) {
        throw new Error("Giỏ hàng trống.");
      }

      const orderData = {
        items: cart.items.map((item) => ({
          productId: Number(item.product.id),
          quantity: item.quantity,
        })),
        recipientName: formData.recipientName,
        shippingAddress: formData.shippingAddress,
        contactPhone: formData.contactPhone,
        paymentMethod: formData.paymentMethod as "COD" | "BANK_TRANSFER",
        notes: formData.notes,
      };

      const result = await OrderService.createOrder(orderData);
      
      if (result.success) {
        setSuccessOrderId(result.data.id);
        setSuccessTotalAmount(result.data.totalAmount);
        // Refresh cart to reflect empty state (backend usually clears cart on order placement)
        await refreshCart(); 
      }
    } catch (err: any) {
      console.error("Order error:", err);
      setError(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (successOrderId) {
    return (
      <AppLayout contentClassName="mx-auto max-w-3xl px-4 py-12 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">Đặt hàng thành công!</h2>
          <p className="mt-2 text-lg text-slate-600">
            Mã đơn hàng của bạn là <span className="font-bold text-slate-900">#{successOrderId}</span>.
          </p>
          {successTotalAmount !== null && (
            <p className="text-md text-slate-700">
              Tổng tiền: <span className="font-bold text-red-600">{formatCurrency(successTotalAmount)}</span>
            </p>
          )}
          <p className="text-slate-500">Chúng tôi sẽ sớm liên hệ để xác nhận đơn hàng.</p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Về trang chủ
            </Link>
            <button
              onClick={() => navigate("/profile")}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) return null; // Or a loading spinner while checking auth/redirecting

  if (!cart) return null; // Loading state handled in CartContext mostly, or add local loader

  return (
    <AppLayout contentClassName="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex items-center gap-3 text-sm text-slate-600">
        <Link to="/cart" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:border-red-300 hover:text-red-600">
          <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-900">Thanh toán</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px] items-start">
        {/* Left Column: User Info & Form */}
        <div className="space-y-6">
          
          {/* Recipient Info Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <UserIcon className="h-5 w-5 text-red-600" />
              Thông tin người nhận
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <label htmlFor="recipientName" className="block text-sm font-medium text-slate-700 mb-1">Họ tên người nhận <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="recipientName"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  placeholder="Nhập họ tên đầy đủ"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  minLength={2}
                />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  id="contactPhone"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  placeholder="Nhập số điện thoại"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  minLength={8}
                />
              </div>
              <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                 <span className="block text-xs font-semibold text-slate-500 uppercase">Email</span>
                 <span className="font-medium text-slate-900">{user?.email}</span>
              </div>
            </div>
          </div>

          <form id="checkout-form" onSubmit={handleOrder} className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <MapPin className="h-5 w-5 text-red-600" />
                Địa chỉ giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                  <textarea
                    id="shippingAddress"
                    required
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    minLength={10}
                  />
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Ghi chú giao hàng (tùy chọn)</label>
                  <input
                    type="text"
                    id="notes"
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                    placeholder="Ví dụ: Gọi trước khi giao, giao giờ hành chính..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <CreditCard className="h-5 w-5 text-red-600" />
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 transition hover:bg-red-100">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={formData.paymentMethod === "COD"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "COD" })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-slate-500">Thanh toán tiền mặt cho shipper khi nhận được hàng.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
                  <input
                    type="radio"
                    name="payment"
                    value="BANK_TRANSFER"
                    checked={formData.paymentMethod === "BANK_TRANSFER"}
                    onChange={() => setFormData({ ...formData, paymentMethod: "BANK_TRANSFER" })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-slate-500">Thanh toán qua chuyển khoản ngân hàng.</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4 lg:sticky lg:top-24">
           <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
              <FileText className="h-5 w-5 text-red-600" />
              Đơn hàng ({totalItems} sản phẩm)
            </h2>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 scrollbar-thin scrollbar-thumb-slate-200">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="h-14 w-14 flex-shrink-0 rounded-lg border border-slate-100 bg-slate-50 p-1">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-contain" />
                    ) : (
                       <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900" title={item.product.name}>{item.product.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-500">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-100">
                <span className="font-bold text-lg text-slate-900">Tổng thanh toán</span>
                <span className="font-black text-xl text-red-600">{formatCurrency(successTotalAmount ?? total)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 text-center">
                {error}
              </div>
            )}

            <button
              form="checkout-form"
              type="submit"
              disabled={isLoading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-sm font-bold text-white shadow-xl shadow-red-200 transition hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt hàng ngay"
              )}
            </button>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
