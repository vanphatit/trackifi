import { useEffect, useState } from "react";
import { Users, ShoppingCart, Package, DollarSign, TrendingUp, Loader2, ArrowUpRight } from "lucide-react";
import { AdminService, type DashboardStats } from "../../services/adminService";
import { OrderService, type Order } from "../../services/orderService";
import { ProductService, type BestSellerProduct } from "../../services/productService";
import { Link } from "react-router-dom";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [statsRes, ordersRes, bestSellersRes] = await Promise.all([
          AdminService.getDashboardStats(),
          OrderService.getAllOrders({ page: 1, limit: 5 }), // Get recent 5
          ProductService.getBestSellers(5),
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (ordersRes.success) setRecentOrders(ordersRes.data.orders);
        if (bestSellersRes.success) setBestSellers(bestSellersRes.data);

      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
        <p>{error}</p>
        <button 
            onClick={() => window.location.reload()} 
            className="mt-2 font-semibold underline"
        >
            Thử lại
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: "Tổng doanh thu",
      value: stats ? formatCurrency(stats.revenue) : "0₫",
      change: "+0%", // Placeholder as API might not return change yet
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Đơn hàng",
      value: stats ? stats.orders.total.toString() : "0",
      change: `${stats?.orders.pending} chờ xử lý`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Khách hàng",
      value: stats ? stats.users.total.toString() : "0",
      change: "+0%", // Placeholder
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Sản phẩm",
      value: stats ? "..." : "0", // Total products not directly in stats interface, maybe add later or ignore
      change: `${stats?.products.lowStock} sắp hết hàng`,
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-sm text-slate-500">Chào mừng trở lại, đây là tình hình kinh doanh hôm nay.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-emerald-600">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-900">Đơn hàng gần đây</h3>
             <Link to="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                Xem tất cả <ArrowUpRight className="h-4 w-4" />
             </Link>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                         <th className="px-3 py-2 rounded-l-lg">Mã đơn</th>
                         <th className="px-3 py-2">Khách hàng</th>
                         <th className="px-3 py-2">Tổng tiền</th>
                         <th className="px-3 py-2 rounded-r-lg">Trạng thái</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                     {recentOrders.length === 0 ? (
                         <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-500">Chưa có đơn hàng nào</td></tr>
                     ) : (
                         recentOrders.map(order => (
                             <tr key={order.id}>
                                 <td className="px-3 py-3 font-medium text-slate-900">#{order.id}</td>
                                 <td className="px-3 py-3 text-slate-600">{order.recipientName}</td>
                                 <td className="px-3 py-3 font-medium text-slate-900">{formatCurrency(order.totalAmount)}</td>
                                 <td className="px-3 py-3">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                         order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                         order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                         order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                         'bg-blue-100 text-blue-800'
                                     }`}>
                                         {order.status}
                                     </span>
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-slate-900">Sản phẩm bán chạy</h3>
             <span className="text-sm font-medium text-slate-500">Top 5</span>
          </div>
          <div className="space-y-4">
            {bestSellers.length === 0 ? (
                 <div className="text-center text-slate-500 py-10">Chưa có dữ liệu</div>
            ) : (
                bestSellers.map((product) => (
                    <div key={product.id} className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300"><Package className="h-5 w-5" /></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.category?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{formatCurrency(Number(product.price))}</p>
                            <p className="text-xs text-emerald-600 font-medium">{product.soldCount} đã bán</p>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
