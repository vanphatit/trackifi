import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const heroPromos = [
  {
    title: "Laptop Office",
    subtitle: "Ưu đãi HSSV · Mua 1 tặng 5",
    badge: "BACK2SCHOOL",
    bg: "from-purple-500 to-blue-500",
  },
  {
    title: "Build PC Gaming 240Hz",
    subtitle: "Voucher 200k · Tặng màn phụ",
    badge: "DEAL HOT",
    bg: "from-sky-500 to-teal-500",
  },
];

const bestSellerPCs = [
  {
    name: "PC TKI Intel i5 / RTX 4060",
    price: "20.190.000₫",
    oldPrice: "21.420.000₫",
    discount: "-6%",
  },
  {
    name: "PC TKI Intel Ultra 5 / RTX 5060",
    price: "26.090.000₫",
    oldPrice: "27.320.000₫",
    discount: "-7%",
  },
  {
    name: "PC Creator Ultra 7 / RTX 4090",
    price: "40.890.000₫",
    oldPrice: "43.410.000₫",
    discount: "-6%",
  },
  {
    name: "PC TKI X ASUS Hatsune Edition",
    price: "144.990.000₫",
    oldPrice: "145.340.000₫",
    discount: "-0%",
  },
];

const gamingLaptops = [
  { brand: "MSI", name: "Katana 15 AI", price: "37.990.000₫" },
  { brand: "ASUS", name: "ROG Strix G17", price: "46.990.000₫" },
  { brand: "GIGABYTE", name: "Aero 14 OLED", price: "39.490.000₫" },
  { brand: "ACER", name: "Predator Neo 16", price: "42.990.000₫" },
];

const promos = [
  {
    title: "Thu cũ đổi mới",
    desc: "Nâng cấp PC giảm đến 1.800.000₫",
    tag: "Trade-in",
  },
  {
    title: "Microsoft 365",
    desc: "Giá chỉ từ 20.000₫/tháng",
    tag: "Software",
  },
  {
    title: "Tin tức công nghệ",
    desc: "Cách reset máy tính Casio chi tiết",
    tag: "Blog",
  },
  {
    title: "Hướng dẫn Where Winds Meet",
    desc: "Setup trải nghiệm game mượt",
    tag: "Guide",
  },
];

const highlights = [
  { label: "Thành phố giao nhanh", value: "24" },
  { label: "Mẫu laptop curated", value: "180+" },
  { label: "Chuyên gia online", value: "75" },
  { label: "Phản hồi trung bình", value: "47s" },
];

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-0">
        <section className="grid gap-6 lg:grid-cols-[2.5fr,1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {heroPromos.map((promo) => (
                <div
                  key={promo.title}
                  className={`min-h-[220px] rounded-3xl bg-gradient-to-br ${promo.bg} px-6 py-8 text-white shadow-lg`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.3em]">
                    {promo.badge}
                  </p>
                  <h2 className="mt-2 text-3xl font-black">{promo.title}</h2>
                  <p className="mt-2 text-sm text-white/80">{promo.subtitle}</p>
                  <button className="mt-6 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-slate-900">
                    Khám phá
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">
                    Deal nổi bật
                  </p>
                  <h3 className="text-2xl font-bold">
                    Laptop gaming giảm đến 26%
                  </h3>
                  <p className="text-sm text-slate-500">
                    Voucher 500K + Tặng chuột Logitech
                  </p>
                </div>
                <Link
                  to="/register"
                  className="self-start rounded-full border border-red-500 px-5 py-2 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Build PC
              </p>
              <h4 className="mt-2 text-lg font-bold text-slate-900">
                Tặng màn hình Gaming 240Hz
              </h4>
              <p className="text-sm text-slate-500">
                Khi build PC tại showroom tuần này
              </p>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Phụ kiện
              </p>
              <h4 className="mt-2 text-lg font-bold text-slate-900">
                Chuột cơ giảm đến 26%
              </h4>
              <p className="text-sm text-slate-500">
                Gaming gear chính hãng chỉ từ 80.000đ
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-red-50 p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase text-red-500">
                Hotline
              </p>
              <h4 className="mt-2 text-lg font-bold text-red-700">
                1900.5301 · 24/7
              </h4>
              <p className="text-sm text-red-600">
                Nhắn Zalo hoặc chat với Support ngay.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 text-lg font-bold">
              <span>PC bán chạy</span>
              <span className="text-sm font-medium text-red-500">
                Trả góp 0%
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              {["PC i3", "PC i5", "PC i7", "PC i9"].map((tab) => (
                <button
                  key={tab}
                  className="rounded-full border border-slate-200 px-4 py-1 transition hover:border-red-500 hover:text-red-500"
                >
                  {tab}
                </button>
              ))}
              <button className="text-red-600">Xem tất cả</button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto pb-4">
            <div className="flex min-w-full gap-5">
              {bestSellerPCs.map((pc) => (
                <div
                  key={pc.name}
                  className="flex w-[260px] flex-shrink-0 flex-col rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-1 hover:border-red-500"
                >
                  <div className="h-32 rounded-xl bg-slate-100" />
                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    {pc.name}
                  </p>
                  <div className="mt-2 text-lg font-bold text-red-600">
                    {pc.price}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="line-through">{pc.oldPrice}</span>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-600">
                      {pc.discount}
                    </span>
                  </div>
                  <button className="mt-4 rounded-full border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white">
                    Thêm vào giỏ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Laptop gaming bán chạy
              </p>
              <h3 className="text-2xl font-bold">Miễn phí giao hàng</h3>
            </div>
            <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
              {["ASUS", "ACER", "MSI", "LENOVO", "GIGABYTE", "DELL"].map(
                (brand) => (
                  <button
                    key={brand}
                    className="rounded-full border border-slate-200 px-4 py-1 transition hover:border-red-500 hover:text-red-500"
                  >
                    {brand}
                  </button>
                )
              )}
              <button className="text-red-600">Xem tất cả</button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto pb-4">
            <div className="flex min-w-full gap-5">
              {gamingLaptops.map((laptop) => (
                <div
                  key={laptop.name}
                  className="w-[240px] flex-shrink-0 rounded-2xl border border-slate-100 p-4 text-center"
                >
                  <div className="h-40 rounded-xl bg-slate-100" />
                  <p className="mt-3 text-sm font-semibold text-red-500">
                    {laptop.brand}
                  </p>
                  <p className="text-base font-semibold">{laptop.name}</p>
                  <p className="mt-2 text-lg font-bold text-red-600">
                    {laptop.price}
                  </p>
                  <button className="mt-4 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-500 hover:text-red-600">
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Chuyên trang khuyến mãi</h3>
              <button className="text-sm font-semibold text-red-600">
                Xem tất cả
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {promos.map((promo) => (
                <div
                  key={promo.title}
                  className="rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-1 hover:border-red-500"
                >
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {promo.tag}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {promo.title}
                  </p>
                  <p className="text-sm text-slate-600">{promo.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">
              Hỗ trợ khách hàng
            </p>
            <h3 className="text-xl font-bold">Đội hỗ trợ luôn sẵn sàng 24/7</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hotline, Zalo, và chat bot tự động được đồng bộ lịch sử, giúp kỹ
              thuật viên tiếp nhận nhanh chóng.
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p>• Tổng đài mua hàng: 1900.5301</p>
              <p>• Kỹ thuật bảo hành: 1900.5325</p>
              <p>• Khiếu nại & VIP care: 1800.6173</p>
            </div>
            <button className="mt-5 w-full rounded-full bg-red-500 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200">
              Chat với Support
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;
