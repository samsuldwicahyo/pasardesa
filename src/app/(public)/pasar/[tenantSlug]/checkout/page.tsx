import { notFound } from "next/navigation";

import { CheckoutClient } from "@/components/marketplace/checkout-client";
import { getMarketplaceByTenantSlug } from "@/modules/products/service";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const data = await getMarketplaceByTenantSlug(tenantSlug);

  if (!data) {
    notFound();
  }

  return <CheckoutClient tenant={data.tenant} products={data.products} />;
}
