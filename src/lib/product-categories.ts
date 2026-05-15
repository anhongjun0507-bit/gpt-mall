import type { ProductCategory } from "@/types/database";

// 카테고리 메타데이터 — DB 키 ↔ 화면 라벨 매핑.
// 한 곳에서만 관리해 필터/카드/상세에서 공유.
export const PRODUCT_CATEGORIES: ReadonlyArray<{
  key: ProductCategory;
  label: string;     // 한글 풀네임 — 카테고리 칩, 필터, 상세 등에서 사용
  shortLabel: string; // 영문 짧은 라벨 — 상품 카드의 카테고리 표시용
}> = [
  { key: "ai_assistant", label: "AI 어시스턴트", shortLabel: "AI Assistant" },
  { key: "ai_image",     label: "이미지",        shortLabel: "AI Image" },
  { key: "ai_coding",    label: "코딩",          shortLabel: "AI Coding" },
  { key: "ai_video",     label: "영상",          shortLabel: "AI Video" },
  { key: "ai_voice",     label: "음성",          shortLabel: "AI Voice" },
  { key: "productivity", label: "생산성",        shortLabel: "Productivity" },
];

export function getCategoryLabel(key: ProductCategory): string {
  return PRODUCT_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function getCategoryShortLabel(key: ProductCategory): string {
  return PRODUCT_CATEGORIES.find((c) => c.key === key)?.shortLabel ?? key;
}

export function isValidCategory(key: string): key is ProductCategory {
  return PRODUCT_CATEGORIES.some((c) => c.key === key);
}
