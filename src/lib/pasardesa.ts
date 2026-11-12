import {
  FulfillmentStatus,
  OrderGroupStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  WHATSAPP: "WhatsApp",
  BANK_TRANSFER: "Bank Transfer",
  QRIS: "QRIS",
  COD: "COD",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NOT_REQUIRED: "Tidak perlu upload",
  UNPAID: "Menunggu bayar",
  PENDING_REVIEW: "Menunggu review",
  APPROVED: "Pembayaran disetujui",
  REJECTED: "Pembayaran ditolak",
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  NEW: "Baru",
  PROCESSING: "Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export const ORDER_GROUP_STATUS_LABELS: Record<OrderGroupStatus, string> = {
  NEW: "Baru",
  PARTIALLY_PAID: "Sebagian terbayar",
  PAID: "Terbayar",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export function isManualPaymentMethod(method: PaymentMethod) {
  return method === PaymentMethod.BANK_TRANSFER || method === PaymentMethod.QRIS;
}
