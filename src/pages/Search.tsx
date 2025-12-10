import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import Pagination from "../components/Pagination";
import WishlistButton from "../components/WishlistButton";
import {
  SearchService,
  type SearchResponse,
  type Aggregations,
} from "../services/searchService";
import type { Product } from "../services/productService";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";

const priceRanges = [
  { label: "Dưới 10 triệu", min: 0, max: 10000000 },
  { label: "10 - 20 triệu", min: 10000000, max: 20000000 },
  { label: "20 - 30 triệu", min: 20000000, max: 30000000 },
  { label: "30 - 50 triệu", min: 30000000, max: 50000000 },
  { label: "Trên 50 triệu", min: 50000000, max: 999999999 },
];

const sortOptions = [
  { value: "relevance", label: "Phù hợp nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "newest", label: "Mới nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "name_asc", label: "Tên A-Z" },
];

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

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<SearchResponse["data"]["meta"] | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [aggregations, setAggregations] = useState<Aggregations | null>(null);

  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const badgesFromProduct = useMemo(() => {
    const map = new Map<number, string[]>();
    products.forEach((product) => {
      if (product.shortDescription) {
        map.set(
          product.id,
          product.shortDescription.split("|").map((item) => item.trim())
        );
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
      setTotal(0);
      setAggregations(null);
      return;
    }

    let active = true;

    async function fetchProducts() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await SearchService.searchProducts({
          q: query,
          page: currentPage,
          limit: 5,
          sortBy: sortBy as
            | "relevance"
            | "price_asc"
            | "price_desc"
            | "newest"
            | "rating"
            | "name_asc",
          brand: selectedBrands.length > 0 ? selectedBrands : undefined,
          minPrice: selectedPriceRange?.min,
          maxPrice: selectedPriceRange?.max,
        });

        if (active) {
          setProducts(response.data.products || []);
          setMeta(response.data.meta || null);
          setTotal(response.data.total || 0);
          setAggregations(response.data.aggregations || null);
        }
      } catch (err) {
        if (active) {
          console.error("Search error:", err);
          const error = err as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể tải dữ liệu tìm kiếm. Vui lòng thử lại.";
          setError(message);
          setProducts([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchProducts();
    return () => {
      active = false;
    };
  }, [query, currentPage, sortBy, selectedBrands, selectedPriceRange]);

  const handlePageChange = (page: number) => {
    setSearchParams({ q: query, page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setSearchParams({ q: query, page: "1" });
  };

  const handlePriceRangeSelect = (
    range: { min: number; max: number } | null
  ) => {
    setSelectedPriceRange(range);
    setSearchParams({ q: query, page: "1" });
    setShowPriceDropdown(false);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setSearchParams({ q: query, page: "1" });
    setShowSortDropdown(false);
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRange(null);
    setSortBy("relevance");
    setSearchParams({ q: query, page: "1" });
  };

  const activeFiltersCount =
    selectedBrands.length + (selectedPriceRange ? 1 : 0);

  const renderHeaderTitle = () => {
    if (!query) {
      return (
        <>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Nhập từ khóa để bắt đầu tìm kiếm
          </h1>
          <p className="text-sm text-slate-500">
            Ví dụ: &ldquo;ROG&rdquo;, &ldquo;Laptop văn phòng&rdquo;, &ldquo;RTX
            4070&rdquo;
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
          {total
            ? `${total} kết quả phù hợp`
            : "Đang tìm kiếm sản phẩm phù hợp..."}
        </p>
      </>
    );
  };

  return (
    <AppLayout contentClassName="mx-auto max-w-6xl px-4 py-10 lg:px-0">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em]">
            Tìm kiếm
          </p>
          {renderHeaderTitle()}
        </div>

        {/* Filters and Sort */}
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-500 hover:text-red-600 flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Brand Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBrandDropdown(!showBrandDropdown);
                setShowPriceDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                selectedBrands.length > 0
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-red-500 hover:text-red-600"
              }`}
            >
              Hãng
              {selectedBrands.length > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {selectedBrands.length}
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showBrandDropdown &&
              aggregations &&
              aggregations.brands.length > 0 && (
                <div className="absolute z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {aggregations.brands.map((brand) => (
                      <label
                        key={brand.key}
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.key)}
                          onChange={() => handleBrandToggle(brand.key)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-slate-700">
                          {brand.key} ({brand.doc_count})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <button
              onClick={() => {
                setShowPriceDropdown(!showPriceDropdown);
                setShowBrandDropdown(false);
                setShowSortDropdown(false);
              }}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition flex items-center gap-2 ${
                selectedPriceRange
                  ? "border-red-500 bg-red-50 text-red-600"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-red-500 hover:text-red-600"
              }`}
            >
              Giá
              <ChevronDown className="h-4 w-4" />
            </button>

            {showPriceDropdown && (
              <div className="absolute z-10 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="space-y-2">
                  <button
                    onClick={() => handlePriceRangeSelect(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      !selectedPriceRange
                        ? "bg-red-50 text-red-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Tất cả
                  </button>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() =>
                        handlePriceRangeSelect({
                          min: range.min,
                          max: range.max,
                        })
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                        selectedPriceRange?.min === range.min &&
                        selectedPriceRange?.max === range.max
                          ? "bg-red-50 text-red-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowBrandDropdown(false);
                setShowPriceDropdown(false);
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-500 hover:text-red-600 flex items-center gap-2"
            >
              {sortOptions.find((opt) => opt.value === sortBy)?.label ||
                "Sắp xếp"}
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      sortBy === option.value
                        ? "bg-red-50 text-red-600 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedBrands.length > 0 || selectedPriceRange) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
              >
                {brand}
                <button
                  onClick={() => handleBrandToggle(brand)}
                  className="hover:text-red-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedPriceRange && (
              <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                {priceRanges.find(
                  (r) =>
                    r.min === selectedPriceRange.min &&
                    r.max === selectedPriceRange.max
                )?.label || "Tùy chỉnh"}
                <button
                  onClick={() => handlePriceRangeSelect(null)}
                  className="hover:text-red-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
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
                discountPercent > 0 && !Number.isNaN(priceNumber)
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
                  <div className="relative mb-4 h-40 overflow-hidden rounded-2xl bg-slate-50">
                    {product.images && product.images.length > 0 ? (
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
                    <div className="absolute right-2 top-2">
                      <WishlistButton
                        productId={product.id}
                        variant="icon"
                        size="sm"
                      />
                    </div>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {product.name}
                  </h2>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {product.category?.name || "Product"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {badges.map((badge, idx) => (
                      <span
                        key={idx}
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
                    {oldPrice && (
                      <span className="line-through">{oldPrice}</span>
                    )}{" "}
                    {discountPercent > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/products/${product.id}`}
                    className="mt-4 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white text-center"
                  >
                    Xem chi tiết
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-10">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={handlePageChange}
              totalItems={total}
              itemsPerPage={meta.limit}
              showInfo={true}
            />
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default Search;
