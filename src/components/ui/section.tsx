import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  // asChild=true 시 자식 요소가 Section의 className/props를 흡수.
  // 예: <Section asChild><article>...</article></Section>
  asChild?: boolean;
}

// 페이지 섹션 표준 수직 여백. 프리미엄 룩의 핵심은 충분한 호흡.
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "section";
    return (
      <Comp
        ref={ref}
        className={cn("py-16 md:py-24 lg:py-32", className)}
        {...props}
      />
    );
  }
);
Section.displayName = "Section";

export { Section };
