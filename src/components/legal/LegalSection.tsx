// 약관·정책 페이지 공통 섹션 — 제목 + 본문(자식). 본문은 일반 텍스트
// 노드 또는 ol/ul. 디자인 토큰만 사용한다.
export function LegalSection({
  no,
  title,
  children,
}: {
  no?: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        {no !== undefined ? `제 ${no}조 · ` : null}
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
