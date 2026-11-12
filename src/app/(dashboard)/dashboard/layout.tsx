import Link from "next/link";

import type { UserRole } from "@prisma/client";

import { requireAuth } from "@/lib/auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const navigationByRole: Record<UserRole, Array<{ href: string; label: string }>> = {
  SUPER_ADMIN: [{ href: "/dashboard/super-admin/tenants", label: "Tenant" }],
  BUMDES_ADMIN: [
    { href: "/dashboard/tenant", label: "Overview" },
    { href: "/dashboard/tenant/sellers", label: "Seller" },
    { href: "/dashboard/tenant/orders", label: "Order" },
  ],
  SELLER: [
    { href: "/dashboard/seller", label: "Overview" },
    { href: "/dashboard/seller/products", label: "Produk" },
    { href: "/dashboard/seller/orders", label: "Order" },
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const navigation = navigationByRole[session.user.role];

  return (
    <div className="shell grid gap-6 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="panel h-fit rounded-[2rem] p-6 lg:sticky lg:top-6">
        <Badge>Dashboard</Badge>
        <h1 className="mt-4 text-3xl font-semibold">PasarDesa</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {session.user.name} · {session.user.role}
        </p>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-foreground/5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          <SignOutButton />
        </div>
      </aside>

      <main className="space-y-6">
        {session.user.mustChangePassword ? (
          <div className="panel rounded-[1.5rem] border border-secondary/20 bg-secondary/8 p-4 text-sm leading-6 text-foreground">
            Akun ini masih memakai password sementara. Ganti password dari
            halaman overview sebelum dipakai rutin.
          </div>
        ) : null}
        {children}
      </main>
    </div>
  );
}
