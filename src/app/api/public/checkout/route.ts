import { NextResponse } from "next/server";

import { createPublicCheckout } from "@/modules/orders/service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderGroup = await createPublicCheckout(body);

    return NextResponse.json({
      groupCode: orderGroup.code,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Checkout tidak berhasil.",
      },
      { status: 400 },
    );
  }
}
