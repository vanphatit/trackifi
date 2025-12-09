import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { OrderService, type Order } from "../services/orderService";
import AppLayout from "../components/AppLayout";
import { 
  ChevronRight, 
  Package, 
  Calendar, 
  MapPin, 
  Phone, 
  CreditCard, 
  Loader2, 
  ArrowLeft,
  User
} from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrderDetail() {
      if (!orderId) return;
      try {
        const result = await OrderService.getOrderDetail(Number(orderId));
        if (result.success) {
          setOrder(result.data);
        } else {
          setError("Không thể tải thông tin đơn hàng.");
        }
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải chi tiết đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrderDetail();
  }, [orderId]);

  if (isLoading) {
    return (
      <AppLayout contentClassName="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </AppLayout>
    );
  }

  if (error || !order) {
    return (
      <AppLayout contentClassName="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          <p>{error || "Không tìm thấy đơn hàng"}</p>
          <Link
            to="/orders"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout contentClassName="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/orders" className="hover:text-blue-600">
          Đơn hàng
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-slate-900">Chi tiết #{order.id}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,350px]">
        <div className="space-y-6">
          {/* Header Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Đơn hàng #{order.id}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Đặt ngày {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  }) : "N/A"}
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  order.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : order.status === "PENDING"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {order.status === "PENDING" ? "Chờ xử lý" : order.status}
              </span>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-slate-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.productId} className="flex items-start gap-4 p-6">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {/* Placeholder for Image since OrderItem currently doesn't have image URL directly 
                          Ideally backend should populate this or we fetch product details separately 
                      */}
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        <Link to={`/products/${item.productId}`} className="hover:text-blue-600">
                          Sản phẩm #{item.productId}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-slate-500">
                        Tổng: {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-slate-500 italic">Chi tiết sản phẩm không khả dụng</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-900">Thanh toán</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium text-slate-900">{formatCurrency(order.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phí vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-red-600">{formatCurrency(order.totalAmount || 0)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">
                    {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng" : order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-900">Thông tin giao hàng</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <User className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{order.recipientName}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">{order.contactPhone}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 flex-shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">{order.shippingAddress}</p>
                </div>
              </div>
              {order.notes && (
                <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
                  <span className="font-semibold">Ghi chú:</span> {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
