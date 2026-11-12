import {
  FulfillmentStatus,
  OrderGroupStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

const PAYMENT_METHOD_ORDER: PaymentMethod[] = [
  PaymentMethod.WHATSAPP,
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.QRIS,
  PaymentMethod.COD,
];

export function getInitialPaymentStatus(method: PaymentMethod) {
  if (method === PaymentMethod.WHATSAPP || method === PaymentMethod.COD) {
    return PaymentStatus.NOT_REQUIRED;
  }

  return PaymentStatus.UNPAID;
}

export function getCommonPaymentMethods(methodSets: PaymentMethod[][]) {
  if (methodSets.length === 0) {
    return [];
  }

  const [first, ...rest] = methodSets;
  const intersection = new Set(first);

  for (const methods of rest) {
    for (const item of [...intersection]) {
      if (!methods.includes(item)) {
        intersection.delete(item);
      }
    }
  }

  return PAYMENT_METHOD_ORDER.filter((method) => intersection.has(method));
}

export function groupItemsBySeller<
  T extends { sellerId: string; quantity: number; price: number; productId: string },
>(items: T[]) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    accumulator[item.sellerId] ??= [];
    accumulator[item.sellerId].push(item);
    return accumulator;
  }, {});
}

export function generateReadableCode(prefix: "PDG" | "PDO") {
  const now = new Date();
  const timestamp = [
    now.getFullYear().toString().slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");

  return `${prefix}-${timestamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export function deriveOrderGroupStatus(
  orders: Array<{
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    fulfillmentStatus: FulfillmentStatus;
  }>,
) {
  if (orders.length === 0) {
    return OrderGroupStatus.NEW;
  }

  if (orders.every((order) => order.fulfillmentStatus === FulfillmentStatus.COMPLETED)) {
    return OrderGroupStatus.COMPLETED;
  }

  const settled = orders.filter(
    (order) =>
      order.paymentStatus === PaymentStatus.APPROVED ||
      order.paymentStatus === PaymentStatus.NOT_REQUIRED,
  );

  const approvedManual = orders.filter(
    (order) => order.paymentStatus === PaymentStatus.APPROVED,
  );

  if (
    approvedManual.length === 0 &&
    orders.every((order) => order.paymentStatus === PaymentStatus.NOT_REQUIRED)
  ) {
    return OrderGroupStatus.NEW;
  }

  if (settled.length === orders.length) {
    return OrderGroupStatus.PAID;
  }

  if (settled.length > 0) {
    return OrderGroupStatus.PARTIALLY_PAID;
  }

  return OrderGroupStatus.NEW;
}
