import { z } from "zod";

export const createTenantSchema = z.object({
  name: z.string().min(3),
  slug: z.string().optional(),
  description: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  adminName: z.string().min(3),
  adminEmail: z.email(),
  adminPhone: z.string().optional(),
});

export const updateTenantProfileSchema = z.object({
  description: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
});
