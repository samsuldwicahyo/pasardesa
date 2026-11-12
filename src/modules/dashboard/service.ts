import { PaymentMethod, PaymentStatus, FulfillmentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/utils";

const omzetWhere = {
  OR: [
    {
      paymentMethod: {
        in: [PaymentMethod.BANK_TRANSFER, PaymentMethod.QRIS],
      },
      paymentStatus: PaymentStatus.APPROVED,
    },
    {
      paymentMethod: {
        in: [PaymentMethod.COD, PaymentMethod.WHATSAPP],
      },
      fulfillmentStatus: FulfillmentStatus.COMPLETED,
    },
  ],
};

export async function getSuperAdminMetrics() {
  const [tenantCount, sellerCount, productCount, orderCount] = await Promise.all([
    db.tenant.count(),
    db.seller.count(),
    db.product.count(),
    db.order.count(),
  ]);

  return {
    tenantCount,
    sellerCount,
    productCount,
    orderCount,
  };
}

export async function getTenantDashboardStats(tenantId: string) {
  const [sellerCount, productCount, orderCount, omzet] = await Promise.all([
    db.seller.count({ where: { tenantId } }),
    db.product.count({ where: { tenantId } }),
    db.order.count({ where: { tenantId } }),
    db.order.aggregate({
      where: {
        tenantId,
        ...omzetWhere,
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    sellerCount,
    productCount,
    orderCount,
    omzet: decimalToNumber(omzet._sum.totalAmount),
  };
}

export async function getSellerDashboardStats(sellerId: string) {
  const [productCount, orderCount, omzet] = await Promise.all([
    db.product.count({ where: { sellerId } }),
    db.order.count({ where: { sellerId } }),
    db.order.aggregate({
      where: {
        sellerId,
        ...omzetWhere,
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    productCount,
    orderCount,
    omzet: decimalToNumber(omzet._sum.totalAmount),
  };
}
