import { ProductStatus } from "@prisma/client";
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  status: z.enum(ProductStatus).default(ProductStatus.PUBLISHED),
  imageAltText: z.string().optional(),
});
