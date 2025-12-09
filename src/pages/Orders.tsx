import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OrderService, type Order } from "../services/orderService";
import AppLayout from "../components/AppLayout";
import { Package, Calendar, ChevronRight, CreditCard, Truck, Loader2 } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await OrderService.getMyOrders();
        if (result.success && Array.isArray(result.data.orders)) {
          setOrders(result.data.orders);
        } else {
          setOrders([]);
          // Only set error if it's strictly a failure, otherwise empty list is fine
          if (!result.success) setError("Không thể tải danh sách đơn hàng.");
        }
      } catch (err: any) {
        console.error("Fetch orders error:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <AppLayout contentClassName="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout contentClassName="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout contentClassName="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Quay lại hồ sơ
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Lịch sử đơn hàng</h1>
        <p className="mt-2 text-slate-600">Theo dõi và quản lý các đơn hàng của bạn.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <Package className="h-10 w-10" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">Chưa có đơn hàng nào</h3>
          <p className="mt-2 text-slate-500">Hãy khám phá các sản phẩm và đặt hàng ngay hôm nay.</p>
          <Link
            to="/"
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Đơn hàng #{order.id}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "COMPLETED"
                        ? "bg-green-50 text-green-700"
                        : order.status === "PENDING"
                        ? "bg-amber-50 text-amber-700"
                        : order.status === "CANCELLED"
                        ? "bg-red-50 text-red-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {order.status === "PENDING" ? "Chờ xử lý" : order.status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="hidden items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800 sm:inline-flex"
                  >
                    Chi tiết <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-3">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <>
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.productId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-400">
                              IMG
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">Sản phẩm #{item.productId}</p>
                              <p className="text-xs text-slate-500">Số lượng: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {formatCurrency(item.price || 0)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-slate-500">
                          ...và {order.items.length - 2} sản phẩm khác
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Chi tiết sản phẩm không khả dụng</p>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {order.paymentMethod === "COD"
                        ? "Thanh toán khi nhận hàng"
                        : "Chuyển khoản"}
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <Truck className="h-4 w-4" />
                      Giao hàng tiêu chuẩn
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-500">Tổng tiền: </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(order.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Link
                to={`/orders/${order.id}`}
                className="block border-t border-slate-100 bg-slate-50 p-3 text-center text-sm font-medium text-blue-600 sm:hidden"
              >
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
