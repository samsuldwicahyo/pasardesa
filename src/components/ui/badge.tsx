import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}
