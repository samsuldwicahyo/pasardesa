import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "secondary" &&
          "border border-foreground/10 bg-surface text-foreground hover:bg-surface-strong",
        variant === "ghost" &&
          "bg-transparent text-foreground hover:bg-foreground/5",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-500",
        className,
      )}
      {...props}
    />
  );
}
