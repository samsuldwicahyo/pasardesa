import {
  FulfillmentStatus,
  Prisma,
  ProductStatus,
  type UserRole,
} from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";
import {
  deriveOrderGroupStatus,
  generateReadableCode,
  getCommonPaymentMethods,
  getInitialPaymentStatus,
  groupItemsBySeller,
} from "@/modules/orders/helpers";
import {
  checkoutSchema,
  updateFulfillmentStatusSchema,
} from "@/modules/orders/schemas";
import type { OrderGroupView } from "@/types/domain";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

type DbLike = Prisma.TransactionClient | typeof db;

export async function syncOrderGroupStatus(database: DbLike, orderGroupId: string) {
  const orders = await database.order.findMany({
    where: { orderGroupId },
    select: {
      paymentStatus: true,
      paymentMethod: true,
      fulfillmentStatus: true,
    },
  });

  const status = deriveOrderGroupStatus(orders);

  await database.orderGroup.update({
    where: { id: orderGroupId },
    data: { status },
  });
}

export async function createPublicCheckout(input: unknown) {
  const parsed = checkoutSchema.parse(input);
  const tenant = await db.tenant.findFirst({
    where: { slug: parsed.tenantSlug, isActive: true },
    select: {
      id: true,
      slug: true,
      contactPhone: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant tidak ditemukan.");
  }

  const products = await db.product.findMany({
    where: {
      tenantId: tenant.id,
      status: ProductStatus.PUBLISHED,
      id: { in: parsed.items.map((item) => item.productId) },
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
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  if (productMap.size !== parsed.items.length) {
    throw new Error("Ada produk yang tidak lagi tersedia.");
  }

  const normalizedItems = parsed.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Produk tidak ditemukan.");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Stok ${product.name} tidak mencukupi.`);
    }

    return {
      productId: product.id,
      quantity: item.quantity,
      price: decimalToNumber(product.price),
      sellerId: product.sellerId,
      sellerName: product.seller.name,
      sellerWhatsappNumber: product.seller.whatsappNumber,
      sellerPaymentOptions: product.seller.paymentOptions,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.images[0]?.imageUrl ?? null,
    };
  });

  const commonMethods = getCommonPaymentMethods(
    Array.from(
      new Map(
        normalizedItems.map((item) => [
          item.sellerId,
          item.sellerPaymentOptions.map((option) => option.type),
        ]),
      ).values(),
    ),
  );

  if (!commonMethods.includes(parsed.paymentMethod)) {
    throw new Error(
      "Metode pembayaran yang dipilih tidak aktif di semua seller pada cart ini.",
    );
  }

  const groupedItems = groupItemsBySeller(normalizedItems);
  const orderGroupCode = generateReadableCode("PDG");

  const createdOrderGroup = await db.$transaction(async (tx) => {
    const subtotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const group = await tx.orderGroup.create({
      data: {
        tenantId: tenant.id,
        code: orderGroupCode,
        buyerName: parsed.buyer.name.trim(),
        buyerPhone: parsed.buyer.phone.trim(),
        buyerEmail: normalizeOptionalText(parsed.buyer.email),
        buyerAddress: parsed.buyer.address.trim(),
        buyerNote: normalizeOptionalText(parsed.buyer.note),
        paymentMethod: parsed.paymentMethod,
        subtotal,
        totalAmount: subtotal,
        status: "NEW",
      },
    });

    for (const [sellerId, sellerItems] of Object.entries(groupedItems)) {
      const orderCode = generateReadableCode("PDO");
      const seller = sellerItems[0];
      const subtotalPerSeller = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const paymentOption = seller.sellerPaymentOptions.find(
        (option) => option.type === parsed.paymentMethod,
      );

      await tx.order.create({
        data: {
          orderGroupId: group.id,
          tenantId: tenant.id,
          sellerId,
          code: orderCode,
          sellerNameSnapshot: seller.sellerName,
          whatsappTargetSnapshot:
            seller.sellerWhatsappNumber || tenant.contactPhone || null,
          paymentMethod: parsed.paymentMethod,
          paymentStatus: getInitialPaymentStatus(parsed.paymentMethod),
          subtotal: subtotalPerSeller,
          totalAmount: subtotalPerSeller,
          paymentAccountName: paymentOption?.accountName ?? null,
          paymentAccountNumber: paymentOption?.accountNumber ?? null,
          paymentBankName: paymentOption?.bankName ?? null,
          paymentQrisImageUrl: paymentOption?.qrisImageUrl ?? null,
          paymentInstructions: paymentOption?.instructions ?? null,
          note: normalizeOptionalText(parsed.buyer.note),
          items: {
            create: sellerItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productSlug: item.productSlug,
              imageUrl: item.imageUrl,
              unitPrice: item.price,
              quantity: item.quantity,
              lineTotal: item.price * item.quantity,
            })),
          },
        },
      });
    }

    await syncOrderGroupStatus(tx, group.id);

    return group;
  });

  return createdOrderGroup;
}

