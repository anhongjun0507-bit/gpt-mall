"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 주문 목록 정렬 드롭다운. 변경 시 ?sort=... 만 갱신 (page 는 1 로 리셋).
export function OrderSort({ current }: { current: "asc" | "desc" }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "desc") {
      params.delete("sort"); // default
    } else {
      params.set("sort", value);
    }
    params.delete("page"); // 정렬 변경 시 페이지 리셋
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desc">최신순</SelectItem>
        <SelectItem value="asc">오래된순</SelectItem>
      </SelectContent>
    </Select>
  );
}
