import { NextResponse } from "next/server";

import { uploadPaymentProof } from "@/modules/payments/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderCode: string }> },
) {
  try {
    const { orderCode } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "File bukti pembayaran wajib diunggah." },
        { status: 400 },
      );
    }

    await uploadPaymentProof(orderCode, file, String(formData.get("note") || ""));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Upload bukti bayar gagal.",
      },
      { status: 400 },
    );
  }
}
