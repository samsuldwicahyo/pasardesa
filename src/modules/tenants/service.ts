import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateTemporaryPassword, hashPassword } from "@/modules/auth/service";
import {
  createTenantSchema,
  updateTenantProfileSchema,
} from "@/modules/tenants/schemas";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function listActiveTenants() {
  return db.tenant.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      contactPhone: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listTenantsWithStats() {
  return db.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          sellers: true,
          products: true,
          orders: true,
        },
      },
    },
  });
}

export async function getTenantBySlug(slug: string) {
  return db.tenant.findFirst({
    where: { slug, isActive: true },
  });
}

export async function getTenantById(id: string) {
  return db.tenant.findUnique({
    where: { id },
  });
}

export async function createTenant(input: unknown) {
  const parsed = createTenantSchema.parse(input);
  const slug = slugify(parsed.slug || parsed.name);
  const temporaryPassword = generateTemporaryPassword();

  const tenant = await db.$transaction(async (tx) => {
    const createdTenant = await tx.tenant.create({
      data: {
        name: parsed.name.trim(),
        slug,
        description: normalizeOptionalText(parsed.description),
        contactPhone: normalizeOptionalText(parsed.contactPhone),
        contactEmail: normalizeOptionalText(parsed.contactEmail),
      },
    });

    await tx.user.create({
      data: {
        tenantId: createdTenant.id,
        name: parsed.adminName.trim(),
        email: parsed.adminEmail.toLowerCase(),
        phone: normalizeOptionalText(parsed.adminPhone),
        passwordHash: await hashPassword(temporaryPassword),
        role: UserRole.BUMDES_ADMIN,
        isActive: true,
        mustChangePassword: true,
      },
    });

    return createdTenant;
  });

  return { tenant, generatedPassword: temporaryPassword };
}

export async function updateTenantProfile(tenantId: string, input: unknown) {
  const parsed = updateTenantProfileSchema.parse(input);

  return db.tenant.update({
    where: { id: tenantId },
    data: {
      description: normalizeOptionalText(parsed.description),
      address: normalizeOptionalText(parsed.address),
      contactPhone: normalizeOptionalText(parsed.contactPhone),
      contactEmail: normalizeOptionalText(parsed.contactEmail),
    },
  });
}
