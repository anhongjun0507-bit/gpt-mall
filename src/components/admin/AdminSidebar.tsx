"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/products", label: "상품 관리", Icon: Package },
  { href: "/admin/orders", label: "주문 관리", Icon: ShoppingCart },
  { href: "/admin/users", label: "회원", Icon: Users },
];

// 정확 매칭 + 자식 경로 매칭 (예: /admin/products/new → 상품 관리 활성).
// "/admin" 자체는 정확 매칭만 (다른 admin/* 페이지에서 대시보드가 활성되지 않도록).
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-footer-bg text-footer-foreground flex flex-col">
      {/* 로고 영역 */}
      <div className="px-6 py-6 border-b border-footer-foreground/10">
        <div className="flex items-center gap-2">
          <span className="text-h4 font-extrabold tracking-tight">디지털스토어</span>
          <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-accent-gold font-semibold">
          Admin
        </p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-4">
        <ul className="flex flex-col">
          {ADMIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 border-l-2 transition-all duration-200",
                    active
                      ? "border-accent-gold bg-accent-gold/5 text-accent-gold"
                      : "border-transparent text-footer-foreground/70 hover:text-footer-foreground hover:bg-footer-foreground/5"
                  )}
                >
                  <item.Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 — 사이트로 돌아가기 */}
      <div className="px-6 py-5 border-t border-footer-foreground/10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-footer-foreground/60 hover:text-accent-gold transition-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          사이트로 돌아가기
        </Link>
      </div>
    </aside>
  );
}
