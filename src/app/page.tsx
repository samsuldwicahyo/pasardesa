import Link from "next/link";

import { listActiveTenants } from "@/modules/tenants/service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tenants = await listActiveTenants().catch(() => []);

  return (
    <main className="py-8 md:py-12">
      <section className="shell">
        <div className="panel overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-primary/15 bg-primary/8 px-4 py-2 font-mono text-xs uppercase tracking-[0.35em] text-primary">
                PasarDesa MVP
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Marketplace desa yang memisahkan tenant, seller, order, dan
                  dashboard dalam satu aplikasi.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted">
                  PasarDesa dirancang untuk BUMDes yang ingin menjalankan
                  marketplace lokal per desa, dengan checkout tamu, pembayaran
                  manual, dan alur WhatsApp per seller.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] hover:bg-primary/90"
                  href="/dashboard"
                >
                  Masuk Dashboard
                </Link>
                <Link
                  className="inline-flex items-center justify-center rounded-full border border-foreground/10 bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:translate-y-[-1px]"
                  href="#tenants"
                >
                  Jelajah Tenant
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Multi-tenant", "Satu aplikasi, banyak desa, data tetap terisolasi."],
                ["Split order", "Cart campur seller dipecah menjadi order per seller."],
                ["Manual payment", "Bukti bayar bank transfer dan QRIS direview admin atau seller."],
                ["Dashboard role-based", "SUPER_ADMIN, BUMDES_ADMIN, dan SELLER punya area kerja sendiri."],
              ].map(([title, body]) => (
                <article
                  key={title}
                  className="rounded-3xl border border-foreground/8 bg-white/80 p-5"
                >
                  <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
                    {title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tenants" className="shell mt-10 space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-secondary">
              Tenant aktif
            </p>
            <h2 className="mt-2 text-3xl font-semibold">Marketplace per desa</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Tenant yang sudah aktif akan muncul di sini. Jika daftar masih
            kosong, jalankan seed dan buat tenant pertama dari dashboard super
            admin.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenants.length > 0 ? (
            tenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/pasar/${tenant.slug}`}
                className="panel rounded-[1.5rem] p-6 transition hover:-translate-y-1"
              >
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-secondary">
                  /pasar/{tenant.slug}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{tenant.name}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {tenant.description || "Belum ada deskripsi tenant."}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm text-muted">
                  <span>{tenant.contactPhone || "Kontak belum diisi"}</span>
                  <span className="rounded-full bg-primary/8 px-3 py-1 font-medium text-primary">
                    Buka tenant
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="panel rounded-[1.5rem] border-dashed p-8 text-sm leading-6 text-muted md:col-span-2 xl:col-span-3">
              Belum ada tenant aktif. Masuk sebagai super admin untuk membuat
              tenant pertama.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
