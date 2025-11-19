import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Headphones,
  ClipboardList,
  ShoppingCart,
  Menu,
  Search,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navLinks = [
  "Mua PC tặng màn 240Hz",
  "Hot Deal | Laptop",
  "Tin tức",
  "Dịch vụ kỹ thuật tại nhà",
  "Thu cũ đổi mới",
  "Tra cứu bảo hành",
];

const categories = [
  "Laptop văn phòng",
  "Laptop gaming",
  "PC GVN",
  "Main, CPU, VGA",
  "Case, nguồn, tản",
  "Ổ cứng, RAM, thẻ nhớ",
  "Chuột & bàn phím",
  "Màn hình & TV",
  "Tai nghe & loa",
  "Bàn, ghế gaming",
  "Handheld, Console",
  "Phụ kiện (Hub, sac... )",
  "Dịch vụ & thông tin khác",
];

const quickActions: Array<{
  label: string;
  value?: string;
  icon: LucideIcon;
  highlight?: boolean;
}> = [
  { label: "Tra cứu đơn hàng", icon: ClipboardList },
  { label: "Giỏ hàng", icon: ShoppingCart, highlight: true },
];

function Header() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(
    () => new URLSearchParams(location.search).get("q") ?? ""
  );

  useEffect(() => {
    setSearchTerm(new URLSearchParams(location.search).get("q") ?? "");
  }, [location.search]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-red-600 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg bg-white/10 px-3 py-2 text-2xl font-black text-white"
            onClick={() => navigate("/")}
            aria-label="Trackifi Home"
          >
            T
          </button>
          <div>
            <p className="text-sm font-semibold">TRACKIFI.com</p>
            <p className="text-xs text-white/80">Laptop & PC chuyên sâu</p>
          </div>
        </div>

        <div
          className="relative hidden md:block"
          onMouseEnter={() => setIsCategoryOpen(true)}
          onMouseLeave={() => setIsCategoryOpen(false)}
        >
          <button
            className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25"
            aria-expanded={isCategoryOpen}
          >
            <Menu className="h-4 w-4" />
            Danh mục
          </button>
          {isCategoryOpen && (
            <div className="absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-white/30 bg-white p-4 text-slate-900 shadow-2xl">
              <p className="text-xs font-semibold uppercase text-slate-400">
                Danh mục nổi bật
              </p>
              <ul className="mt-3 space-y-1 text-sm font-medium text-slate-700">
                {categories.map((category) => (
                  <li
                    key={category}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <span>{category}</span>
                    <span className="text-slate-300">›</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-[200px] flex-1 items-center rounded-full bg-white px-4 py-2 text-slate-700"
        >
          <input
            type="text"
            placeholder="Bạn cần tìm gì?"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-red-600 p-2 text-white hover:bg-red-500"
            aria-label="Tìm kiếm"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          {quickActions.map((item) => (
            <button
              key={item.label}
              className="flex min-w-[150px] items-center gap-3 rounded-2xl bg-white/10 px-3 py-2 text-left transition hover:bg-white/20"
            >
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/10">
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-red-700 shadow">
                    0
                  </span>
                )}
              </span>
              <span className="flex flex-col text-sm font-semibold leading-tight">
                <span>{item.label}</span>
                {item.value && (
                  <span className="text-xs font-bold text-white">
                    {item.value}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>

        {user ? (
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 font-bold text-red-600">
              {user.firstName?.[0]?.toUpperCase() || "U"}
            </span>
            <span>Hồ sơ</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-inner hover:bg-white/25"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>Đăng nhập</span>
          </button>
        )}
      </div>

      <div className="bg-white text-slate-700">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-4 py-2 text-sm font-semibold lg:px-6">
          <Link to="/" className="text-slate-700 transition hover:text-red-600">
            Danh mục
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link}
              to="/"
              className="text-slate-700 transition hover:text-red-600"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
