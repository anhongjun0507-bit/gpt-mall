"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { stripNonDigits, formatNumber } from "@/lib/format";

interface Props {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  // 폼 라이브러리가 ref 를 forwarding 하지 않으므로 단순 placeholder. RHF 의 Controller 와 함께 사용.
}

// 가격 입력 — 입력 중에는 콤마 포맷으로 표시, 값은 number 로 저장.
// 빈 문자열 → null 로 정규화 (zod 가 nullable 처리).
export const PriceInput = React.forwardRef<HTMLInputElement, Props>(
  function PriceInput(
    { value, onChange, onBlur, placeholder, disabled, id },
    ref
  ) {
    const display = formatNumber(value ?? undefined);

    return (
      <div className="relative">
        <span
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
        >
          ₩
        </span>
        <Input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          value={display}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = stripNonDigits(e.target.value);
            onChange(raw === "" ? null : parseInt(raw, 10));
          }}
          className="pl-7 tabular-nums"
        />
      </div>
    );
  }
);