export async function getOrderGroupByCode(code: string): Promise<OrderGroupView | null> {
  const orderGroup = await db.orderGroup.findUnique({
    where: { code },
    include: {
      tenant: {
        select: {
          slug: true,
        },
      },
      orders: {
        include: {
          items: true,
          proofs: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!orderGroup) {
    return null;
  }

  return {
    id: orderGroup.id,
    code: orderGroup.code,
    tenantSlug: orderGroup.tenant.slug,
    buyerName: orderGroup.buyerName,
    buyerPhone: orderGroup.buyerPhone,
    buyerEmail: orderGroup.buyerEmail,
    buyerAddress: orderGroup.buyerAddress,
    buyerNote: orderGroup.buyerNote,
    paymentMethod: orderGroup.paymentMethod,
    status: orderGroup.status,
    subtotal: decimalToNumber(orderGroup.subtotal),
    totalAmount: decimalToNumber(orderGroup.totalAmount),
    orders: orderGroup.orders.map((order) => ({
      id: order.id,
      code: order.code,
      sellerName: order.sellerNameSnapshot,
      whatsappTarget: order.whatsappTargetSnapshot,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: decimalToNumber(order.subtotal),
      totalAmount: decimalToNumber(order.totalAmount),
      paymentAccountName: order.paymentAccountName,
      paymentAccountNumber: order.paymentAccountNumber,
      paymentBankName: order.paymentBankName,
      paymentQrisImageUrl: order.paymentQrisImageUrl,
      paymentInstructions: order.paymentInstructions,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        productSlug: item.productSlug,
        imageUrl: item.imageUrl,
        unitPrice: decimalToNumber(item.unitPrice),
        quantity: item.quantity,
        lineTotal: decimalToNumber(item.lineTotal),
      })),
      proofs: order.proofs.map((proof) => ({
        id: proof.id,
        imageUrl: proof.imageUrl,
        note: proof.note,
        status: proof.status,
        reviewNote: proof.reviewNote,
        createdAt: proof.createdAt.toISOString(),
      })),
    })),
  };
}

export async function listOrdersForTenant(tenantId: string) {
  return db.order.findMany({
    where: { tenantId },
    include: {
      orderGroup: true,
      proofs: {
        orderBy: { createdAt: "desc" },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listOrdersForSeller(sellerId: string) {
  return db.order.findMany({
    where: { sellerId },
    include: {
      orderGroup: true,
      proofs: {
        orderBy: { createdAt: "desc" },
      },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

type FulfillmentActor = {
  id: string;
  role: UserRole;
  tenantId?: string | null;
  sellerId?: string | null;
};

export async function updateOrderFulfillment(actor: FulfillmentActor, input: unknown) {
  const parsed = updateFulfillmentStatusSchema.parse(input);
  const order = await db.order.findUnique({
    where: { id: parsed.orderId },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  if (actor.role === "BUMDES_ADMIN" && actor.tenantId !== order.tenantId) {
    throw new Error("Anda tidak memiliki akses ke order ini.");
  }

  if (actor.role === "SELLER" && actor.sellerId !== order.sellerId) {
    throw new Error("Anda tidak memiliki akses ke order ini.");
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: parsed.orderId },
      data: {
        fulfillmentStatus: parsed.status as FulfillmentStatus,
      },
    });

    await syncOrderGroupStatus(tx, order.orderGroupId);
  });
}
