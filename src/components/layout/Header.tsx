"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  ShoppingBag,
  User,
  LogOut,
  Package,
  LayoutDashboard,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartBadge } from "@/components/product/CartBadge";
import type { CurrentAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "상품", href: "/products" },
  { label: "가이드", href: "/guide" },
  { label: "문의", href: "/contact" },
] as const;

interface HeaderProps {
  auth: CurrentAuth | null;
}

export function Header({ auth }: HeaderProps) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 ease-out",
        isScrolled
          ? "bg-header-bg backdrop-blur-md border-b border-border/40"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* ─── 좌측: 로고 ─── */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="디지털스토어 홈"
          >
            <span className="text-h4 font-extrabold tracking-tight text-foreground">
              디지털스토어
            </span>
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-accent-gold transition-gold group-hover:bg-accent-gold-hover"
            />
          </Link>

          {/* ─── 중앙: 데스크탑 네비 ─── */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="주요 메뉴"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-accent-gold transition-gold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ─── 우측 ─── */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* 검색 (desktop only) */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="검색"
              className="hidden md:inline-flex text-foreground hover:text-accent-gold hover:bg-transparent transition-gold"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* 장바구니 */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="장바구니"
              className="relative text-foreground hover:text-accent-gold hover:bg-transparent transition-gold"
              asChild
            >
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Link>
            </Button>

            {/* ─── 데스크탑: 로그인 상태 분기 ─── */}
            {auth ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="내 계정"
                    className="hidden md:inline-flex text-foreground hover:text-accent-gold hover:bg-transparent transition-gold"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-xs text-muted-foreground">로그인됨</p>
                    <p
                      className="text-sm font-medium truncate"
                      title={auth.email}
                    >
                      {auth.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <User className="h-4 w-4 mr-2" />
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <Package className="h-4 w-4 mr-2" />
                      주문내역
                    </Link>
                  </DropdownMenuItem>
                  {auth.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-accent-gold">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          관리자
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  {/* 로그아웃 — form POST. button asChild 로 DropdownMenuItem 스타일 유지. */}
                  <form action="/auth/signout" method="POST">
                    <DropdownMenuItem asChild>
                      <button
                        type="submit"
                        className="w-full cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 미로그인: "로그인" 버튼 (desktop)
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex h-9 text-sm font-medium hover:text-accent-gold hover:bg-transparent transition-gold"
              >
                <Link href="/login">로그인</Link>
              </Button>
            )}

            {/* ─── 모바일 햄버거 + Sheet ─── */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="메뉴 열기"
                  className="md:hidden text-foreground hover:text-accent-gold hover:bg-transparent transition-gold"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-sm flex flex-col gap-0 p-0"
              >
                {/* 상단 로고 */}
                <div className="flex h-16 items-center px-6 border-b border-border">
                  <span className="text-h4 font-extrabold tracking-tight">
                    디지털스토어
                  </span>
                  <span
                    aria-hidden
                    className="ml-2 w-1.5 h-1.5 rounded-full bg-accent-gold"
                  />
                </div>

                {/* 로그인 상태 카드 */}
                {auth && (
                  <div className="px-6 py-4 border-b border-border bg-secondary/30">
                    <p className="text-xs text-muted-foreground">로그인됨</p>
                    <p className="text-sm font-medium truncate" title={auth.email}>
                      {auth.email}
                    </p>
                    {auth.isAdmin && (
                      <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded-md bg-accent-gold/10 text-accent-gold text-xs font-semibold">
                        ADMIN
                      </span>
                    )}
                  </div>
                )}

                {/* 메뉴 링크 */}
                <nav
                  className="flex flex-col px-6 py-6 gap-5 flex-1"
                  aria-label="모바일 메뉴"
                >
                  {NAV_ITEMS.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className="text-h3 font-semibold hover:text-accent-gold transition-gold"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}

                  <div className="my-2 h-px bg-border" />

                  {auth ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/account"
                          className="text-body font-medium text-muted-foreground hover:text-accent-gold transition-gold flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          마이페이지
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/account/orders"
                          className="text-body font-medium text-muted-foreground hover:text-accent-gold transition-gold flex items-center gap-2"
                        >
                          <Package className="h-4 w-4" />
                          주문내역
                        </Link>
                      </SheetClose>
                      {auth.isAdmin && (
                        <SheetClose asChild>
                          <Link
                            href="/admin"
                            className="text-body font-medium text-accent-gold hover:text-accent-gold-hover transition-gold flex items-center gap-2"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            관리자
                          </Link>
                        </SheetClose>
                      )}
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        href="/products"
                        className="text-body font-medium text-muted-foreground hover:text-accent-gold transition-gold"
                      >
                        검색
                      </Link>
                    </SheetClose>
                  )}
                </nav>

                {/* 하단 CTA */}
                <div className="px-6 py-6 border-t border-border flex flex-col gap-3">
                  {auth ? (
                    <form action="/auth/signout" method="POST">
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </Button>
                    </form>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild className="w-full" size="lg">
                          <Link href="/login">로그인</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full" size="lg">
                          <Link href="/signup">회원가입</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  );
}
