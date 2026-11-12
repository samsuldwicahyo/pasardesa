"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { readTenantCart, writeTenantCart } from "@/components/marketplace/cart";

export function AddToCartButton({
  tenantSlug,
  productId,
}: {
  tenantSlug: string;
  productId: string;
}) {
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      onClick={() => {
        const cart = readTenantCart(tenantSlug);
        const existing = cart.find((item) => item.productId === productId);
        const nextCart = existing
          ? cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...cart, { productId, quantity: 1 }];

        writeTenantCart(tenantSlug, nextCart);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? "Ditambahkan" : "Tambah ke cart"}
    </Button>
  );
}
