import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import apiClient from "../api/config";

const filterGroups = [
  "Bộ lọc",
  "Giá",
  "Hãng",
  "Kiểu màn hình",
  "Kích thước",
  "Nhu cầu sử dụng",
  "Tấm nền",
  "Tần số quét",
  "Tương thích VESA",
  "Độ phân giải",
  "CPU",
  "Kích thước màn hình",
  "RAM",
  "SSD",
  "VGA",
];

interface Product {
  id: number;
  name: string;
  price: string;
  discountPercent?: string;
  shortDescription?: string;
  images?: string[];
  specs?: Record<string, string>;
  slug: string;
  brand?: string;
}

function formatCurrency(value: string) {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return value;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ totalItems: number } | null>(null);

  const badgesFromProduct = useMemo(() => {
    const map = new Map<number, string[]>();
    products.forEach((product) => {
      if (product.shortDescription) {
        map.set(product.id, product.shortDescription.split("|").map((item) => item.trim()));
      } else if (product.specs) {
        map.set(product.id, Object.values(product.specs));
      } else {
        map.set(product.id, []);
      }
    });
    return map;
  }, [products]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setMeta(null);
      return;
    }
    const controller = new AbortController();
    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get("/api/products", {
          params: { search: query, page: 1, limit: 8 },
          signal: controller.signal,
        });
        setProducts(response.data.data || []);
        setMeta(response.data.meta || null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError("Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại.");
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [query]);

  const renderHeaderTitle = () => {
    if (!query) {
      return (
        <>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Nhập từ khóa để bắt đầu tìm kiếm
          </h1>
          <p className="text-sm text-slate-500">
            Ví dụ: &ldquo;ROG&rdquo;, &ldquo;Laptop văn phòng&rdquo;, &ldquo;RTX 4070&rdquo;
          </p>
        </>
      );
    }
    return (
      <>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Tìm kiếm theo <span className="text-red-600">{query}</span>
        </h1>
        <p className="text-sm text-slate-500">
          {meta?.totalItems
            ? `${meta.totalItems} kết quả phù hợp`
            : "Đang tìm kiếm sản phẩm phù hợp..."}
        </p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em]">
              Tìm kiếm
            </p>
            {renderHeaderTitle()}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {filterGroups.map((filter) => (
              <button
                key={filter}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-500 hover:text-red-600"
              >
                {filter} ▾
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 min-h-[200px]">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 h-32 rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                  <div className="mt-4 h-4 w-1/2 rounded bg-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
              {error}
            </div>
          ) : !query ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center text-slate-500">
              Nhập từ khóa vào thanh tìm kiếm để xem sản phẩm.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center text-slate-500">
              Không tìm thấy sản phẩm phù hợp với &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => {
                const price = formatCurrency(product.price);
                const discountPercent = Number(product.discountPercent || 0);
                const priceNumber = Number(product.price);
                const oldPrice =
                  discountPercent > 0 && priceNumber
                    ? formatCurrency(
                        (priceNumber / (1 - discountPercent / 100)).toString()
                      )
                    : null;
                const badges = badgesFromProduct.get(product.id) ?? [];

                return (
                  <article
                    key={product.id}
                    className="flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-red-500"
                  >
                    <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-slate-50">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">
                      {product.name}
                    </h2>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {product.brand}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-lg font-bold text-red-600">
                      {price}
                    </div>
                    <div className="text-sm text-slate-400">
                      {oldPrice && <span className="line-through">{oldPrice}</span>}{" "}
                      {discountPercent > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                    <button className="mt-4 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
                      Xem chi tiết
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Search;
