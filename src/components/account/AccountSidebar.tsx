"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  KeyRound,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const ACCOUNT_NAV: NavItem[] = [
  { href: "/account", label: "마이페이지", Icon: LayoutDashboard },
  { href: "/account/orders", label: "주문 내역", Icon: ShoppingBag },
  { href: "/account/profile", label: "개인정보", Icon: User },
  { href: "/account/password", label: "비밀번호 변경", Icon: KeyRound },
];

// 정확 매칭 + 자식 경로 매칭. "/account" 자체는 정확 매칭만 — 다른 /account/*
// 페이지에서 "마이페이지" 가 active 로 잡히지 않도록.
function isActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside>
      {/* 모바일 (lg 미만): 가로 스크롤 칩 — 끝에 로그아웃 form */}
      <nav className="lg:hidden overflow-x-auto -mx-4 px-4">
        <ul className="flex items-center gap-2 pb-3 border-b border-border whitespace-nowrap">
          {ACCOUNT_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-accent-gold/10 text-accent-gold font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="ml-auto pl-2">
            <form action="/auth/signout" method="post" className="inline">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                로그아웃
              </button>
            </form>
          </li>
        </ul>
      </nav>

      {/* lg 이상: 세로 사이드바 */}
      <nav className="hidden lg:block">
        <ul className="flex flex-col">
          {ACCOUNT_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 border-l-2 transition-all duration-200",
                    active
                      ? "border-accent-gold bg-accent-gold/5 text-accent-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                  )}
                >
                  <item.Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* 구분선 + 로그아웃 (form POST — signout route) */}
        <div className="mt-2 pt-2 border-t border-border">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 border-l-2 border-transparent text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
