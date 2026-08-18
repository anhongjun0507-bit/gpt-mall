// og.svg → public/og.png 일회성 변환 스크립트.
// 빌드 파이프라인에 연결하지 않는다 — og.svg 를 수정했을 때만 수동 실행:
//   node scripts/generate-og.mjs
// SVG 의 <text> 에 한글이 있어 Noto Sans CJK KR 로 렌더한다
// (로컬 실행 전 `sudo apt-get install -y fonts-noto-cjk` 필요).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "og.svg"), "utf-8");

const resvg = new Resvg(svg, {
  // og.svg 는 1200x630 고정. viewBox 그대로 렌더.
  fitTo: { mode: "width", value: 1200 },
  font: {
    // 시스템 폰트(설치된 Noto CJK 포함) 로드 후, SVG 의 sans-serif 매칭 실패 시
    // 한글을 그릴 수 있는 Noto Sans CJK KR 로 폴백.
    loadSystemFonts: true,
    defaultFontFamily: "Noto Sans CJK KR",
  },
});

const png = resvg.render().asPng();
const out = join(root, "public", "og.png");
writeFileSync(out, png);

const kb = (png.length / 1024).toFixed(1);
console.log(`✓ public/og.png 생성 완료 — ${kb}KB (1200x630)`);
if (png.length > 200 * 1024) {
  console.warn(`⚠ 200KB 초과(${kb}KB) — SVG 단순화 검토`);
}
