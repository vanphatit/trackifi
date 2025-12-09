import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
  contentClassName?: string;
}

/**
 * Shared site shell that ensures every page keeps the same header, footer, and background.
 */
export default function AppLayout({
  children,
  contentClassName = "mx-auto max-w-6xl px-4 py-10 lg:px-8",
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 text-slate-900">
      <Header />
      <main className={contentClassName}>{children}</main>
      <Footer />
    </div>
  );
}
