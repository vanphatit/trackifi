import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BadgePercent,
  CheckCircle2,
  CircleDollarSign,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Loader2,
  Users,
  MessageSquare,
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import WishlistButton from "../components/WishlistButton";
import { ProductService, type Product } from "../services/productService";
import { SearchService } from "../services/searchService";
import { ReviewService, type Review } from "../services/reviewService";
import { RecentlyViewedService } from "../services/recentlyViewedService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

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

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!productId) return;
      setIsLoading(true);
      setError(null);
      try {
        // Fetch product detail
        const productRes = await ProductService.getProductDetail(productId);

        if (mounted) {
          if (productRes.success) {
            setProduct(productRes.data);
            setActiveImage(productRes.data.images?.[0] || null);

            // Track view if user is logged in
            if (user) {
              try {
                await RecentlyViewedService.trackView(productRes.data.id);
              } catch (trackError) {
                console.error("Failed to track product view", trackError);
                // Don't block the page load if tracking fails
              }
            }

            // Fetch related products and reviews only if product is found
            try {
              const [relatedRes, reviewsRes] = await Promise.all([
                SearchService.getRelatedProducts(productRes.data.id),
                ReviewService.getReviews(productRes.data.id),
              ]);
              if (relatedRes.success) setRelatedProducts(relatedRes.data);
              if (reviewsRes.success) setReviews(reviewsRes.data);
            } catch (secondaryErr) {
              console.error("Failed to fetch related data", secondaryErr);
            }
          } else {
            setError("Không thể tải thông tin sản phẩm.");
          }
        }
      } catch (err: any) {
        if (mounted)
          setError(err.message || "Không thể tải sản phẩm. Vui lòng thử lại.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [productId, user]);

  const finalPrice = useMemo(() => {
    if (!product) return undefined;
    const price = Number(product.price);
    const discount = Number(product.discountPercent);
    if (!Number.isNaN(discount) && discount > 0 && !Number.isNaN(price)) {
      return price * (1 - discount / 100);
    }
    return price;
  }, [product]);

  const specsEntries = useMemo(() => {
    if (!product?.specs) return [];
    return Object.entries(product.specs);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product.id, qty);
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleQtyChange = (value: number) => {
    if (value < 1) return;
    setQty(value);
  };

  if (isLoading) {
    return (
      <AppLayout contentClassName="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-red-600" />
        </div>
      </AppLayout>
    );
  }

  if (error || !product) {
    return (
      <AppLayout contentClassName="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-rose-600">
          {error || "Không tìm thấy sản phẩm."}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout contentClassName="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="mb-6 flex items-center gap-3 text-sm text-slate-600">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-slate-700 transition hover:border-red-300 hover:text-red-600"
        >
          <ArrowLeft className="h-4 w-4" /> Trở về trang chủ
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-semibold text-slate-900">Chi tiết sản phẩm</span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-xl">
        <div className="grid gap-8 p-6 lg:grid-cols-[1.1fr,1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-[420px] w-full object-contain"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-slate-400">
                  Không có ảnh
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(img)}
                    className={`h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border transition ${
                      activeImage === img
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
                  {product.category?.name || "Trackifi"}
                </p>
                <h1 className="text-2xl font-bold text-slate-900">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Hàng chính hãng
              </div>
            </div>

            <p className="text-sm text-slate-600">
              {product.shortDescription || "Mô tả đang cập nhật."}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(finalPrice)}
              </div>
              {Number(product.discountPercent) > 0 ? (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                    <BadgePercent className="h-4 w-4" /> -
                    {product.discountPercent}%
                  </span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <CircleDollarSign className="h-4 w-4" /> Giá chuẩn
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Star className="h-4 w-4 text-amber-500" />
                {/* Placeholder for rating as it is not in Product interface yet, but fetched via ReviewService */}
                {reviews.length > 0
                  ? `${(
                      reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)}/5`
                  : "Chưa có đánh giá"}
                ({reviews.length} đánh giá)
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Truck className="h-4 w-4 text-blue-600" />
                Giao nhanh 2-4h nội thành
              </div>
              {product.stock !== undefined && (
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {product.stock > 0
                    ? `Còn ${product.stock} sản phẩm`
                    : "Hết hàng"}
                </div>
              )}
            </div>

            {/* Product Statistics */}
            {((product as any).totalBuyers !== undefined ||
              (product as any).totalComments !== undefined) && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 p-4">
                {(product as any).totalBuyers !== undefined && (
                  <div className="inline-flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-900">
                        {(product as any).totalBuyers}
                      </div>
                      <div className="text-xs text-blue-700">Người đã mua</div>
                    </div>
                  </div>
                )}
                {(product as any).totalComments !== undefined && (
                  <div className="inline-flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-900">
                        {(product as any).totalComments}
                      </div>
                      <div className="text-xs text-purple-700">Đánh giá</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <button
                  onClick={() => handleQtyChange(qty - 1)}
                  className="px-3 text-lg font-bold text-slate-500 hover:text-red-600"
                  type="button"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => handleQtyChange(Number(e.target.value))}
                  className="w-14 border-x border-slate-200 bg-white text-center text-sm outline-none"
                  min={1}
                />
                <button
                  onClick={() => handleQtyChange(qty + 1)}
                  className="px-3 text-lg font-bold text-slate-500 hover:text-red-600"
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Thêm vào giỏ
              </button>
              <WishlistButton productId={product.id} variant="full" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Mô tả</p>
              <div
                className="mt-2 text-sm text-slate-600"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description ||
                    "Thông tin chi tiết đang được cập nhật.",
                }}
              />
            </div>

            {specsEntries.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Thông số kỹ thuật
                </p>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {specsEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <dt className="font-semibold">{key}</dt>
                      <dd className="pl-3 text-right text-slate-600">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Sản phẩm liên quan
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-1 hover:border-red-500 shadow-sm"
              >
                <div className="relative h-40 overflow-hidden rounded-xl bg-slate-100">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute right-2 top-2">
                    <WishlistButton productId={p.id} variant="icon" size="sm" />
                  </div>
                </div>
                <Link
                  to={`/products/${p.id}`}
                  className="mt-4 text-sm font-semibold text-slate-900 line-clamp-2 min-h-[40px] hover:text-red-600 transition"
                >
                  {p.name}
                </Link>
                <div className="mt-2 text-lg font-bold text-red-600">
                  {formatCurrency(p.price)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppLayout>
  );
}
