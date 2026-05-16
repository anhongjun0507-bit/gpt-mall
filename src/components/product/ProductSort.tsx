"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SORT_OPTIONS = {
  latest: "최신순",
  price_asc: "가격 낮은순",
  price_desc: "가격 높은순",
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export function ProductSort({ value }: { value: SortKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setSort(s: SortKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (s === "latest") {
      params.delete("sort"); // 기본값은 URL 정리
    } else {
      params.set("sort", s);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          // 펼침 셀렉트라는 신호 강화 — 좌측 "정렬" 라벨 + 강조된 chevron.
          className="h-9 gap-1.5 pl-3 pr-2 font-medium border-border/80 hover:border-foreground/50 data-[state=open]:border-foreground/60 data-[state=open]:bg-secondary/60"
          aria-label={`정렬: ${SORT_OPTIONS[value]}`}
        >
          <span className="text-muted-foreground">정렬</span>
          <span aria-hidden className="text-muted-foreground/40">·</span>
          <span>{SORT_OPTIONS[value]}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {(Object.keys(SORT_OPTIONS) as SortKey[]).map((k) => {
          const isActive = k === value;
          return (
            <DropdownMenuItem
              key={k}
              onSelect={() => setSort(k)}
              className={isActive ? "bg-secondary font-semibold" : ""}
            >
              {SORT_OPTIONS[k]}
              {isActive && (
                <span className="ml-auto text-accent-gold" aria-hidden>
                  ✓
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
