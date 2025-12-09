import { Link } from "react-router-dom";
import type { RecentlyViewedProduct } from "../services/recentlyViewedService";
import { Clock } from "lucide-react";

interface RecentlyViewedProps {
  products: RecentlyViewedProduct[];
  title?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xem";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function RecentlyViewed({
  products,
  title = "Sản phẩm đã xem gần đây",
}: RecentlyViewedProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const calculateFinalPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  return (
    <section className="mb-12">
      <div className="mb-6 flex items-center gap-3">
        <Clock className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {products.map((product) => {
          const finalPrice = calculateFinalPrice(
            product.price,
            product.discountPercent
          );

          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Product Image */}
              <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={product.images[0] || "/placeholder-product.png"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {product.discountPercent > 0 && (
                  <div className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                    -{Number(product.discountPercent).toFixed(0)}%
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="rounded-lg bg-white px-3 py-1 text-sm font-semibold text-gray-900">
                      Hết hàng
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-red-600">
                  {product.name}
                </h3>

                <div className="flex flex-col gap-1">
                  <div className="text-base font-bold text-red-600">
                    {formatCurrency(finalPrice)}
                  </div>
                  {product.discountPercent > 0 && (
                    <div className="text-xs text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </div>
                  )}
                </div>

                {/* Viewed time */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(product.viewedAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
