const footerColumns = [
  {
    title: "Về Trackifi Laptop",
    links: ["Giới thiệu", "Tuyển dụng", "Liên hệ", "Showroom"],
  },
  {
    title: "Chính sách",
    links: [
      "Bảo hành tận nơi",
      "Chính sách giao hàng",
      "Chính sách bảo mật",
      "Đổi trả 30 ngày",
    ],
  },
  {
    title: "Thông tin",
    links: [
      "Hướng dẫn đặt hàng",
      "Hướng dẫn trả góp",
      "Tra cứu đơn & bảo hành",
      "Build PC theo yêu cầu",
    ],
  },
];

const contactChannels = [
  { label: "Mua hàng", value: "1900.5301" },
  { label: "Bảo hành", value: "1900.5325" },
  { label: "Khiếu nại", value: "1800.6173" },
  { label: "Email", value: "support@trackifi.shop" },
];

function Footer() {
  return (
    <footer className="bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[2fr,3fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-600 px-3 py-2 text-2xl font-black text-white">
                G
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">
                  Trackifi · Laptop Commerce
                </p>
                <p className="text-sm text-slate-600">
                  Hệ sinh thái laptop, PC, và dịch vụ hỗ trợ premium.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600">
              {contactChannels.map((channel) => (
                <p key={channel.label}>
                  <span className="font-semibold text-slate-900">
                    {channel.label}:
                  </span>{" "}
                  {channel.value}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {["Facebook", "YouTube", "TikTok", "Zalo", "Instagram"].map(
                (network) => (
                  <span
                    key={network}
                    className="rounded-full border border-slate-200 px-3 py-1"
                  >
                    {network}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="text-base font-bold text-slate-900">
                  {column.title}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {column.links.map((link) => (
                    <li key={link}>
                      <button className="text-left transition hover:text-red-600">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Trackifi Laptop Commerce. Just for education!!!
        </div>
      </div>
    </footer>
  );
}

export default Footer;
