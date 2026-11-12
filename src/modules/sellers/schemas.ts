import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const createSellerSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional(),
  email: z.email(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
});

export const updateSellerProfileSchema = z.object({
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  address: z.string().optional(),
});

export const upsertSellerPaymentOptionSchema = z.object({
  type: z.enum(PaymentMethod),
  isActive: z.boolean(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  qrisImageUrl: z.string().optional(),
  instructions: z.string().optional(),
});
