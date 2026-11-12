import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-foreground/10 bg-white/90 px-4 py-3 text-sm text-foreground",
        className,
      )}
      {...props}
    />
  );
}
