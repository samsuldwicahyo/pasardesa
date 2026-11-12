import { PaymentMethod, UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateTemporaryPassword, hashPassword } from "@/modules/auth/service";
import {
  createSellerSchema,
  updateSellerProfileSchema,
  upsertSellerPaymentOptionSchema,
} from "@/modules/sellers/schemas";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function createDefaultPaymentOptions(sellerId: string) {
  await db.sellerPaymentOption.createMany({
    data: [
      {
        sellerId,
        type: PaymentMethod.WHATSAPP,
        isActive: true,
      },
      {
        sellerId,
        type: PaymentMethod.COD,
        isActive: true,
      },
      {
        sellerId,
        type: PaymentMethod.BANK_TRANSFER,
        isActive: false,
      },
      {
        sellerId,
        type: PaymentMethod.QRIS,
        isActive: false,
      },
    ],
  });
}

export async function listSellersForTenant(tenantId: string) {
  return db.seller.findMany({
    where: { tenantId },
    include: {
      user: true,
      paymentOptions: {
        orderBy: { type: "asc" },
      },
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSellerByUserId(userId: string) {
  return db.seller.findUnique({
    where: { userId },
    include: {
      tenant: true,
      user: true,
      paymentOptions: {
        orderBy: { type: "asc" },
      },
    },
  });
}

export async function createSeller(tenantId: string, input: unknown) {
  const parsed = createSellerSchema.parse(input);
  const temporaryPassword = generateTemporaryPassword();

  const seller = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        name: parsed.name.trim(),
        email: parsed.email.toLowerCase(),
        phone: normalizeOptionalText(parsed.phone),
        passwordHash: await hashPassword(temporaryPassword),
        role: UserRole.SELLER,
        mustChangePassword: true,
        isActive: true,
      },
    });

    const createdSeller = await tx.seller.create({
      data: {
        tenantId,
        userId: user.id,
        name: parsed.name.trim(),
        slug: slugify(parsed.slug || parsed.name),
        description: normalizeOptionalText(parsed.description),
        phone: normalizeOptionalText(parsed.phone),
        whatsappNumber: normalizeOptionalText(parsed.whatsappNumber),
        address: normalizeOptionalText(parsed.address),
      },
    });

    return createdSeller;
  });

  await createDefaultPaymentOptions(seller.id);

  return { seller, generatedPassword: temporaryPassword };
}

export async function updateSellerProfile(userId: string, input: unknown) {
  const parsed = updateSellerProfileSchema.parse(input);
  const seller = await db.seller.findUniqueOrThrow({
    where: { userId },
  });

  return db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: seller.userId },
      data: {
        phone: normalizeOptionalText(parsed.phone),
      },
    });

    return tx.seller.update({
      where: { id: seller.id },
      data: {
        description: normalizeOptionalText(parsed.description),
        phone: normalizeOptionalText(parsed.phone),
        whatsappNumber: normalizeOptionalText(parsed.whatsappNumber),
        address: normalizeOptionalText(parsed.address),
      },
    });
  });
}

export async function upsertSellerPaymentOption(sellerId: string, input: unknown) {
  const parsed = upsertSellerPaymentOptionSchema.parse(input);

  return db.sellerPaymentOption.upsert({
    where: {
      sellerId_type: {
        sellerId,
        type: parsed.type,
      },
    },
    update: {
      isActive: parsed.isActive,
      accountName: normalizeOptionalText(parsed.accountName),
      accountNumber: normalizeOptionalText(parsed.accountNumber),
      bankName: normalizeOptionalText(parsed.bankName),
      qrisImageUrl: normalizeOptionalText(parsed.qrisImageUrl),
      instructions: normalizeOptionalText(parsed.instructions),
    },
    create: {
      sellerId,
      type: parsed.type,
      isActive: parsed.isActive,
      accountName: normalizeOptionalText(parsed.accountName),
      accountNumber: normalizeOptionalText(parsed.accountNumber),
      bankName: normalizeOptionalText(parsed.bankName),
      qrisImageUrl: normalizeOptionalText(parsed.qrisImageUrl),
      instructions: normalizeOptionalText(parsed.instructions),
    },
  });
}
