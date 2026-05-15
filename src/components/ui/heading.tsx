import * as React from "react";

import { cn } from "@/lib/utils";

// 시각적 사이즈(variant)와 시맨틱 태그(as)를 분리.
// 예: <Heading variant="display" as="h1"> → 시맨틱은 h1, 스타일은 display
type HeadingVariant = "display" | "h1" | "h2" | "h3" | "h4";
type HeadingAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

// variant → globals.css @layer utilities 의 시맨틱 유틸 클래스
const variantClass: Record<HeadingVariant, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

// variant의 기본 시맨틱 태그. display는 페이지 최상위 제목으로 가정 → h1.
const defaultTag: Record<HeadingVariant, HeadingAs> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
};

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeadingVariant;
  as?: HeadingAs;
}

const Heading = React.forwardRef<HTMLElement, HeadingProps>(
  ({ variant = "h2", as, className, ...props }, ref) => {
    const Component = (as ?? defaultTag[variant]) as React.ElementType;
    return (
      <Component
        ref={ref}
        className={cn(variantClass[variant], className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

export { Heading };
