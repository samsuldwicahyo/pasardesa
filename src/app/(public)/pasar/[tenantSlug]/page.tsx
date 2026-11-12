import { notFound } from "next/navigation";

import { MarketplaceClient } from "@/components/marketplace/marketplace-client";
import { getMarketplaceByTenantSlug } from "@/modules/products/service";

export const dynamic = "force-dynamic";

export default async function TenantMarketplacePage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const data = await getMarketplaceByTenantSlug(tenantSlug);

  if (!data) {
    notFound();
  }

  return <MarketplaceClient tenant={data.tenant} products={data.products} />;
}
