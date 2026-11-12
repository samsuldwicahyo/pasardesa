import { reviewPaymentProofAction, updateOrderFulfillmentAction } from "@/app/(dashboard)/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  FULFILLMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/pasardesa";
import { formatRupiah } from "@/lib/utils";
import { requireRole } from "@/lib/auth";
import { listOrdersForTenant } from "@/modules/orders/service";

export const dynamic = "force-dynamic";

export default async function TenantOrdersPage() {
  const session = await requireRole(["BUMDES_ADMIN"]);

  if (!session.user.tenantId) {
    throw new Error("Tenant admin tidak memiliki tenant aktif.");
  }

  const orders = await listOrdersForTenant(session.user.tenantId);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Order tenant
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Semua seller-order tenant</h1>
      </div>

      {orders.map((order) => (
        <article key={order.id} className="panel rounded-[1.6rem] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
                {order.code}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{order.sellerNameSnapshot}</h2>
              <p className="mt-2 text-sm text-muted">
                Buyer: {order.orderGroup.buyerName} · {order.orderGroup.buyerPhone}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Badge>
                <Badge>{PAYMENT_STATUS_LABELS[order.paymentStatus]}</Badge>
                <Badge className="bg-secondary/10 text-secondary">
                  {FULFILLMENT_STATUS_LABELS[order.fulfillmentStatus]}
                </Badge>
              </div>
            </div>
            <p className="text-2xl font-semibold">{formatRupiah(Number(order.totalAmount))}</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4"
              >
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-muted">
                  {item.quantity} x {formatRupiah(Number(item.unitPrice))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <form action={updateOrderFulfillmentAction} className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4 space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <p className="font-semibold">Update fulfillment</p>
              <Select name="status" defaultValue={order.fulfillmentStatus}>
                <option value="NEW">NEW</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </Select>
              <Button type="submit">Simpan status</Button>
            </form>

            <div className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4 space-y-3">
              <p className="font-semibold">Review bukti pembayaran</p>
              {order.proofs.length > 0 ? (
                order.proofs.map((proof) => (
                  <form key={proof.id} action={reviewPaymentProofAction} className="space-y-3 rounded-2xl border border-foreground/8 p-4">
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="proofId" value={proof.id} />
                    <p className="text-sm text-muted">
                      Proof status: {proof.status}
                    </p>
                    <a
                      href={proof.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-primary"
                    >
                      Lihat bukti
                    </a>
                    <Input name="reviewNote" placeholder="Catatan review opsional" />
                    <div className="flex gap-3">
                      <Button type="submit" name="action" value="APPROVE">
                        Approve
                      </Button>
                      <Button type="submit" name="action" value="REJECT" variant="secondary">
                        Reject
                      </Button>
                    </div>
                  </form>
                ))
              ) : (
                <p className="text-sm text-muted">Belum ada bukti pembayaran.</p>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
