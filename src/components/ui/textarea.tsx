import * as React from "react";

import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-foreground/10 bg-white/90 px-4 py-3 text-sm text-foreground placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
}
