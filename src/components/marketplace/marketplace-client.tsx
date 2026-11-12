"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { MarketplaceProduct } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  clearTenantCart,
  readTenantCart,
  writeTenantCart,
  type TenantCartItem,
} from "@/components/marketplace/cart";
import { PAYMENT_METHOD_LABELS } from "@/lib/pasardesa";
import { formatRupiah } from "@/lib/utils";

type MarketplaceClientProps = {
  tenant: {
    name: string;
    slug: string;
    description: string | null;
    contactPhone: string | null;
  };
  products: MarketplaceProduct[];
};

export function MarketplaceClient({
  tenant,
  products,
}: MarketplaceClientProps) {
  const [cart, setCart] = useState<TenantCartItem[]>(() =>
    readTenantCart(tenant.slug),
  );

  const cartItems = cart
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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);

  function updateCart(nextCart: TenantCartItem[]) {
    setCart(nextCart);
    writeTenantCart(tenant.slug, nextCart);
  }

  function addToCart(productId: string) {
    const existing = cart.find((item) => item.productId === productId);

    if (existing) {
      updateCart(
        cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
      return;
    }

    updateCart([...cart, { productId, quantity: 1 }]);
  }

  return (
    <div className="shell grid gap-8 py-8 lg:grid-cols-[1.5fr_0.5fr] lg:items-start">
      <section className="space-y-6">
        <div className="panel rounded-[2rem] p-8">
          <Badge>Marketplace Desa</Badge>
          <h1 className="mt-4 text-4xl font-semibold">{tenant.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
            {tenant.description ||
              "Etalase produk untuk UMKM dan seller desa ini."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted">
            <span>Slug: /pasar/{tenant.slug}</span>
            <span>
              Kontak tenant: {tenant.contactPhone || "belum diatur"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="panel rounded-[1.5rem] p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] bg-surface-strong">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted">
                    Tanpa gambar
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-secondary">
                  {product.sellerName}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{product.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                  {product.description || "Belum ada deskripsi produk."}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {product.paymentMethods.map((method) => (
                  <Badge key={method} className="bg-secondary/10 text-secondary">
                    {PAYMENT_METHOD_LABELS[method]}
                  </Badge>
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">
                    {formatRupiah(product.price)}
                  </p>
                  <p className="text-sm text-muted">Stok: {product.stock}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/pasar/${tenant.slug}/produk/${product.slug}`}
                    className="text-right text-sm font-medium text-primary"
                  >
                    Detail
                  </Link>
                  <Button type="button" onClick={() => addToCart(product.id)}>
                    Tambah
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="panel sticky top-6 rounded-[2rem] p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-secondary">
              Cart tamu
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Keranjang belanja</h2>
          </div>
          {cart.length > 0 ? (
            <button
              type="button"
              className="text-sm text-muted"
              onClick={() => {
                clearTenantCart(tenant.slug);
                setCart([]);
              }}
            >
              Kosongkan
            </button>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[1.2rem] border border-foreground/8 bg-white/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted">{item.sellerName}</p>
                  </div>
                  <p className="text-sm font-medium">{formatRupiah(item.lineTotal)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 w-9 rounded-full px-0"
                      onClick={() =>
                        updateCart(
                          cart
                            .map((entry) =>
                              entry.productId === item.id
                                ? { ...entry, quantity: entry.quantity - 1 }
                                : entry,
                            )
                            .filter((entry) => entry.quantity > 0),
                        )
                      }
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 w-9 rounded-full px-0"
                      onClick={() =>
                        updateCart(
                          cart.map((entry) =>
                            entry.productId === item.id
                              ? { ...entry, quantity: entry.quantity + 1 }
                              : entry,
                          ),
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-[1.2rem] border border-dashed border-foreground/10 px-4 py-6 text-sm leading-6 text-muted">
              Cart masih kosong. Tambahkan produk dari tenant ini untuk mulai
              checkout.
            </p>
          )}
        </div>

        <div className="mt-6 border-t border-foreground/10 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total</span>
            <span className="text-2xl font-semibold">{formatRupiah(cartTotal)}</span>
          </div>

          <Link
            href={`/pasar/${tenant.slug}/checkout`}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Lanjut checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}
