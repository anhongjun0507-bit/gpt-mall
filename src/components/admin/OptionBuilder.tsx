"use client";

import * as React from "react";
import { Plus, X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductOption, ProductOptionValue } from "@/types/database";

interface Props {
  value: ProductOption[];
  onChange: (v: ProductOption[]) => void;
  // 절대 가격 미리보기용 기본 가격 (products.price). 옵션 modifier 와 합산해 표시.
  basePrice: number;
}

const formatKRW = (v: number) => `₩${v.toLocaleString("ko-KR")}`;
const formatSignedKRW = (v: number) =>
  v >= 0
    ? `+${v.toLocaleString("ko-KR")}원`
    : `${v.toLocaleString("ko-KR")}원`;

// 동적 옵션 빌더 — 옵션명 + 값(label + price_modifier).
// label 은 Enter 로 추가, 추가 후 우측 modifier 입력란에서 추가 가격 설정.
// 음수도 허용되지만 UI 안내는 양수 권장.
export function OptionBuilder({ value, onChange, basePrice }: Props) {
  function addOption() {
    onChange([...value, { name: "", values: [] }]);
  }

  function removeOption(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function updateName(idx: number, name: string) {
    onChange(value.map((o, i) => (i === idx ? { ...o, name } : o)));
  }

  function addValue(idx: number, rawLabel: string) {
    const label = rawLabel.trim();
    if (!label) return;
    onChange(
      value.map((o, i) =>
        i === idx && !o.values.some((v) => v.label === label)
          ? {
              ...o,
              values: [...o.values, { label, price_modifier: 0 }],
            }
          : o
      )
    );
  }

  function updateModifier(idx: number, label: string, modifier: number) {
    onChange(
      value.map((o, i) =>
        i === idx
          ? {
              ...o,
              values: o.values.map((v) =>
                v.label === label ? { ...v, price_modifier: modifier } : v
              ),
            }
          : o
      )
    );
  }

  function removeValue(idx: number, label: string) {
    onChange(
      value.map((o, i) =>
        i === idx
          ? { ...o, values: o.values.filter((v) => v.label !== label) }
          : o
      )
    );
  }

  return (
    <div className="space-y-4">
      {value.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          옵션 없음. 기간/플랜 같은 선택지를 추가하려면 아래 버튼을 누르세요.
        </p>
      )}

      {value.map((opt, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border/60 bg-secondary/30 p-4"
        >
          <div className="flex gap-3 items-start">
            <Input
              placeholder="옵션명 (예: 기간)"
              value={opt.name}
              onChange={(e) => updateName(idx, e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeOption(idx)}
              aria-label={`옵션 ${idx + 1} 삭제`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* 값 + modifier 리스트 */}
          {opt.values.length > 0 && (
            <ul className="mt-3 space-y-2">
              {opt.values.map((v) => (
                <OptionValueRow
                  key={v.label}
                  value={v}
                  basePrice={basePrice}
                  onChange={(mod) => updateModifier(idx, v.label, mod)}
                  onRemove={() => removeValue(idx, v.label)}
                />
              ))}
            </ul>
          )}

          {/* 신규 라벨 입력 */}
          <div className="mt-3">
            <ValueInput onAdd={(v) => addValue(idx, v)} />
          </div>
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        ※ <span className="font-semibold">price_modifier</span> 는 기본 가격(
        {formatKRW(basePrice)}) 에 더하는 금액. 양수 권장 (음수 입력 시 할인
        옵션으로 동작).
      </p>

      <Button type="button" variant="outline" onClick={addOption}>
        <Plus className="h-4 w-4 mr-1" />
        옵션 추가
      </Button>
    </div>
  );
}

// 옵션 값 한 줄 — label · +가격 입력 · 절대 가격 미리보기 · 삭제.
function OptionValueRow({
  value,
  basePrice,
  onChange,
  onRemove,
}: {
  value: ProductOptionValue;
  basePrice: number;
  onChange: (modifier: number) => void;
  onRemove: () => void;
}) {
  const [raw, setRaw] = React.useState(String(value.price_modifier));

  React.useEffect(() => {
    setRaw(String(value.price_modifier));
  }, [value.price_modifier]);

  function commit(s: string) {
    // 숫자/음수 허용, 빈 값은 0
    if (s.trim() === "" || s.trim() === "-") {
      onChange(0);
      setRaw("0");
      return;
    }
    const n = parseInt(s.replace(/[^\d-]/g, ""), 10);
    onChange(Number.isFinite(n) ? n : 0);
  }

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-md bg-background border border-border px-3 py-2">
      <span className="text-sm font-medium min-w-0 truncate">
        {value.label}
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <div className="flex items-center gap-1">
        <Input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit((e.target as HTMLInputElement).value);
            }
          }}
          className="h-8 w-24 text-sm"
          placeholder="0"
        />
        <span className="text-xs text-muted-foreground">원</span>
      </div>
      <span className="ml-auto text-xs text-muted-foreground tabular-nums">
        {value.price_modifier !== 0 && (
          <span className="mr-2">{formatSignedKRW(value.price_modifier)}</span>
        )}
        → {formatKRW(basePrice + value.price_modifier)}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${value.label} 제거`}
        className="text-muted-foreground hover:text-destructive transition-colors duration-200"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function ValueInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [v, setV] = React.useState("");
  function commit() {
    if (v.trim()) {
      onAdd(v.trim());
      setV("");
    }
  }
  return (
    <input
      type="text"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      onBlur={commit}
      placeholder="옵션 값 입력 후 Enter (예: 3개월)"
      className="h-8 px-3 text-sm border border-dashed border-border rounded-md bg-transparent outline-none focus:border-accent-gold transition-colors duration-200 w-64"
    />
  );
}
