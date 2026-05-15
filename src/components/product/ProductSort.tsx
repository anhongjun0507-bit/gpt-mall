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
        <Button variant="outline" size="sm" className="h-9 gap-2">
          {SORT_OPTIONS[value]}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(SORT_OPTIONS) as SortKey[]).map((k) => (
          <DropdownMenuItem key={k} onSelect={() => setSort(k)}>
            {SORT_OPTIONS[k]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
