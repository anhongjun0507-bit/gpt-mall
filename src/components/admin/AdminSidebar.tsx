"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  Menu,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

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

// 사이드바 내부 — 데스크탑 고정 / 모바일 drawer 양쪽에서 재사용.
function SidebarBody({
  pathname,
  onItemClick,
}: {
  pathname: string;
  onItemClick?: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-footer-bg text-footer-foreground">
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
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col">
          {ADMIN_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
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
          onClick={onItemClick}
          className="inline-flex items-center gap-2 text-sm text-footer-foreground/60 hover:text-accent-gold transition-gold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          사이트로 돌아가기
        </Link>
      </div>
    </div>
  );
}

// 데스크탑(lg+) — 좌측 고정 사이드바.
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col">
      <SidebarBody pathname={pathname} />
    </aside>
  );
}

// 모바일(< lg) — 상단 sticky 헤더(로고 + 햄버거). 햄버거 클릭 시 좌측 drawer.
export function AdminMobileHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // 라우트 변경 시 자동 닫힘 보강 (Link onClick 으로도 닫지만 안전망).
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 h-14 bg-footer-bg text-footer-foreground border-b border-footer-foreground/10">
      <Link href="/admin" className="flex items-center gap-2 min-w-0">
        <span className="text-base font-extrabold tracking-tight truncate">디지털스토어</span>
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent-gold shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-gold font-semibold shrink-0">
          Admin
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="메뉴 열기"
          className="inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-md text-footer-foreground/80 hover:text-accent-gold focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-72 max-w-[80vw] border-r-0 bg-footer-bg"
        >
          <SheetTitle className="sr-only">관리자 메뉴</SheetTitle>
          <SidebarBody pathname={pathname} onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
