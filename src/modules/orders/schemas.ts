import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const checkoutSchema = z.object({
  tenantSlug: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1),
  buyer: z.object({
    name: z.string().min(3),
    phone: z.string().min(8),
    email: z.string().optional(),
    address: z.string().min(10),
    note: z.string().optional(),
  }),
  paymentMethod: z.enum(PaymentMethod),
});

export const updateFulfillmentStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["NEW", "PROCESSING", "COMPLETED", "CANCELLED"]),
});
