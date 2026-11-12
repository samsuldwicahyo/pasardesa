import { z } from "zod";

export const reviewPaymentProofSchema = z.object({
  orderId: z.string().min(1),
  proofId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT"]),
  reviewNote: z.string().optional(),
});
