import Image from "next/image";

import { CreateProductForm } from "@/components/forms/create-product-form";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { listProductsForSeller } from "@/modules/products/service";

export const dynamic = "force-dynamic";

export default async function SellerProductsPage() {
  const session = await requireRole(["SELLER"]);

  if (!session.user.sellerId) {
    throw new Error("Akun ini belum terhubung ke seller.");
  }

  const products = await listProductsForSeller(session.user.sellerId);

  return (
    <div className="space-y-6">
      <CreateProductForm />

      <section className="space-y-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Produk seller
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Daftar produk</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article key={product.id} className="panel rounded-[1.6rem] p-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-surface-strong">
                {product.images[0]?.imageUrl ? (
                  <Image
                    src={product.images[0].imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Tanpa gambar
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted">
                    {product.description || "Belum ada deskripsi produk."}
                  </p>
                </div>
                <Badge>{product.status}</Badge>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-2xl font-semibold">{formatRupiah(Number(product.price))}</p>
                <p className="text-sm text-muted">Stok: {product.stock}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
