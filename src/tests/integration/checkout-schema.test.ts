import { describe, expect, it } from "vitest";

import { checkoutSchema } from "@/modules/orders/schemas";

describe("checkout schema", () => {
  it("rejects empty carts", () => {
    const result = checkoutSchema.safeParse({
      tenantSlug: "desa-maju",
      items: [],
      buyer: {
        name: "Buyer",
        phone: "08123",
        email: "",
        address: "Jl. Raya Nomor 1",
      },
      paymentMethod: "COD",
    });

    expect(result.success).toBe(false);
  });
});
