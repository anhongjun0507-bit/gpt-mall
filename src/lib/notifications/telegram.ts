// 텔레그램 봇 기반 운영자 주문 알림.
//
// 안전 처리:
//   - 토큰/chat_id 비어있으면 console.warn 만 찍고 즉시 종료 (noop)
//   - fetch 실패/타임아웃/비-200 응답 → console.error 만, 호출자에게 throw X
//   - timeout 5초 (AbortController)
//   - 사용자 입력값 (이름·요청사항·상품명) HTML escape — parse_mode=HTML 사용 시
//     <, >, & 들어가면 메시지 깨짐
//
// 호출 위치: src/app/(shop)/checkout/actions.ts createOrder() 의 insert 성공 직후.
// 결제 가맹 승인 후에는 markOrderPaid() 등에서도 재사용 가능.

interface OrderItemForNotify {
  product_name: string;
  qty: number;
}

export interface NotifyOrderCreatedInput {
  orderNumber: string;
  total: number;
  recipientName: string;
  recipientPhone: string;
  paymentMethodLabel: string;
  items: OrderItemForNotify[];
  memo?: string | null;
  adminUrl?: string;
}

const TELEGRAM_API_BASE = "https://api.telegram.org";
const FETCH_TIMEOUT_MS = 5_000;

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatOrderMessage(opts: NotifyOrderCreatedInput): string {
  const lines: string[] = [];
  lines.push("🛒 <b>새 주문 접수</b>");
  lines.push("");
  lines.push(`<b>주문번호</b>: <code>${escapeHtml(opts.orderNumber)}</code>`);
  lines.push(`<b>결제금액</b>: ₩${opts.total.toLocaleString("ko-KR")}`);
  lines.push(`<b>결제수단</b>: ${escapeHtml(opts.paymentMethodLabel)}`);
  lines.push("");
  lines.push(`<b>주문자</b>: ${escapeHtml(opts.recipientName)}`);
  lines.push(`<b>휴대전화</b>: ${escapeHtml(opts.recipientPhone)}`);
  lines.push("");
  lines.push("<b>주문 상품</b>");
  for (const it of opts.items) {
    lines.push(`• ${escapeHtml(it.product_name)} × ${it.qty}`);
  }
  if (opts.memo && opts.memo.trim()) {
    lines.push("");
    lines.push("<b>요청사항</b>");
    lines.push(escapeHtml(opts.memo.trim()));
  }
  if (opts.adminUrl) {
    lines.push("");
    lines.push(`<a href="${escapeHtml(opts.adminUrl)}">관리자 페이지 열기</a>`);
  }
  return lines.join("\n");
}

export async function notifyOrderCreated(
  input: NotifyOrderCreatedInput
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID 미설정 — 알림 스킵"
    );
    return;
  }

  const text = formatOrderMessage(input);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      let body = "";
      try {
        body = (await res.text()).slice(0, 300);
      } catch {
        /* ignore */
      }
      console.error(
        `[telegram] sendMessage 응답 ${res.status} ${res.statusText} ${body}`
      );
      return;
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      console.error(`[telegram] sendMessage 타임아웃 (${FETCH_TIMEOUT_MS}ms)`);
    } else {
      console.error("[telegram] sendMessage 실패", e);
    }
  } finally {
    clearTimeout(timer);
  }
}
