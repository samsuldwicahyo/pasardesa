import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentStatus } from "@prisma/client";

import { PaymentProofUploadForm } from "@/components/marketplace/payment-proof-upload-form";
import { Badge } from "@/components/ui/badge";
import {
  FULFILLMENT_STATUS_LABELS,
  ORDER_GROUP_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  isManualPaymentMethod,
} from "@/lib/pasardesa";
import { formatRupiah } from "@/lib/utils";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";
import { getOrderGroupByCode } from "@/modules/orders/service";

export const dynamic = "force-dynamic";

export default async function OrderGroupPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; groupCode: string }>;
}) {
  const { tenantSlug, groupCode } = await params;
  const orderGroup = await getOrderGroupByCode(groupCode);

  if (!orderGroup || orderGroup.tenantSlug !== tenantSlug) {
    notFound();
  }

  return (
    <div className="shell space-y-6 py-8">
      <div className="panel rounded-[2rem] p-8">
        <Badge>Status grup</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Pesanan {orderGroup.code}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Order ini dibuat atas nama {orderGroup.buyerName}. Jika cart berisi
          lebih dari satu seller, rincian di bawah akan tampil per seller-order
          dengan nomor WhatsApp dan instruksi pembayaran masing-masing.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4">
            <p className="text-sm text-muted">Status grup</p>
            <p className="mt-2 font-semibold">
              {ORDER_GROUP_STATUS_LABELS[orderGroup.status]}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4">
            <p className="text-sm text-muted">Metode checkout</p>
            <p className="mt-2 font-semibold">
              {PAYMENT_METHOD_LABELS[orderGroup.paymentMethod]}
            </p>
          </div>
          <div className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4">
            <p className="text-sm text-muted">Buyer</p>
            <p className="mt-2 font-semibold">{orderGroup.buyerPhone}</p>
          </div>
          <div className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4">
            <p className="text-sm text-muted">Total grup</p>
            <p className="mt-2 font-semibold">{formatRupiah(orderGroup.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link href={`/pasar/${tenantSlug}`} className="text-sm font-medium text-primary">
            Kembali ke marketplace
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {orderGroup.orders.map((order) => {
          const latestProof = order.proofs[0];
          const canUploadManualProof =
            isManualPaymentMethod(order.paymentMethod) &&
            order.paymentStatus !== PaymentStatus.APPROVED &&
            order.paymentStatus !== PaymentStatus.PENDING_REVIEW;

          return (
            <article key={order.id} className="panel rounded-[1.8rem] p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
                    {order.code}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{order.sellerName}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Badge>
                    <Badge className="bg-primary/12">
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </Badge>
                    <Badge className="bg-secondary/10 text-secondary">
                      {FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {order.whatsappTarget ? (
                    <Link
                      href={buildWhatsAppLink(
                        order.whatsappTarget,
                        buildWhatsAppMessage(orderGroup, order),
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      Hubungi via WhatsApp
                    </Link>
                  ) : null}
                  <p className="text-right text-sm font-semibold">
                    {formatRupiah(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-muted">
                          {item.quantity} x {formatRupiah(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatRupiah(item.lineTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {isManualPaymentMethod(order.paymentMethod) ? (
                <div className="mt-6 rounded-[1.2rem] border border-foreground/8 bg-white/80 p-5">
                  <h3 className="font-semibold">Instruksi pembayaran</h3>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                    <p>
                      Nama akun: {order.paymentAccountName || "Belum diatur seller"}
                    </p>
                    <p>
                      Rekening/nomor: {order.paymentAccountNumber || "Belum diatur seller"}
                    </p>
                    <p>Bank: {order.paymentBankName || "Belum diatur seller"}</p>
                    <p>
                      Instruksi: {order.paymentInstructions || "Tidak ada instruksi tambahan."}
                    </p>
                    {order.paymentQrisImageUrl ? (
                      <Link
                        href={order.paymentQrisImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary"
                      >
                        Lihat QRIS
                      </Link>
                    ) : null}
                  </div>

                  {canUploadManualProof ? (
                    <PaymentProofUploadForm orderCode={order.code} />
                  ) : latestProof ? (
                    <div className="mt-5 rounded-[1.2rem] border border-foreground/8 bg-surface p-4 text-sm text-muted">
                      Bukti terbaru:{" "}
                      <span className="font-medium text-foreground">
                        {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                      </span>
                      {latestProof.reviewNote ? ` - ${latestProof.reviewNote}` : ""}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {order.proofs.length > 0 ? (
                <div className="mt-6">
                  <h3 className="font-semibold">Riwayat bukti bayar</h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {order.proofs.map((proof) => (
                      <div
                        key={proof.id}
                        className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4 text-sm"
                      >
                        <Link
                          href={proof.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary"
                        >
                          Lihat bukti
                        </Link>
                        <p className="mt-2 text-muted">
                          Status: {proof.status}
                        </p>
                        {proof.note ? (
                          <p className="mt-2 text-muted">Catatan: {proof.note}</p>
                        ) : null}
                        {proof.reviewNote ? (
                          <p className="mt-2 text-muted">
                            Review: {proof.reviewNote}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
