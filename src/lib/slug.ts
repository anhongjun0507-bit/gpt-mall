// 한글이 섞인 상품명도 안전한 슬러그 생성.
// ASCII 알파넘 추출 → 빈 결과면 timestamp 기반 폴백.
export function generateSlug(name: string): string {
  const ascii = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // diacritics 제거
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (ascii.length === 0 || /^-+$/.test(ascii)) {
    return `prod-${Date.now()}`;
  }
  return ascii;
}
