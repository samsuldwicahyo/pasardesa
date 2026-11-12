import { CreateTenantForm } from "@/components/forms/create-tenant-form";
import { MetricCard } from "@/components/ui/metric-card";
import { requireRole } from "@/lib/auth";
import { getSuperAdminMetrics } from "@/modules/dashboard/service";
import { listTenantsWithStats } from "@/modules/tenants/service";

export const dynamic = "force-dynamic";

export default async function SuperAdminTenantsPage() {
  await requireRole(["SUPER_ADMIN"]);

  const [metrics, tenants] = await Promise.all([
    getSuperAdminMetrics(),
    listTenantsWithStats(),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tenant" value={metrics.tenantCount} />
        <MetricCard label="Seller" value={metrics.sellerCount} />
        <MetricCard label="Produk" value={metrics.productCount} />
        <MetricCard label="Order" value={metrics.orderCount} />
      </section>

      <CreateTenantForm />

      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Tenant aktif
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Daftar tenant</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tenants.map((tenant) => (
            <article key={tenant.id} className="panel rounded-[1.6rem] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
                /pasar/{tenant.slug}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">{tenant.name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {tenant.description || "Belum ada deskripsi tenant."}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted">Seller</p>
                  <p className="font-semibold">{tenant._count.sellers}</p>
                </div>
                <div>
                  <p className="text-muted">Produk</p>
                  <p className="font-semibold">{tenant._count.products}</p>
                </div>
                <div>
                  <p className="text-muted">Order</p>
                  <p className="font-semibold">{tenant._count.orders}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
