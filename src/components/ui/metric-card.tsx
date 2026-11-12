import { formatRupiah } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  currency?: boolean;
};

export function MetricCard({ label, value, currency = false }: MetricCardProps) {
  return (
    <article className="panel rounded-[1.4rem] p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-foreground">
        {currency ? formatRupiah(value) : new Intl.NumberFormat("id-ID").format(value)}
      </p>
    </article>
  );
}
