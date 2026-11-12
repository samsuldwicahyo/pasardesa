import { ProductStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber, slugify } from "@/lib/utils";
import { createProductSchema } from "@/modules/products/schemas";
import type { MarketplaceProduct } from "@/types/domain";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function getMarketplaceByTenantSlug(tenantSlug: string) {
  const tenant = await db.tenant.findFirst({
    where: { slug: tenantSlug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      contactPhone: true,
      contactEmail: true,
      address: true,
    },
  });

  if (!tenant) {
    return null;
  }

  const products = await db.product.findMany({
    where: {
      tenantId: tenant.id,
      status: ProductStatus.PUBLISHED,
      seller: { isActive: true },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      seller: {
        include: {
          paymentOptions: {
            where: { isActive: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mappedProducts: MarketplaceProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: decimalToNumber(product.price),
    stock: product.stock,
    status: product.status,
    sellerId: product.sellerId,
    sellerName: product.seller.name,
    sellerSlug: product.seller.slug,
    sellerWhatsappNumber: product.seller.whatsappNumber,
    imageUrl: product.images[0]?.imageUrl ?? null,
    paymentMethods: product.seller.paymentOptions.map((option) => option.type),
  }));

  return {
    tenant,
    products: mappedProducts,
  };
}

export async function getProductByTenantAndSlug(
  tenantSlug: string,
  productSlug: string,
) {
  const tenant = await db.tenant.findFirst({
    where: { slug: tenantSlug, isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    return null;
  }

  const product = await db.product.findFirst({
    where: {
      tenantId: tenant.id,
      slug: productSlug,
      status: ProductStatus.PUBLISHED,
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      seller: {
        include: {
          paymentOptions: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    tenant,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: decimalToNumber(product.price),
      stock: product.stock,
      sellerId: product.sellerId,
      sellerName: product.seller.name,
      sellerSlug: product.seller.slug,
      imageUrls: product.images.map((image) => image.imageUrl),
      paymentMethods: product.seller.paymentOptions.map((option) => option.type),
    },
  };
}

export async function listProductsForSeller(sellerId: string) {
  return db.product.findMany({
    where: { sellerId },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProduct(
  sellerId: string,
  tenantId: string,
  input: unknown,
  image?: { url: string; publicId: string | null },
) {
  const parsed = createProductSchema.parse(input);
  const slug = slugify(parsed.slug || parsed.name);

  return db.product.create({
    data: {
      sellerId,
      tenantId,
      name: parsed.name.trim(),
      slug,
      description: normalizeOptionalText(parsed.description),
      sku: normalizeOptionalText(parsed.sku),
      price: parsed.price,
      stock: parsed.stock,
      status: parsed.status,
      images: image
        ? {
            create: {
              imageUrl: image.url,
              cloudinaryPublicId: image.publicId,
              altText: normalizeOptionalText(parsed.imageAltText),
            },
          }
        : undefined,
    },
  });
}
