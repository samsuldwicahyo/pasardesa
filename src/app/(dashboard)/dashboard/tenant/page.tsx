import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { getTenantDashboardStats } from "@/modules/dashboard/service";
import { getTenantById } from "@/modules/tenants/service";
import { updateTenantProfileAction } from "@/app/(dashboard)/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function TenantDashboardPage() {
  const session = await requireRole(["BUMDES_ADMIN"]);

  if (!session.user.tenantId) {
    throw new Error("Tenant admin tidak memiliki tenant aktif.");
  }

  const [tenant, stats] = await Promise.all([
    getTenantById(session.user.tenantId),
    getTenantDashboardStats(session.user.tenantId),
  ]);

  if (!tenant) {
    throw new Error("Tenant tidak ditemukan.");
  }

  return (
    <div className="space-y-6">
      <section className="panel rounded-[2rem] p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Tenant overview
        </p>
        <h1 className="mt-2 text-4xl font-semibold">{tenant.name}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          {tenant.description ||
            "Lengkapi profil tenant agar buyer melihat kontak dan konteks desa yang lebih jelas."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Seller" value={stats.sellerCount} />
        <MetricCard label="Produk" value={stats.productCount} />
        <MetricCard label="Order" value={stats.orderCount} />
        <MetricCard label="Omzet" value={stats.omzet} currency />
      </section>

      <form action={updateTenantProfileAction} className="panel rounded-[1.6rem] p-6 space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Profil tenant
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Perbarui informasi publik</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="contactPhone"
            placeholder="Kontak tenant"
            defaultValue={tenant.contactPhone || ""}
          />
          <Input
            name="contactEmail"
            type="email"
            placeholder="Email tenant"
            defaultValue={tenant.contactEmail || ""}
          />
        </div>
        <Textarea
          name="description"
          placeholder="Deskripsi tenant"
          defaultValue={tenant.description || ""}
        />
        <Textarea
          name="address"
          placeholder="Alamat tenant"
          defaultValue={tenant.address || ""}
        />
        <Button type="submit">Simpan profil tenant</Button>
      </form>

      <ChangePasswordForm mustChangePassword={session.user.mustChangePassword} />
    </div>
  );
}
