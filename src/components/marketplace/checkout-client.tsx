"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { MarketplaceProduct } from "@/types/domain";
import {
  clearTenantCart,
  readTenantCart,
  type TenantCartItem,
} from "@/components/marketplace/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PAYMENT_METHOD_LABELS } from "@/lib/pasardesa";
import { formatRupiah } from "@/lib/utils";
import { getCommonPaymentMethods } from "@/modules/orders/helpers";

type CheckoutClientProps = {
  tenant: {
    name: string;
    slug: string;
  };
  products: MarketplaceProduct[];
};

export function CheckoutClient({ tenant, products }: CheckoutClientProps) {
  const router = useRouter();
  const [cart] = useState<TenantCartItem[]>(() => readTenantCart(tenant.slug));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const detailedItems = cart
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        ...product,
        quantity: item.quantity,
        lineTotal: item.quantity * product.price,
      };
    })
    .filter(
      (
        item,
      ): item is MarketplaceProduct & { quantity: number; lineTotal: number } =>
        item !== null,
    );

  const commonPaymentMethods = getCommonPaymentMethods(
    Array.from(
      new Map(
        detailedItems.map((item) => [item.sellerId, item.paymentMethods]),
      ).values(),
    ),
  );
  const selectedPaymentMethod =
    paymentMethod && commonPaymentMethods.includes(paymentMethod as never)
      ? paymentMethod
      : (commonPaymentMethods[0] ?? "");

  const total = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  if (detailedItems.length === 0) {
    return (
      <div className="shell py-10">
        <div className="panel rounded-[2rem] p-8 text-center">
          <h1 className="text-3xl font-semibold">Cart masih kosong</h1>
          <p className="mt-3 text-muted">
            Tambahkan produk dulu dari marketplace tenant ini.
          </p>
          <Link
            href={`/pasar/${tenant.slug}`}
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Kembali ke marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shell grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <div className="panel rounded-[2rem] p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
            Checkout tamu
          </p>
          <h1 className="mt-2 text-4xl font-semibold">Konfirmasi pesanan</h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            Cart Anda akan dipecah menjadi seller-order terpisah jika berisi
            produk dari lebih dari satu seller.
          </p>
        </div>

        <form
          className="panel rounded-[2rem] p-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsSubmitting(true);
            setError("");

            const form = new FormData(event.currentTarget);
            const payload = {
              tenantSlug: tenant.slug,
              items: cart,
              buyer: {
                name: String(form.get("name") || ""),
                phone: String(form.get("phone") || ""),
                email: String(form.get("email") || ""),
                address: String(form.get("address") || ""),
                note: String(form.get("note") || ""),
              },
              paymentMethod: selectedPaymentMethod,
            };

            try {
              const response = await fetch("/api/public/checkout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              });

              const json = (await response.json()) as {
                error?: string;
                groupCode?: string;
              };

              if (!response.ok || !json.groupCode) {
                throw new Error(json.error || "Checkout gagal.");
              }

              clearTenantCart(tenant.slug);
              router.push(`/pasar/${tenant.slug}/pesanan/${json.groupCode}`);
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Checkout gagal.",
              );
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Nama pembeli" required />
            <Input name="phone" placeholder="No. WhatsApp pembeli" required />
            <Input name="email" type="email" placeholder="Email opsional" />
            <Select
              value={selectedPaymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              required
            >
              {commonPaymentMethods.map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </option>
              ))}
            </Select>
          </div>

          <Textarea name="address" placeholder="Alamat pembeli" required />
          <Textarea name="note" placeholder="Catatan tambahan untuk seller" />

          {commonPaymentMethods.length === 0 ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              Cart ini tidak punya irisan metode pembayaran. Hapus sebagian item
              atau pilih produk seller yang mendukung metode sama.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || commonPaymentMethods.length === 0}
          >
            {isSubmitting ? "Membuat order..." : "Buat order"}
          </Button>
        </form>
      </section>

      <aside className="panel rounded-[2rem] p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
          Ringkasan
        </p>
        <div className="mt-5 space-y-4">
          {detailedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted">{item.sellerName}</p>
                </div>
                <p className="text-sm font-medium">{item.quantity}x</p>
              </div>
              <p className="mt-3 text-sm text-muted">
                {formatRupiah(item.price)} per item
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatRupiah(item.lineTotal)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-foreground/10 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total</span>
            <span className="text-2xl font-semibold">{formatRupiah(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
