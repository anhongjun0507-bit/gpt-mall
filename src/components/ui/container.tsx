import * as React from "react";

import { cn } from "@/lib/utils";

// 페이지 가로 폭 제한 + 반응형 좌우 패딩. 의미 없는 래퍼이므로 단순 div.
const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)}
      {...props}
    />
  )
);
Container.displayName = "Container";

export { Container };
