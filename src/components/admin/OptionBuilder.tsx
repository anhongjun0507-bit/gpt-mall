"use client";

import * as React from "react";
import { Plus, X, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductOption } from "@/types/database";

interface Props {
  value: ProductOption[];
  onChange: (v: ProductOption[]) => void;
}

// 동적 옵션 빌더 — 옵션명 + 값 칩들. Enter 로 값 추가.
// 예: 기간 [1개월][3개월][6개월]
export function OptionBuilder({ value, onChange }: Props) {
  function addOption() {
    onChange([...value, { name: "", values: [] }]);
  }

  function removeOption(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function updateName(idx: number, name: string) {
    onChange(value.map((o, i) => (i === idx ? { ...o, name } : o)));
  }

  function addValue(idx: number, raw: string) {
    const v = raw.trim();
    if (!v) return;
    onChange(
      value.map((o, i) =>
        i === idx && !o.values.includes(v)
          ? { ...o, values: [...o.values, v] }
          : o
      )
    );
  }

  function removeValue(idx: number, val: string) {
    onChange(
      value.map((o, i) =>
        i === idx ? { ...o, values: o.values.filter((x) => x !== val) } : o
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

          {/* 값 칩들 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {opt.values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-background border border-border text-sm"
              >
                {v}
                <button
                  type="button"
                  onClick={() => removeValue(idx, v)}
                  aria-label={`${v} 제거`}
                  className="text-muted-foreground hover:text-destructive transition-colors duration-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <ValueInput onAdd={(v) => addValue(idx, v)} />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addOption}>
        <Plus className="h-4 w-4 mr-1" />
        옵션 추가
      </Button>
    </div>
  );
}

// 칩 추가용 작은 인풋 — Enter 로 추가, blur 시 자동 추가.
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
      placeholder="값 입력 후 Enter"
      className="h-7 px-2 text-sm border border-dashed border-border rounded-md bg-transparent outline-none focus:border-accent-gold transition-colors duration-200 w-32"
    />
  );
}
