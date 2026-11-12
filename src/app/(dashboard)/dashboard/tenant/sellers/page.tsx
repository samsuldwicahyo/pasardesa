import { CreateSellerForm } from "@/components/forms/create-seller-form";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { listSellersForTenant } from "@/modules/sellers/service";

export const dynamic = "force-dynamic";

export default async function TenantSellersPage() {
  const session = await requireRole(["BUMDES_ADMIN"]);

  if (!session.user.tenantId) {
    throw new Error("Tenant admin tidak memiliki tenant aktif.");
  }

  const sellers = await listSellersForTenant(session.user.tenantId);

  return (
    <div className="space-y-6">
      <CreateSellerForm />

      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Seller tenant
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Daftar seller</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sellers.map((seller) => (
            <article key={seller.id} className="panel rounded-[1.6rem] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
                    {seller.slug}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">{seller.name}</h3>
                  <p className="mt-2 text-sm text-muted">{seller.user.email}</p>
                </div>
                <Badge>{seller.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted">
                {seller.description || "Belum ada deskripsi seller."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted">Produk</p>
                  <p className="font-semibold">{seller._count.products}</p>
                </div>
                <div>
                  <p className="text-muted">Order</p>
                  <p className="font-semibold">{seller._count.orders}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {seller.paymentOptions.map((option) => (
                  <Badge
                    key={option.id}
                    className={
                      option.isActive
                        ? "bg-primary/10"
                        : "bg-foreground/5 text-muted"
                    }
                  >
                    {option.type}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
