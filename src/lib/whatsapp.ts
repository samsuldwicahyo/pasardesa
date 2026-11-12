import type { OrderGroupView, OrderStatusCard } from "@/types/domain";
import { formatRupiah } from "@/lib/utils";

export function normalizeWhatsAppNumber(value: string) {
  const digits = value.replace(/[^\d]/g, "");

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  return digits;
}

export function buildWhatsAppMessage(
  orderGroup: Pick<OrderGroupView, "code" | "buyerName">,
  order: Pick<OrderStatusCard, "code" | "sellerName" | "items" | "totalAmount">,
) {
  const lines = [
    `Halo ${order.sellerName},`,
    `Saya ${orderGroup.buyerName}.`,
    `Saya sudah membuat pesanan PasarDesa.`,
    `Kode grup: ${orderGroup.code}`,
    `Kode seller-order: ${order.code}`,
    "",
    "Ringkasan item:",
    ...order.items.map(
      (item) =>
        `- ${item.productName} x${item.quantity} (${formatRupiah(item.lineTotal)})`,
    ),
    "",
    `Total: ${formatRupiah(order.totalAmount)}`,
  ];

  return lines.join("\n");
}

export function buildWhatsAppLink(number: string, message: string) {
  const normalized = normalizeWhatsAppNumber(number);
  const query = new URLSearchParams({ text: message });

  return `https://wa.me/${normalized}?${query.toString()}`;
}
