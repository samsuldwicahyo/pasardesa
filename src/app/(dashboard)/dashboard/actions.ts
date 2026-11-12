"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

import { signIn, signOut, requireAuth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadFileToCloudinary } from "@/lib/cloudinary";
import { changePasswordSchema } from "@/modules/auth/schemas";
import { hashPassword, verifyPassword } from "@/modules/auth/service";
import { updateOrderFulfillment } from "@/modules/orders/service";
import { reviewPaymentProof } from "@/modules/payments/service";
import { createProduct } from "@/modules/products/service";
import { createSeller, updateSellerProfile, upsertSellerPaymentOption } from "@/modules/sellers/service";
import { createTenant, updateTenantProfile } from "@/modules/tenants/service";
import type { ActionState } from "@/types/forms";

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) || "");
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formValue(formData, "email"),
      password: formValue(formData, "password"),
      redirectTo: formValue(formData, "callbackUrl") || "/dashboard",
    });

    return { success: "Login berhasil." };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password tidak valid." };
    }

    throw error;
  }
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/",
  });
}

export async function createTenantAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN"]);

  try {
    const result = await createTenant({
      name: formValue(formData, "name"),
      slug: formValue(formData, "slug"),
      description: formValue(formData, "description"),
      contactPhone: formValue(formData, "contactPhone"),
      contactEmail: formValue(formData, "contactEmail"),
      adminName: formValue(formData, "adminName"),
      adminEmail: formValue(formData, "adminEmail"),
      adminPhone: formValue(formData, "adminPhone"),
    });

    revalidatePath("/dashboard/super-admin/tenants");

    return {
      success: `Tenant ${result.tenant.name} berhasil dibuat.`,
      generatedPassword: result.generatedPassword,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal membuat tenant.",
    };
  }
}

export async function updateTenantProfileAction(formData: FormData) {
  const session = await requireRole(["BUMDES_ADMIN"]);

  if (!session.user.tenantId) {
    throw new Error("Tenant admin tidak memiliki tenant aktif.");
  }

  await updateTenantProfile(session.user.tenantId, {
    description: formValue(formData, "description"),
    address: formValue(formData, "address"),
    contactPhone: formValue(formData, "contactPhone"),
    contactEmail: formValue(formData, "contactEmail"),
  });

  revalidatePath("/dashboard/tenant");
}

export async function createSellerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(["BUMDES_ADMIN"]);

  if (!session.user.tenantId) {
    return { error: "Tenant admin tidak memiliki tenant aktif." };
  }

  try {
    const result = await createSeller(session.user.tenantId, {
      name: formValue(formData, "name"),
      slug: formValue(formData, "slug"),
      description: formValue(formData, "description"),
      email: formValue(formData, "email"),
      phone: formValue(formData, "phone"),
      whatsappNumber: formValue(formData, "whatsappNumber"),
      address: formValue(formData, "address"),
    });

    revalidatePath("/dashboard/tenant/sellers");

    return {
      success: `Seller ${result.seller.name} berhasil dibuat.`,
      generatedPassword: result.generatedPassword,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal membuat seller.",
    };
  }
}

export async function updateSellerProfileAction(formData: FormData) {
  const session = await requireRole(["SELLER"]);

  await updateSellerProfile(session.user.id, {
    description: formValue(formData, "description"),
    phone: formValue(formData, "phone"),
    whatsappNumber: formValue(formData, "whatsappNumber"),
    address: formValue(formData, "address"),
  });

  revalidatePath("/dashboard/seller");
}

export async function upsertSellerPaymentOptionAction(formData: FormData) {
  const session = await requireRole(["SELLER"]);

  if (!session.user.sellerId) {
    throw new Error("Akun ini belum terhubung ke seller.");
  }

  await upsertSellerPaymentOption(session.user.sellerId, {
    type: formValue(formData, "type"),
    isActive: formData.get("isActive") === "on",
    accountName: formValue(formData, "accountName"),
    accountNumber: formValue(formData, "accountNumber"),
    bankName: formValue(formData, "bankName"),
    qrisImageUrl: formValue(formData, "qrisImageUrl"),
    instructions: formValue(formData, "instructions"),
  });

  revalidatePath("/dashboard/seller");
}

export async function createProductAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireRole(["SELLER"]);

  if (!session.user.sellerId || !session.user.tenantId) {
    return { error: "Akun ini belum terhubung ke seller aktif." };
  }

  try {
    const image = formData.get("image");
    let uploadedImage:
      | {
          url: string;
          publicId: string | null;
        }
      | undefined;

    if (image instanceof File && image.size > 0) {
      uploadedImage = await uploadFileToCloudinary(
        image,
        `pasardesa/products/${session.user.sellerId}`,
      );
    }

    await createProduct(
      session.user.sellerId,
      session.user.tenantId,
      {
        name: formValue(formData, "name"),
        slug: formValue(formData, "slug"),
        description: formValue(formData, "description"),
        sku: formValue(formData, "sku"),
        price: formValue(formData, "price"),
        stock: formValue(formData, "stock"),
        status: formValue(formData, "status"),
        imageAltText: formValue(formData, "imageAltText"),
      },
      uploadedImage,
    );

    revalidatePath("/dashboard/seller/products");

    return { success: "Produk berhasil dibuat." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Gagal membuat produk.",
    };
  }
}

export async function reviewPaymentProofAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "BUMDES_ADMIN", "SELLER"]);

  await reviewPaymentProof(
    {
      id: session.user.id,
      role: session.user.role,
      tenantId: session.user.tenantId,
      sellerId: session.user.sellerId,
    },
    {
      orderId: formValue(formData, "orderId"),
      proofId: formValue(formData, "proofId"),
      action: formValue(formData, "action"),
      reviewNote: formValue(formData, "reviewNote"),
    },
  );

  revalidatePath(
    session.user.role === "SELLER"
      ? "/dashboard/seller/orders"
      : "/dashboard/tenant/orders",
  );
}

export async function updateOrderFulfillmentAction(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "BUMDES_ADMIN", "SELLER"]);

  await updateOrderFulfillment(
    {
      id: session.user.id,
      role: session.user.role,
      tenantId: session.user.tenantId,
      sellerId: session.user.sellerId,
    },
    {
      orderId: formValue(formData, "orderId"),
      status: formValue(formData, "status"),
    },
  );

  revalidatePath(
    session.user.role === "SELLER"
      ? "/dashboard/seller/orders"
      : "/dashboard/tenant/orders",
  );
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAuth();

  try {
    const parsed = changePasswordSchema.parse({
      currentPassword: formValue(formData, "currentPassword"),
      newPassword: formValue(formData, "newPassword"),
      confirmPassword: formValue(formData, "confirmPassword"),
    });

    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const isValid = await verifyPassword(
      parsed.currentPassword,
      user.passwordHash,
    );

    if (!isValid) {
      return { error: "Password saat ini tidak sesuai." };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(parsed.newPassword),
        mustChangePassword: false,
      },
    });

    revalidatePath("/dashboard");

    return { success: "Password berhasil diperbarui." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui password.",
    };
  }
}
