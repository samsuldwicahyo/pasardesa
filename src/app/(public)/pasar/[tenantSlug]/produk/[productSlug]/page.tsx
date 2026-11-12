import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/marketplace/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHOD_LABELS } from "@/lib/pasardesa";
import { formatRupiah } from "@/lib/utils";
import { getProductByTenantAndSlug } from "@/modules/products/service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
}) {
  const { tenantSlug, productSlug } = await params;
  const data = await getProductByTenantAndSlug(tenantSlug, productSlug);

  if (!data) {
    notFound();
  }

  const imageUrl = data.product.imageUrls[0];

  return (
    <div className="shell py-8">
      <div className="panel grid gap-8 rounded-[2rem] p-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-square overflow-hidden rounded-[1.6rem] bg-surface-strong">
          {imageUrl ? (
            <Image src={imageUrl} alt={data.product.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Tanpa gambar
            </div>
          )}
        </div>

        <div>
          <Link href={`/pasar/${tenantSlug}`} className="text-sm font-medium text-primary">
            Kembali ke marketplace
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            {data.product.sellerName}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">{data.product.name}</h1>
          <p className="mt-4 text-base leading-8 text-muted">
            {data.product.description || "Belum ada deskripsi produk."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {data.product.paymentMethods.map((method) => (
              <Badge key={method} className="bg-secondary/10 text-secondary">
                {PAYMENT_METHOD_LABELS[method]}
              </Badge>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-4xl font-semibold">{formatRupiah(data.product.price)}</p>
              <p className="mt-2 text-sm text-muted">Stok tersedia: {data.product.stock}</p>
            </div>
            <AddToCartButton tenantSlug={tenantSlug} productId={data.product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
