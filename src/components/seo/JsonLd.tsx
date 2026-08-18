// JSON-LD 구조화 데이터 주입 헬퍼.
// dangerouslySetInnerHTML 를 쓰는 이유: <script> 안의 JSON 은 React 가
// 텍스트로 이스케이프해버려 그대로 넣으면 파서가 읽지 못한다.
// 대신 "<" 를 유니코드 이스케이프해 </script> 조기 종료(XSS)를 차단한다.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
