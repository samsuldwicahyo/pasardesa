import {
  deriveOrderGroupStatus,
  getCommonPaymentMethods,
} from "@/modules/orders/helpers";
import {
  FulfillmentStatus,
  OrderGroupStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { describe, expect, it } from "vitest";

describe("order helpers", () => {
  it("returns payment intersection in a stable order", () => {
    expect(
      getCommonPaymentMethods([
        [PaymentMethod.WHATSAPP, PaymentMethod.COD, PaymentMethod.QRIS],
        [PaymentMethod.COD, PaymentMethod.WHATSAPP],
      ]),
    ).toEqual([PaymentMethod.WHATSAPP, PaymentMethod.COD]);
  });

  it("marks group as partially paid when some child orders are settled", () => {
    expect(
      deriveOrderGroupStatus([
        {
          paymentStatus: PaymentStatus.APPROVED,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          fulfillmentStatus: FulfillmentStatus.NEW,
        },
        {
          paymentStatus: PaymentStatus.UNPAID,
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          fulfillmentStatus: FulfillmentStatus.NEW,
        },
      ]),
    ).toBe(OrderGroupStatus.PARTIALLY_PAID);
  });
});
