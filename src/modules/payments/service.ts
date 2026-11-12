import {
  PaymentMethod,
  PaymentProofStatus,
  PaymentStatus,
  type UserRole,
} from "@prisma/client";

import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { reviewPaymentProofSchema } from "@/modules/payments/schemas";
import { syncOrderGroupStatus } from "@/modules/orders/service";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function uploadPaymentProof(orderCode: string, file: File, note?: string) {
  const order = await db.order.findUnique({
    where: { code: orderCode },
    include: {
      proofs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  if (
    order.paymentMethod !== PaymentMethod.BANK_TRANSFER &&
    order.paymentMethod !== PaymentMethod.QRIS
  ) {
    throw new Error("Order ini tidak menerima upload bukti pembayaran.");
  }

  const latestProof = order.proofs[0];

  if (latestProof && latestProof.status !== PaymentProofStatus.REJECTED) {
    throw new Error(
      "Bukti bayar baru hanya bisa diunggah setelah bukti sebelumnya ditolak.",
    );
  }

  const uploaded = await uploadFileToCloudinary(
    file,
    `pasardesa/orders/${order.code}`,
  );

  const proof = await db.$transaction(async (tx) => {
    const createdProof = await tx.paymentProof.create({
      data: {
        orderId: order.id,
        imageUrl: uploaded.url,
        cloudinaryPublicId: uploaded.publicId,
        note: normalizeOptionalText(note),
        status: PaymentProofStatus.PENDING,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.PENDING_REVIEW,
      },
    });

    await syncOrderGroupStatus(tx, order.orderGroupId);

    return createdProof;
  });

  return proof;
}

type ReviewActor = {
  id: string;
  role: UserRole;
  tenantId?: string | null;
  sellerId?: string | null;
};

export async function reviewPaymentProof(actor: ReviewActor, input: unknown) {
  const parsed = reviewPaymentProofSchema.parse(input);
  const order = await db.order.findUnique({
    where: { id: parsed.orderId },
    include: {
      proofs: true,
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan.");
  }

  if (actor.role === "BUMDES_ADMIN" && actor.tenantId !== order.tenantId) {
    throw new Error("Anda tidak memiliki akses ke order ini.");
  }

  if (actor.role === "SELLER" && actor.sellerId !== order.sellerId) {
    throw new Error("Anda tidak memiliki akses ke order ini.");
  }

  const targetProof = order.proofs.find((proof) => proof.id === parsed.proofId);

  if (!targetProof) {
    throw new Error("Bukti pembayaran tidak ditemukan.");
  }

  return db.$transaction(async (tx) => {
    await tx.paymentProof.update({
      where: { id: parsed.proofId },
      data: {
        status:
          parsed.action === "APPROVE"
            ? PaymentProofStatus.APPROVED
            : PaymentProofStatus.REJECTED,
        reviewedByUserId: actor.id,
        reviewedAt: new Date(),
        reviewNote: normalizeOptionalText(parsed.reviewNote),
      },
    });

    await tx.order.update({
      where: { id: parsed.orderId },
      data: {
        paymentStatus:
          parsed.action === "APPROVE"
            ? PaymentStatus.APPROVED
            : PaymentStatus.REJECTED,
      },
    });

    await syncOrderGroupStatus(tx, order.orderGroupId);
  });
}
